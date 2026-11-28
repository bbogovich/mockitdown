/**
 * The design session (R-EDIT-006): one plain object that the design-tool components share. It holds a
 * design document, the active mockup, the selection (sibling view nodes of the active mockup), the
 * hovered node and, per mockup, its last valid syntax tree and its current diagnostics, and it tells
 * its listeners about every state change (C4, C5). It touches no DOM (A-WEB-4.K1): the components turn
 * its notifications into DOM events (C7, {@link DESIGN_EVENTS}).
 *
 * A mockup's code changes only through the session (A-WEB-4.K2): {@link DesignSession.apply} for an
 * edit operation, {@link DesignSession.setCode} for code typed as text. The document is the live
 * object the session was given; write it with `writeDesign(session.document)`.
 *
 * Every change is a step of the session's undo history (R-EDIT-007): {@link DesignSession.undo} and
 * {@link DesignSession.redo} revert and reapply one step with the selection from before and after it,
 * and changes made with one coalescing key in quick succession form one step.
 */

import { check } from "../core/api.js";
import { assetsLoaded } from "../core/assets.js";
import { Diagnostic, MockitdownError } from "../core/diagnostics.js";
import type { RenderOptions } from "../core/options.js";
import { registry } from "../core/packs/registry.js";
import { canContain, holdsChildren, rolesLoaded } from "../core/roles.js";
import { bodySiblings, edit, statementChildren, stringLiteral, type EditIndex, type EditOp, type EditRefusal, type EditResult } from "../core/syntax/edit.js";
import { firstText } from "../core/syntax/sample.js";
import { parseTree, reparse, type SyntaxTree, type TextEdit, type ViewNode } from "../core/syntax/tree.js";
import { findMockup, mockupOptions, type DesignDocument, type DesignMockup } from "./document.js";

/** What a `change` notification changed (C5): the code, the options, the position, or the list of mockups. */
export type ChangeKind = "code" | "options" | "move" | "mockups";

/** A notification of the session (C4, C5): its kind and its detail. */
export type DesignNotification =
  | { kind: "select"; detail: { mockup: string; nodes: string[] } }
  | { kind: "hover"; detail: { mockup: string; node: string | null } }
  | { kind: "change"; detail: { kind: ChangeKind; mockup: string; edits: TextEdit[]; code: string } }
  | { kind: "insert"; detail: { mockup: string; node: string; element: string } }
  | { kind: "rename"; detail: { from: string; to: string } }
  | { kind: "active"; detail: { mockup: string } }
  | { kind: "diagnostics"; detail: { mockup: string; diagnostics: Diagnostic[] } };

export type DesignNotificationKind = DesignNotification["kind"];

/** A listener of {@link DesignSession.subscribe}. */
export type DesignListener = (notification: DesignNotification) => void;

/**
 * The DOM event each notification kind a component dispatches to its host becomes (C7): bubbling and
 * composed, with the notification's detail as the event's `detail`. `hover` and `active` stay inside
 * the design tools.
 */
export const DESIGN_EVENTS = {
  select: "mockitdown-select",
  change: "mockitdown-change",
  insert: "mockitdown-insert",
  rename: "mockitdown-rename",
  diagnostics: "mockitdown-diagnostics",
} as const satisfies Partial<Record<DesignNotificationKind, string>>;

/**
 * What a drag carries (R-TOOL-005.C1): an element or struct of the gallery, inserted as `code`, or
 * sibling view nodes of a mockup, moved.
 */
export type DragSource =
  | { kind: "element"; name: string; code: string }
  | { kind: "nodes"; mockup: string; nodes: string[] };

/** Where a drop goes: before statement child `index` of `parent` (a node id), or of the top level with null. */
export interface DropPosition {
  parent: string | null;
  index: EditIndex;
}

/** Where a drop over an outline row goes relative to the row's node (R-TOOL-005.C2). */
export type DropZone = "before" | "inside" | "after";

/** Whether a drop may go to a position: `{ok: true}`, or the sentence saying why not (R-TOOL-005.C4). */
export type DropCheck = { ok: true } | { ok: false; reason: string };

/** Calls that place their content in their parent's: the role rules of the element above them apply. */
const TRANSPARENT = new Set(["ForEach"]);

/** A refused session request: why. */
export interface Refused {
  error: string;
}

/**
 * How a change enters the undo history (R-EDIT-007.C4): a change with the same `coalesce` key as the
 * latest step, for the same mockup and of the same kind, made within {@link COALESCE_MS} of that step's
 * last change and with no undo or redo in between, is merged into it. Without a key a change is a step
 * of its own.
 */
export interface HistoryOptions {
  coalesce?: string;
}

/** How long after a step's last change a change with its coalescing key still merges into it (R-EDIT-007.C4). */
export const COALESCE_MS = 1000;
/** How many steps the undo history keeps by default, the oldest dropped first (R-EDIT-007.C9). */
export const HISTORY_LIMIT = 200;

/** Options of a session. */
export interface DesignSessionOptions {
  /**
   * Render options under every mockup's own (`import_resolver`, `asset_base`, …), used when the session
   * checks a mockup for its diagnostics.
   */
  renderOptions?: Partial<RenderOptions>;
  /** The clock coalescing reads, in milliseconds (default `Date.now`); tests give a fake one. */
  now?: () => number;
  /** How many steps the undo history keeps (default and minimum {@link HISTORY_LIMIT}). */
  historyLimit?: number;
}

/** A mockup as one step of the history sees it: its code and last valid tree, its options and position. */
interface Snapshot {
  code: string;
  tree: SyntaxTree | null;
  options: Record<string, unknown> | undefined;
  x: number;
  y: number;
}

/** The active mockup and its selection on one side of a step. */
interface Place {
  active: string | null;
  nodes: string[];
}

/** One step of the undo history (R-EDIT-007.C1). */
interface Step {
  mockup: string;
  kind: ChangeKind;
  before: Snapshot;
  after: Snapshot;
  /** The text edits from `before.code` to `after.code` (redo notifies them) … */
  edits: TextEdit[];
  /** … and their inverse, from `after.code` back to `before.code` (undo notifies it). */
  inverse: TextEdit[];
  placeBefore: Place;
  placeAfter: Place;
  key: string | undefined;
  /** When the step's last change was made. */
  time: number;
}

/** A change being made: what the step will hold of the state before it. */
interface Pending {
  mockup: string;
  kind: ChangeKind;
  before: Snapshot;
  place: Place;
  key: string | undefined;
}

/** What the session keeps of one mockup. */
interface MockupState {
  /** The code the tree and the diagnostics were made from. */
  code: string;
  /** The last valid tree (C2): from this code, or from earlier code when this does not parse. */
  tree: SyntaxTree | null;
  diagnostics: Diagnostic[];
}

/** The shared state of the design tools (C1). */
export class DesignSession {
  /** The design document: the live object, changed in place by the session. */
  readonly document: DesignDocument;
  private readonly renderOptions: Partial<RenderOptions>;
  private readonly states = new Map<string, MockupState>();
  private readonly listeners = new Set<DesignListener>();
  private activeName: string | null;
  private selected: string[] = [];
  private hoveredId: string | null = null;
  private readonly now: () => number;
  private readonly historyLimit: number;
  private readonly steps: Step[] = [];
  /** How many steps of {@link steps} are done: the ones before it can be undone, the rest redone. */
  private cursor = 0;
  /** The step a coalescing change may still merge into: the latest, until an undo or a redo. */
  private open: Step | null = null;

  /**
   * A session over `document`. The active mockup is the one the document's `view.active` names, else
   * the first mockup, else none. Mockups are parsed when first needed (C2).
   */
  constructor(document: DesignDocument, options: DesignSessionOptions = {}) {
    this.document = document;
    this.renderOptions = { ...(options.renderOptions ?? {}) };
    this.now = options.now ?? Date.now;
    this.historyLimit = Math.max(HISTORY_LIMIT, Math.floor(options.historyLimit ?? HISTORY_LIMIT));
    const viewActive = document.view?.active;
    this.activeName = typeof viewActive === "string" && findMockup(document, viewActive)
      ? viewActive
      : document.mockups[0]?.name ?? null;
  }

  // --- reading ------------------------------------------------------------------------------------

  /** The name of the active mockup, or null when the document has none. */
  get active(): string | null {
    return this.activeName;
  }

  /** The selected node ids of the active mockup, siblings in source order of selection (C1, C10). */
  get selection(): readonly string[] {
    return this.selected;
  }

  /** Whether a step can be undone (R-EDIT-007.C8). */
  get canUndo(): boolean {
    return this.cursor > 0;
  }

  /** Whether a step can be redone (R-EDIT-007.C8). */
  get canRedo(): boolean {
    return this.cursor < this.steps.length;
  }

  /** The hovered node id of the active mockup, or null. */
  get hovered(): string | null {
    return this.hoveredId;
  }

  /** The mockup of this name, or null. */
  mockup(name: string): DesignMockup | null {
    return findMockup(this.document, name);
  }

  /** A mockup's code, or null when there is no such mockup. */
  code(name: string): string | null {
    return this.mockup(name)?.code ?? null;
  }

  /** A mockup's render options (R-EDIT-005.C9), or null. */
  options(name: string): Record<string, unknown> | null {
    return mockupOptions(this.document, name);
  }

  /** A mockup's last valid tree (C2): null when there is no such mockup or its code never parsed. */
  tree(name: string): SyntaxTree | null {
    return this.state(name)?.tree ?? null;
  }

  /** A mockup's current diagnostics (empty when there is no such mockup). */
  diagnostics(name: string): Diagnostic[] {
    return this.state(name)?.diagnostics ?? [];
  }

  /**
   * The diagnostics a mockup would have with `code` instead of its own (C17), without changing
   * anything: what the inspector compares before it applies a value (R-TOOL-007.C9).
   */
  diagnosticsOf(name: string, code: string): Diagnostic[] {
    return this.mockup(name) ? this.check(name, code) : [];
  }

  /**
   * The id of the view node with this ordinal (`n3` or 3) in the mockup's current tree, or null (C9):
   * the node an element of an edit-mode rendering (`data-mkd-node`, R-EDIT-004.C4) stands for.
   */
  nodeFor(mockup: string, ordinal: string | number): string | null {
    return this.tree(mockup)?.byOrdinal(ordinal)?.id ?? null;
  }

  // --- listening ----------------------------------------------------------------------------------

  /** Register a listener for every notification (C4); the returned function removes it. */
  subscribe(listener: DesignListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // --- changing -----------------------------------------------------------------------------------

  /** Make a mockup the active one; the selection and the hover are cleared. */
  setActive(name: string): { mockup: string } | Refused {
    if (!this.mockup(name)) return { error: `there is no mockup named ${JSON.stringify(name)}` };
    if (name === this.activeName) return { mockup: name };
    this.activeName = name;
    this.notify({ kind: "active", detail: { mockup: name } });
    if (this.selected.length) {
      this.selected = [];
      this.notify({ kind: "select", detail: { mockup: name, nodes: [] } });
    }
    if (this.hoveredId !== null) {
      this.hoveredId = null;
      this.notify({ kind: "hover", detail: { mockup: name, node: null } });
    }
    return { mockup: name };
  }

  /**
   * Replace the selection with nodes of the active mockup (C10): ids of its current tree, all siblings
   * (children of one node, or statements of the top level or of one struct body). An empty list clears
   * it; a node named twice counts once.
   */
  select(ids: readonly string[]): { selection: string[] } | Refused {
    const name = this.activeName;
    if (name === null) return { error: "there is no active mockup" };
    const tree = this.tree(name);
    const nodes: ViewNode[] = [];
    for (const id of new Set(ids)) {
      const node = tree?.byId(id);
      if (!node) return { error: `${JSON.stringify(id)} is not a node of mockup ${JSON.stringify(name)}` };
      nodes.push(node);
    }
    const group = nodes.length ? siblingGroup(tree!, nodes[0]) : null;
    for (const n of nodes.slice(1)) {
      if (siblingGroup(tree!, n) !== group) return { error: `${nodes[0].ordinal} and ${n.ordinal} are not siblings` };
    }
    const selection = nodes.map((n) => n.id);
    if (!sameList(selection, this.selected)) {
      this.selected = selection;
      this.notify({ kind: "select", detail: { mockup: name, nodes: [...selection] } });
    }
    return { selection: [...selection] };
  }

  /** Set the hovered node of the active mockup (an id of its current tree), or clear it with null. */
  hover(id: string | null): { node: string | null } | Refused {
    const name = this.activeName;
    if (name === null) return { error: "there is no active mockup" };
    if (id !== null && !this.tree(name)?.byId(id)) return { error: `${JSON.stringify(id)} is not a node of mockup ${JSON.stringify(name)}` };
    if (id !== this.hoveredId) {
      this.hoveredId = id;
      this.notify({ kind: "hover", detail: { mockup: name, node: id } });
    }
    return { node: id };
  }

  /**
   * Apply an edit operation (R-EDIT-002, R-EDIT-003) to the active mockup (C3): its code becomes the
   * edited source and its tree the edited tree, whose untouched nodes keep their ids; the selection
   * keeps the nodes that still exist. One `change` notification follows (C6), then `insert` for an
   * insert, `select` and `hover` when they lost a node, and `diagnostics` when those changed. A refused
   * operation changes nothing; an operation on code that does not parse is refused.
   */
  apply(op: EditOp, history: HistoryOptions = {}): EditResult | EditRefusal {
    return this.applyOp(op, undefined, history);
  }

  /**
   * Delete the selected nodes as one change (R-EDIT-002.C6), the command behind Delete and Backspace in
   * the composite designer (R-TOOL-003.C11), then select the statement after the last of them in their
   * body that is not deleted, else the one before it, else their parent view node (none at the top
   * level). It notifies one `change`, then one `select` with the new selection, and is refused, changing
   * nothing, when nothing is selected or the remove operation is refused.
   */
  delete(): EditResult | EditRefusal {
    const name = this.activeName;
    if (name === null) return { error: "there is no active mockup", diagnostics: [] };
    if (!this.selected.length) return { error: "nothing is selected", diagnostics: [] };
    const tree = this.tree(name);
    const nodes = this.selected.map((id) => tree?.byId(id)).filter((n): n is ViewNode => !!n).sort((a, b) => a.first - b.first);
    let next: ViewNode | null = null;
    const last = nodes[nodes.length - 1];
    const body = tree && last ? bodySiblings(tree, last) : null;
    if (last && body) {
      const kept = body.filter((n) => !nodes.includes(n));
      next = kept.find((n) => n.first > last.first) ?? [...kept].reverse().find((n) => n.first < last.first) ?? last.parent;
    }
    return this.applyOp({ op: "remove", nodes: [...this.selected] }, next ? [next.id] : []);
  }

  /**
   * Insert one view's code as the last child of `parent` (a node id of the active mockup), by default of
   * the first selected node, else at the end of the mockup's top level (`parent` null), the command
   * behind the gallery's Add (R-TOOL-004.C8). The new node becomes the selection: one `change`, then
   * `insert`, then `select`. Refused, changing nothing, as {@link apply} refuses an insert.
   */
  insert(code: string, parent?: string | null, index: EditIndex = "end"): EditResult | EditRefusal {
    const at = parent === undefined ? this.selected[0] ?? null : parent;
    return this.applyOp({ op: "insert", parent: at, index, code }, "inserted");
  }

  /**
   * Move sibling nodes of the active mockup before statement child `index` of `parent` (null: the top
   * level) as one change (R-EDIT-002.C8); the moved nodes keep their ids and become the selection.
   */
  move(nodes: readonly string[], parent: string | null, index: EditIndex): EditResult | EditRefusal {
    return this.applyOp({ op: "move", nodes: [...nodes], parent, index }, [...nodes]);
  }

  /**
   * The text a node of the active mockup opens for inline editing after its insertion (R-TOOL-006.C2):
   * its first positional argument when that is a string literal without interpolation, else null.
   */
  firstText(node: string): string | null {
    const tree = this.activeName === null ? null : this.tree(this.activeName);
    const n = tree?.byId(node);
    return n ? firstText(n) : null;
  }

  /**
   * Set a node's first text (R-TOOL-006.C3): its first positional argument becomes the string literal
   * of `text` through `setArgument` (R-EDIT-003.C1), as one change of its own. The same text changes
   * nothing (no edits, no notification); a node without a first text is refused.
   */
  setText(node: string, text: string, history: HistoryOptions = {}): EditResult | EditRefusal {
    const name = this.activeName;
    const tree = name === null ? null : this.tree(name);
    const n = tree?.byId(node);
    if (!tree || !n) return { error: `${JSON.stringify(node)} is not a node of the active mockup`, diagnostics: [] };
    const current = firstText(n);
    if (current === null) return { error: `${n.ordinal} has no text as its first argument`, diagnostics: [] };
    if (typeof text !== "string") return { error: "text must be a string", diagnostics: [] };
    if (text === current) return { edits: [], source: tree.source, tree };
    return this.applyOp({ op: "setArgument", node, label: null, position: 0, value: stringLiteral(text) }, undefined, history);
  }

  // --- drag and drop (R-TOOL-005) -----------------------------------------------------------------

  /**
   * The statement children of a node of the active mockup (null: of its top level) that a drop
   * position's `index` counts, as node ids; empty when there is no such node.
   */
  childrenOf(parent: string | null): string[] {
    const tree = this.activeName === null ? null : this.tree(this.activeName);
    if (!tree) return [];
    const node = parent === null ? null : tree.byId(parent);
    if (parent !== null && !node) return [];
    return statementChildren(tree, node ?? null).map((n) => n.id);
  }

  /**
   * Whether a node of the active mockup is a container that a drop in the view goes into
   * (R-TOOL-005.C3): an element call (not a `ForEach`) that already has statement children, or whose
   * element holds children in `pack` (R-PACK-016).
   */
  isContainer(node: string, pack: string): boolean {
    const tree = this.activeName === null ? null : this.tree(this.activeName);
    const n = tree?.byId(node);
    if (!tree || !n || n.kind !== "call" || TRANSPARENT.has(n.name)) return false;
    if (statementChildren(tree, n).length) return true;
    return rolesLoaded() && registry.ids().includes(pack) && holdsChildren(pack, n.name);
  }

  /**
   * The drop position relative to a node of the active mockup (R-TOOL-005.C2): before or after it among
   * its parent's statement children, or as the last child inside it. Refused when the node stands
   * where no statement goes beside it (an argument, a modifier's content, a struct body).
   */
  dropPosition(node: string, zone: DropZone): DropPosition | Refused {
    const tree = this.activeName === null ? null : this.tree(this.activeName);
    const n = tree?.byId(node);
    if (!tree || !n) return { error: `${JSON.stringify(node)} is not a node of the active mockup` };
    if (zone === "inside") return { parent: n.id, index: "end" };
    const k = statementChildren(tree, n.parent).indexOf(n);
    if (k < 0) return { error: `${n.name} is not placed among its parent's children, so nothing can be dropped beside it` };
    return { parent: n.parent?.id ?? null, index: zone === "before" ? k : k + 1 };
  }

  /**
   * Whether a drag may drop at a position of the active mockup (R-TOOL-005.C4): the parent element must
   * accept every dragged element by the role rules of `pack` (R-PACK-016.C6; a `ForEach` or an `if`
   * defers to the element above it), moved nodes may not go inside themselves or their descendants,
   * and the edit operation must accept the drop. Each refusal is a sentence for the user.
   */
  checkDrop(source: DragSource, position: DropPosition, pack: string): DropCheck {
    const name = this.activeName;
    const tree = name === null ? null : this.tree(name);
    if (name === null || !tree) return { ok: false, reason: "There is no mockup to drop into" };
    const parent = position.parent === null ? null : tree.byId(position.parent);
    if (position.parent !== null && !parent) return { ok: false, reason: "The drop position is not in the mockup" };
    let dragged: string[];
    if (source.kind === "nodes") {
      if (source.mockup !== name) return { ok: false, reason: `Elements of ${source.mockup} cannot be moved into ${name}` };
      const nodes = source.nodes.map((id) => tree.byId(id));
      if (!nodes.length || nodes.some((n) => !n)) return { ok: false, reason: "The dragged elements are no longer in the mockup" };
      for (let p = parent; p; p = p.parent) {
        const own = nodes.find((n) => n === p);
        if (own) {
          return { ok: false, reason: p === parent
            ? `Cannot move ${own.name} into itself`
            : `Cannot move ${own.name} into one of its own descendants` };
        }
      }
      dragged = nodes.map((n) => n!.name);
    } else dragged = [source.name];
    if (rolesLoaded() && registry.ids().includes(pack)) {
      let holder = parent;
      while (holder && (holder.kind === "if" || TRANSPARENT.has(holder.name))) holder = holder.parent;
      for (const child of dragged) {
        const r = canContain(pack, holder ? holder.name : null, child);
        if (!r.ok) return { ok: false, reason: r.reason };
      }
    }
    const op: EditOp = source.kind === "element"
      ? { op: "insert", parent: position.parent, index: position.index, code: source.code }
      : { op: "move", nodes: [...source.nodes], parent: position.parent, index: position.index };
    const r = edit(tree, op);
    if ("error" in r) return { ok: false, reason: sentence(r.error) };
    return { ok: true };
  }

  /**
   * Drop a drag at a position of the active mockup (R-TOOL-005.C5, C6), checked as {@link checkDrop}
   * says with the role rules of `pack`: an element is inserted there and selected, nodes are moved
   * there and stay selected. One edit operation, so one `change`; nothing when refused.
   */
  drop(source: DragSource, position: DropPosition, pack: string): EditResult | EditRefusal {
    const check = this.checkDrop(source, position, pack);
    if (!check.ok) return { error: check.reason, diagnostics: [] };
    return source.kind === "element"
      ? this.insert(source.code, position.parent, position.index)
      : this.move(source.nodes, position.parent, position.index);
  }

  /**
   * Apply an operation; `select`, when given, is the selection after it (else the nodes kept), or
   * `inserted` for the node an insert added.
   */
  private applyOp(op: EditOp, select?: readonly string[] | "inserted", history: HistoryOptions = {}): EditResult | EditRefusal {
    const name = this.activeName;
    if (name === null) return { error: "there is no active mockup", diagnostics: [] };
    const state = this.state(name)!;
    if (!state.tree || state.tree.source !== state.code) {
      return { error: `the code of mockup ${JSON.stringify(name)} does not parse`, diagnostics: state.diagnostics.filter((d) => d.severity === "error") };
    }
    const before = state.tree;
    const result = edit(before, op);
    if ("error" in result) return result;
    if (result.edits.length === 0) return result;
    const pending = this.begin(name, "code", history);
    const mockup = this.mockup(name)!;
    mockup.code = result.source;
    state.code = result.source;
    state.tree = result.tree;
    const step = this.record(pending, result.edits);
    this.notify({ kind: "change", detail: { kind: "code", mockup: name, edits: result.edits, code: result.source } });
    let next = select === "inserted" ? undefined : select;
    if (op.op === "insert") {
      const node = insertedNode(before, result.tree);
      if (node) this.notify({ kind: "insert", detail: { mockup: name, node: node.id, element: node.name } });
      if (select === "inserted" && node) next = [node.id];
    }
    this.afterCodeChange(name, state, next);
    this.settle(step);
    return result;
  }

  /**
   * Replace a mockup's code with text (C2), as a code editor does: one `change` of kind `code` whose
   * single edit replaces the part that differs. The tree is re-parsed from the last valid one, so nodes
   * outside the changed text keep their ids; code that does not parse keeps the last valid tree and
   * reports its diagnostics.
   */
  setCode(name: string, code: string, history: HistoryOptions = {}): { edits: TextEdit[] } | Refused {
    const mockup = this.mockup(name);
    if (!mockup) return { error: `there is no mockup named ${JSON.stringify(name)}` };
    if (typeof code !== "string") return { error: "code must be a string" };
    const state = this.state(name)!;
    const edits = diff(mockup.code, code);
    if (edits.length === 0) return { edits };
    const pending = this.begin(name, "code", history);
    mockup.code = code;
    this.reparseState(state, code);
    const step = this.record(pending, edits);
    this.notify({ kind: "change", detail: { kind: "code", mockup: name, edits, code } });
    this.afterCodeChange(name, state);
    this.settle(step);
    return { edits };
  }

  /** Replace a mockup's render options (null removes them): a `change` of kind `options` with no edits. */
  setOptions(name: string, options: Record<string, unknown> | null, history: HistoryOptions = {}): { mockup: string } | Refused {
    const mockup = this.mockup(name);
    if (!mockup) return { error: `there is no mockup named ${JSON.stringify(name)}` };
    if (options !== null && (typeof options !== "object" || Array.isArray(options))) return { error: "options must be an object or null" };
    const state = this.state(name)!;
    const pending = this.begin(name, "options", history);
    if (options === null) delete mockup.options;
    else mockup.options = { ...options };
    const step = this.record(pending, []);
    this.notify({ kind: "change", detail: { kind: "options", mockup: name, edits: [], code: mockup.code } });
    this.updateDiagnostics(name, state);
    this.settle(step);
    return { mockup: name };
  }

  /** Move a mockup's frame on the canvas: a `change` of kind `move` with no edits. */
  moveMockup(name: string, x: number, y: number, history: HistoryOptions = {}): { mockup: string } | Refused {
    const mockup = this.mockup(name);
    if (!mockup) return { error: `there is no mockup named ${JSON.stringify(name)}` };
    if (!Number.isFinite(x) || !Number.isFinite(y)) return { error: "x and y must be finite numbers" };
    if (mockup.x === x && mockup.y === y) return { mockup: name };
    this.state(name);
    const pending = this.begin(name, "move", history);
    mockup.x = x;
    mockup.y = y;
    const step = this.record(pending, []);
    this.notify({ kind: "change", detail: { kind: "move", mockup: name, edits: [], code: mockup.code } });
    this.settle(step);
    return { mockup: name };
  }

  // --- history (R-EDIT-007) -----------------------------------------------------------------------

  /**
   * Revert the latest step (C3): its mockup gets back its code, tree, options and position from before
   * it, and the active mockup and the selection are those from before it. One `change` of the step's
   * kind with the inverse edits (C7), then `active`, `select`, `hover` and `diagnostics` as they changed.
   */
  undo(): { mockup: string; edits: TextEdit[] } | Refused {
    if (!this.canUndo) return { error: "there is nothing to undo" };
    const step = this.steps[--this.cursor]!;
    this.open = null;
    return this.restore(step, step.before, step.placeBefore, step.inverse);
  }

  /** Reapply the step undone last (C3): the state and the selection from after it; one `change` (C7). */
  redo(): { mockup: string; edits: TextEdit[] } | Refused {
    if (!this.canRedo) return { error: "there is nothing to redo" };
    const step = this.steps[this.cursor++]!;
    this.open = null;
    return this.restore(step, step.after, step.placeAfter, step.edits);
  }

  // --- internals ----------------------------------------------------------------------------------

  /** A change of a mockup begins: what its step keeps of the state before it. */
  private begin(name: string, kind: ChangeKind, history: HistoryOptions): Pending {
    const key = typeof history?.coalesce === "string" ? history.coalesce : undefined;
    return { mockup: name, kind, before: this.snapshot(name), place: this.place(), key };
  }

  /**
   * The change is made (before its `change` is notified, so that a listener reads `canUndo` right):
   * merged into the open step when it coalesces with it (C4), else a new step that drops the steps that
   * could have been redone (C6) and, past the limit, the oldest (C9). Returns the step to settle.
   */
  private record(p: Pending, edits: TextEdit[]): Step | null {
    const after = this.snapshot(p.mockup);
    const time = this.now();
    const last = this.cursor > 0 ? this.steps[this.cursor - 1]! : null;
    if (p.key !== undefined && last && last === this.open && this.cursor === this.steps.length
      && last.key === p.key && last.mockup === p.mockup && last.kind === p.kind && time - last.time <= COALESCE_MS) {
      last.after = after;
      last.time = time;
      last.edits = diff(last.before.code, after.code);
      last.inverse = diff(after.code, last.before.code);
      if (sameSnapshot(last.before, after)) {
        // The burst came back to where it started: no step is left.
        this.steps.pop();
        this.cursor--;
        this.open = null;
        return null;
      }
      return last;
    }
    const step: Step = {
      mockup: p.mockup, kind: p.kind, before: p.before, after, edits: [...edits], inverse: diff(after.code, p.before.code),
      placeBefore: p.place, placeAfter: p.place, key: p.key, time,
    };
    this.steps.length = this.cursor;
    this.steps.push(step);
    if (this.steps.length > this.historyLimit) this.steps.splice(0, this.steps.length - this.historyLimit);
    this.cursor = this.steps.length;
    this.open = step;
    return step;
  }

  /** The change and its follow-up notifications are done: the step's selection after it. */
  private settle(step: Step | null): void {
    if (step) step.placeAfter = this.place();
  }

  private snapshot(name: string): Snapshot {
    const mockup = this.mockup(name)!;
    const state = this.state(name)!;
    return {
      code: mockup.code, tree: state.tree,
      options: mockup.options === undefined ? undefined : structuredClone(mockup.options),
      x: mockup.x, y: mockup.y,
    };
  }

  private place(): Place {
    return { active: this.activeName, nodes: [...this.selected] };
  }

  /** Put a step's mockup back to a snapshot and the active mockup and selection back to a place. */
  private restore(step: Step, snap: Snapshot, place: Place, edits: TextEdit[]): { mockup: string; edits: TextEdit[] } | Refused {
    const name = step.mockup;
    const mockup = this.mockup(name);
    if (!mockup) return { error: `there is no mockup named ${JSON.stringify(name)}` };
    const state = this.state(name)!;
    const active = place.active !== null && this.mockup(place.active) ? place.active : this.activeName;
    const switched = active !== this.activeName;
    if (switched) {
      this.activeName = active;
      this.notify({ kind: "active", detail: { mockup: active! } });
    }
    mockup.code = snap.code;
    state.code = snap.code;
    state.tree = snap.tree;
    if (snap.options === undefined) delete mockup.options;
    else mockup.options = structuredClone(snap.options);
    mockup.x = snap.x;
    mockup.y = snap.y;
    const shown = step.kind === "code" ? [...edits] : [];
    this.notify({ kind: "change", detail: { kind: step.kind, mockup: name, edits: shown, code: mockup.code } });
    if (active !== null) {
      const tree = this.tree(active);
      const nodes = place.nodes.filter((id) => tree?.byId(id));
      if (switched || !sameList(nodes, this.selected)) {
        this.selected = nodes;
        this.notify({ kind: "select", detail: { mockup: active, nodes: [...nodes] } });
      }
      if (this.hoveredId !== null && (switched || !tree?.byId(this.hoveredId))) {
        this.hoveredId = null;
        this.notify({ kind: "hover", detail: { mockup: active, node: null } });
      }
    }
    this.updateDiagnostics(name, state);
    return { mockup: name, edits: shown };
  }

  /** The state of a mockup, parsed when first needed or when its code changed outside the session. */
  private state(name: string): MockupState | null {
    const mockup = this.mockup(name);
    if (!mockup) return null;
    let state = this.states.get(name);
    if (!state) {
      state = { code: mockup.code, tree: null, diagnostics: [] };
      state.tree = parseTree(mockup.code).tree;
      state.diagnostics = this.check(name, mockup.code);
      this.states.set(name, state);
    } else if (state.code !== mockup.code) {
      this.reparseState(state, mockup.code);
      state.diagnostics = this.check(name, mockup.code);
    }
    return state;
  }

  private reparseState(state: MockupState, code: string): void {
    const r = state.tree ? reparse(state.tree, diff(state.tree.source, code)) : parseTree(code);
    state.code = code;
    if (r.tree) state.tree = r.tree;
  }

  /** After a code change: drop the selected and hovered nodes that no longer exist, then the diagnostics. */
  private afterCodeChange(name: string, state: MockupState, select?: readonly string[]): void {
    if (name === this.activeName && state.tree) {
      const tree = state.tree;
      const kept = (select ?? this.selected).filter((id) => tree.byId(id));
      if (!sameList(kept, this.selected)) {
        this.selected = kept;
        this.notify({ kind: "select", detail: { mockup: name, nodes: [...kept] } });
      }
      if (this.hoveredId !== null && !tree.byId(this.hoveredId)) {
        this.hoveredId = null;
        this.notify({ kind: "hover", detail: { mockup: name, node: null } });
      }
    }
    this.updateDiagnostics(name, state);
  }

  private updateDiagnostics(name: string, state: MockupState): void {
    const next = this.check(name, state.code);
    if (sameDiagnostics(next, state.diagnostics)) return;
    state.diagnostics = next;
    this.notify({ kind: "diagnostics", detail: { mockup: name, diagnostics: [...next] } });
  }

  /**
   * A mockup's diagnostics: those of `check` with its render options when packs are loaded, else the
   * syntax diagnostics alone.
   */
  private check(name: string, code: string): Diagnostic[] {
    if (!assetsLoaded() && registry.ids().length === 0) return parseTree(code).diagnostics;
    try {
      return check(code, { ...this.renderOptions, ...(this.options(name) ?? {}) } as Partial<RenderOptions>);
    } catch (e) {
      if (e instanceof MockitdownError) return [e.diagnostic];
      throw e;
    }
  }

  private notify(n: DesignNotification): void {
    for (const l of [...this.listeners]) l(n);
  }
}

// --- helpers --------------------------------------------------------------------------------------

/** The smallest single edit turning `a` into `b`: none when they are equal. */
function diff(a: string, b: string): TextEdit[] {
  if (a === b) return [];
  let start = 0;
  const max = Math.min(a.length, b.length);
  while (start < max && a.charCodeAt(start) === b.charCodeAt(start)) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a.charCodeAt(endA - 1) === b.charCodeAt(endB - 1)) {
    endA--;
    endB--;
  }
  return [{ start, end: endA, text: b.slice(start, endB) }];
}

function sameSnapshot(a: Snapshot, b: Snapshot): boolean {
  return a.code === b.code && a.x === b.x && a.y === b.y && JSON.stringify(a.options) === JSON.stringify(b.options);
}

/** What a node is a sibling of: its parent node, else the struct declaration or the top level it stands in. */
function siblingGroup(tree: SyntaxTree, node: ViewNode): unknown {
  if (node.parent) return node.parent;
  for (const s of tree.module.structs) {
    if (s.start !== undefined && s.end !== undefined && s.start <= node.first && node.first < s.end) return s;
  }
  return tree.module;
}

/** The outermost node of `after` whose id `before` does not have: the root of inserted code. */
function insertedNode(before: SyntaxTree, after: SyntaxTree): ViewNode | null {
  for (const n of after.nodes) {
    if (!before.byId(n.id) && (n.parent === null || before.byId(n.parent.id))) return n;
  }
  return null;
}

/** An edit refusal as a sentence: its first letter capitalised. */
function sentence(text: string): string {
  return text ? text[0]!.toUpperCase() + text.slice(1) : text;
}

function sameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

function sameDiagnostics(a: readonly Diagnostic[], b: readonly Diagnostic[]): boolean {
  return a.length === b.length && a.every((d, i) => JSON.stringify(d.toJSON()) === JSON.stringify(b[i].toJSON()));
}
