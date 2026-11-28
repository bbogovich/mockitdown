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
 *
 * The commands on the selection (R-EDIT-008) are methods too: {@link DesignSession.duplicate},
 * {@link DesignSession.copy}, {@link DesignSession.cut}, {@link DesignSession.paste},
 * {@link DesignSession.moveUp} and {@link DesignSession.moveDown}, each one step of the history, and
 * {@link DesignSession.selectRange} and {@link DesignSession.toggleSelected} for Shift- and
 * Cmd/Ctrl-click.
 */

import { check } from "../core/api.js";
import { assetsLoaded } from "../core/assets.js";
import { Diagnostic, MockitdownError } from "../core/diagnostics.js";
import type { RenderOptions } from "../core/options.js";
import { registry } from "../core/packs/registry.js";
import { canContain, holdsChildren, labelUnderstood, roleRule, rolesLoaded } from "../core/roles.js";
import type * as A from "../core/syntax/ast.js";
import { bodySiblings, edit, identifiersOf, indentUnit, nodeCode, statementChildren, stringLiteral, type EditIndex, type EditOp, type EditRefusal, type EditResult } from "../core/syntax/edit.js";
import { firstText } from "../core/syntax/sample.js";
import { parseTree, reparse, type SyntaxTree, type TextEdit, type ViewNode } from "../core/syntax/tree.js";
import { findMockup, mockupOptions, mockupPack, type DesignDocument, type DesignMockup, type DesignSection, type DesignView } from "./document.js";
import { duplicateMockupName, NEW_MOCKUP_CODE, newMockupName, newMockupPlace, renameRefusal } from "./frames.js";
import type { CanvasBox, CanvasView } from "./canvas.js";
import { documentView, framesInside, sectionAround, sectionNameRefusal } from "./sections.js";

/**
 * What a `change` notification changed (C5): the code, the options, the position, the list of mockups,
 * or the document's sections (R-TOOL-014), whose `change` names no mockup (`mockup` and `code` empty).
 */
export type ChangeKind = "code" | "options" | "move" | "mockups" | "sections";

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

/** What `cut` returns: the applied removal and the text it copied (R-EDIT-008.C4). */
export type CutResult = EditResult & { text: string };

/** Text edits a command makes beside its edit operations (the struct `extractComponent` declares). */
interface TextStep {
  op: "text";
  edits: TextEdit[];
}

/**
 * One operation of a command, made from the tree as the command's earlier operations left it and the
 * views they inserted so far.
 */
type OpOf = (tree: SyntaxTree, inserted: readonly string[]) => EditOp | TextStep | EditRefusal;

/** The selection after a command: ids, the inserted views, or ids read from the tree it made. */
type SelectAfter = readonly string[] | "inserted" | ((tree: SyntaxTree, inserted: readonly string[]) => string[]);

/** A planned command: its operations and the selection after it. */
interface CommandPlan {
  ops: OpOf[];
  select: SelectAfter;
}

/** The names of the session's commands (R-EDIT-009.C8), in menu order. */
export type CommandName =
  | "delete" | "duplicate" | "cut" | "copy" | "paste" | "moveUp" | "moveDown"
  | "wrap" | "unwrap" | "convert" | "extractComponent" | "newMockup" | "duplicateMockup" | "deleteMockup"
  | "undo" | "redo";

/**
 * A command as a host's menu shows it (R-EDIT-009.C8): its name for {@link DesignSession.run}, its label,
 * the composite designer's shortcut (`Mod` is Cmd on macOS, Ctrl elsewhere; null for none) and whether
 * it is enabled for the current selection.
 */
export interface DesignCommand {
  name: CommandName;
  label: string;
  shortcut: string | null;
  enabled: boolean;
}

/**
 * The arguments of {@link DesignSession.run}: `name` for wrap, convert and extract, `text` for paste,
 * `mockup` for duplicateMockup and deleteMockup (default: the active mockup).
 */
export interface CommandArgs {
  name?: string;
  text?: string;
  mockup?: string;
}

/** The element wrap's menu entry and shortcut wrap in (R-EDIT-009.C9). */
export const WRAP_DEFAULT = "VStack";

const COMMANDS: readonly { name: CommandName; label: string; shortcut: string | null }[] = [
  { name: "delete", label: "Delete", shortcut: "Delete" },
  { name: "duplicate", label: "Duplicate", shortcut: "Mod+D" },
  { name: "cut", label: "Cut", shortcut: "Mod+X" },
  { name: "copy", label: "Copy", shortcut: "Mod+C" },
  { name: "paste", label: "Paste", shortcut: "Mod+V" },
  { name: "moveUp", label: "Move Up", shortcut: "Alt+ArrowUp" },
  { name: "moveDown", label: "Move Down", shortcut: "Alt+ArrowDown" },
  { name: "wrap", label: "Wrap in Stack", shortcut: "Mod+G" },
  { name: "unwrap", label: "Unwrap", shortcut: "Mod+Shift+G" },
  { name: "convert", label: "Convert To…", shortcut: null },
  { name: "extractComponent", label: "Extract Component…", shortcut: null },
  { name: "newMockup", label: "New Mockup", shortcut: null },
  { name: "duplicateMockup", label: "Duplicate Mockup", shortcut: null },
  { name: "deleteMockup", label: "Delete Mockup", shortcut: null },
  { name: "undo", label: "Undo", shortcut: "Mod+Z" },
  { name: "redo", label: "Redo", shortcut: "Mod+Shift+Z" },
];

/** An element name as `setName` takes it (R-EDIT-003.C12). */
const ELEMENT_NAME = /^\p{Lu}[\p{L}\p{N}_]*(?:\.\p{Lu}[\p{L}\p{N}_]*)*$/u;
/** A component name: an identifier beginning with an uppercase letter (R-EDIT-009.C7). */
const COMPONENT_NAME = /^\p{Lu}[\p{L}\p{N}_]*$/u;

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
  /**
   * The size of a mockup's frame in canvas units, for placing a new mockup (R-TOOL-012.C8); the
   * canvas sets it as {@link DesignSession.measure}.
   */
  measure?: FrameMeasure;
  /** The clock coalescing reads, in milliseconds (default `Date.now`); tests give a fake one. */
  now?: () => number;
  /** How many steps the undo history keeps (default and minimum {@link HISTORY_LIMIT}). */
  historyLimit?: number;
}

/**
 * What a step changed: a change kind (R-EDIT-006.C5), or `rename` for a step that renamed its mockup
 * (R-TOOL-012.C7), which notifies `rename` rather than `change` when it is undone and redone.
 */
type StepKind = Exclude<ChangeKind, "sections"> | "rename";

/**
 * A mockup as one step of the history sees it: its name, code and last valid tree, its options and
 * position, and for a step of kind `mockups` the document's list of mockups.
 */
interface Snapshot {
  name: string;
  list?: DesignMockup[];
  code: string;
  tree: SyntaxTree | null;
  options: Record<string, unknown> | undefined;
  x: number;
  y: number;
}

/**
 * The active mockup and its selection on one side of a step. Steps hold mockups as objects, not names,
 * so that a rename leaves the steps before it pointing at the right mockup.
 */
interface Place {
  active: DesignMockup | null;
  nodes: string[];
}

/** One step of the undo history (R-EDIT-007.C1): a mockup's, or the sections'. */
type Step = MockupStep | SectionStep;

/** A step that changed one mockup, or the list of mockups. */
interface MockupStep {
  mockup: DesignMockup;
  kind: StepKind;
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

/**
 * The sections and the frames' positions on one side of a section step (R-TOOL-014.C3): the document's
 * list of sections (undefined when it had none) with each section's own values, and every mockup's
 * position. Sections are held as objects, so that a key order read with them is kept.
 */
interface SectionsSnapshot {
  list: DesignSection[] | undefined;
  values: [DesignSection, { name: string; x: number; y: number; w: number; h: number }][];
  frames: [DesignMockup, number, number][];
}

/** A step that changed the sections, and the frames a moved section carried. */
interface SectionStep {
  mockup: null;
  kind: "sections";
  before: SectionsSnapshot;
  after: SectionsSnapshot;
  placeBefore: Place;
  placeAfter: Place;
  key: undefined;
  time: number;
}

/** A change being made: what the step will hold of the state before it. */
interface Pending {
  mockup: DesignMockup;
  kind: StepKind;
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

/** The size of a mockup's frame on the canvas in canvas units, or null when it is not drawn. */
export type FrameMeasure = (name: string) => { w: number; h: number } | null;

/** The shared state of the design tools (C1). */
export class DesignSession {
  /**
   * How big each mockup's frame is (R-TOOL-012.C8): set by a canvas showing the session, null when
   * none does; a mockup it does not measure is as wide and high as its options' `width` and `height`,
   * else 0.
   */
  measure: FrameMeasure | null;
  /** The design document: the live object, changed in place by the session. */
  readonly document: DesignDocument;
  private readonly renderOptions: Partial<RenderOptions>;
  private readonly states = new Map<DesignMockup, MockupState>();
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
    this.measure = options.measure ?? null;
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
   * Whether a mockup's current code parses (R-TOOL-009.C3): its last valid tree is the tree of its code.
   * While it does not, the visual tools show {@link validCode} read-only and every edit is refused.
   */
  parses(name: string): boolean {
    const state = this.state(name);
    return !!state?.tree && state.tree.source === state.code;
  }

  /**
   * The code of a mockup's last valid tree (R-TOOL-009.C3): its code while it parses, else the code it
   * last parsed from, else (it never parsed) its code; null when there is no such mockup.
   */
  validCode(name: string): string | null {
    const state = this.state(name);
    if (!state) return null;
    return state.tree?.source ?? state.code;
  }

  /**
   * The innermost view node of a mockup whose span holds `offset` (R-TOOL-009.C4, R-EDIT-001.C8), or
   * null: none holds it, or the mockup's code does not parse (its tree's offsets are not the code's).
   */
  nodeAt(name: string, offset: number): string | null {
    if (!this.parses(name)) return null;
    return this.tree(name)?.atOffset(offset)?.id ?? null;
  }

  /**
   * The span the selected nodes of the active mockup cover in its code (R-TOOL-009.C6): from the first
   * one's start to the last one's end, or null when nothing is selected or the code does not parse.
   */
  selectionSpan(): { start: number; end: number } | null {
    const name = this.activeName;
    if (name === null || !this.selected.length || !this.parses(name)) return null;
    const tree = this.tree(name)!;
    const nodes = this.selected.map((id) => tree.byId(id)).filter((n): n is ViewNode => !!n);
    if (!nodes.length) return null;
    return { start: Math.min(...nodes.map((n) => n.span.start)), end: Math.max(...nodes.map((n) => n.span.end)) };
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

  // --- commands on the selection (R-EDIT-008) -----------------------------------------------------

  /**
   * Shift-click (C8): select the siblings from the selection's first node to `node`, both included, the
   * first node staying first; with no selection, or when `node` is not its sibling, `node` alone.
   */
  selectRange(node: string): { selection: string[] } | Refused {
    const found = this.clicked(node);
    if ("error" in found) return found;
    const { tree, target } = found;
    const anchor = this.selected.length ? tree.byId(this.selected[0]!) : null;
    const group = siblingGroup(tree, target);
    if (!anchor || siblingGroup(tree, anchor) !== group) return this.select([target.id]);
    const siblings = tree.nodes.filter((n) => siblingGroup(tree, n) === group).sort((a, b) => a.first - b.first);
    const a = siblings.indexOf(anchor);
    const b = siblings.indexOf(target);
    const range = a <= b ? siblings.slice(a, b + 1) : siblings.slice(b, a + 1).reverse();
    return this.select(range.map((n) => n.id));
  }

  /**
   * Cmd/Ctrl-click (C8): add `node` to the selection, or remove it when it is selected; a node that is
   * not a sibling of the selection replaces it.
   */
  toggleSelected(node: string): { selection: string[] } | Refused {
    const found = this.clicked(node);
    if ("error" in found) return found;
    const { tree, target } = found;
    if (this.selected.includes(target.id)) return this.select(this.selected.filter((id) => id !== target.id));
    const anchor = this.selected.length ? tree.byId(this.selected[0]!) : null;
    if (!anchor || siblingGroup(tree, anchor) !== siblingGroup(tree, target)) return this.select([target.id]);
    return this.select([...this.selected, target.id]);
  }

  /**
   * The selected nodes' code (C3): each node's source text from its leading comment lines to its end,
   * re-indented to column 0 by its first line, in source order, joined by line feeds; empty when
   * nothing is selected. Changes nothing.
   */
  copy(): string {
    const name = this.activeName;
    const tree = name === null ? null : this.tree(name);
    if (!tree) return "";
    return this.selectedNodes(tree).map((n) => nodeCode(tree, n)).join("\n");
  }

  /**
   * Copy the selected nodes and remove them as one step (C4), selecting as {@link delete} does; the
   * result carries the copied text. Refused, changing nothing, as `delete` is.
   */
  cut(): CutResult | EditRefusal {
    const text = this.copy();
    const r = this.delete();
    if ("error" in r) return r;
    return { ...r, text };
  }

  /**
   * Insert a copy of each selected node directly after it (C1), as one step, and select the copies.
   * In a copy, an `.id("x")` the mockup already uses becomes `.id("x-<n>")` with the smallest `n` from
   * 2 that is free (C2). Refused when nothing is selected or a selected node is not placed among its
   * parent's children (an argument, a modifier's content, a struct body).
   */
  duplicate(): EditResult | EditRefusal {
    const name = this.activeName;
    const tree = name === null ? null : this.tree(name);
    if (name === null || !tree) return { error: "there is no active mockup", diagnostics: [] };
    const nodes = this.selectedNodes(tree);
    if (!nodes.length) return { error: "nothing is selected", diagnostics: [] };
    const used = usedIdentifiers(tree);
    const ops: OpOf[] = [];
    for (const n of nodes) {
      if (statementChildren(tree, n.parent).indexOf(n) < 0) return { error: notPlaced(n), diagnostics: [] };
      const code = freshIdentifiers(nodeCode(tree, n), used);
      const id = n.id;
      ops.push((t) => {
        const at = t.byId(id)!;
        return { op: "insert", parent: at.parent?.id ?? null, index: statementChildren(t, at.parent).indexOf(at) + 1, code };
      });
    }
    // Copies are inserted from the last node backwards, so that each finds its original where it was.
    return this.applyOps(name, ops.reverse(), "inserted");
  }

  /**
   * Insert the views `text` holds (C5), in order, as one step, and select them: as the last children of
   * the selected node when exactly one is selected and it is a container whose role accepts every
   * pasted element (R-PACK-016, with the active mockup's pack); else directly after the last selected
   * node; else (nothing selected, or a node not placed among its parent's children) at the end of the
   * mockup's top level. A pasted `.id("x")` the mockup already uses gets a free suffix as in
   * {@link duplicate}. Text that does not parse, or holds anything but views (an import, a directive,
   * a struct, a `let`), is refused with its diagnostics and records no step (C6).
   */
  paste(text: string): EditResult | EditRefusal {
    const name = this.activeName;
    const tree = name === null ? null : this.tree(name);
    if (name === null || !tree) return { error: "there is no active mockup", diagnostics: [] };
    const views = pastedViews(text);
    if ("error" in views) return views;
    const used = usedIdentifiers(tree);
    const codes = views.codes.map((c) => freshIdentifiers(c, used));
    const nodes = this.selectedNodes(tree);
    const pack = mockupPack(this.document, name) ?? "base";
    const only = nodes.length === 1 ? nodes[0]! : null;
    let ops: OpOf[];
    if (only && this.accepts(tree, only, views.elements, pack)) {
      ops = codes.map((code) => () => ({ op: "insert", parent: only.id, index: "end", code }));
    } else {
      const last = nodes[nodes.length - 1];
      const placed = last && statementChildren(tree, last.parent).indexOf(last) >= 0 ? last : null;
      if (placed) {
        // Each view after the one pasted before it, the first after the last selected node.
        ops = codes.map((code) => (t, inserted) => {
          const at = t.byId(inserted[inserted.length - 1] ?? placed.id)!;
          return { op: "insert", parent: at.parent?.id ?? null, index: statementChildren(t, at.parent).indexOf(at) + 1, code };
        });
      } else ops = codes.map((code) => () => ({ op: "insert", parent: null, index: "end", code }));
    }
    return this.applyOps(name, ops, "inserted");
  }

  /** Move the selected nodes one position up among their siblings (C7); at the first position nothing, and no step. */
  moveUp(): EditResult | EditRefusal {
    return this.moveBy(-1);
  }

  /** Move the selected nodes one position down among their siblings (C7); at the last position nothing, and no step. */
  moveDown(): EditResult | EditRefusal {
    return this.moveBy(1);
  }

  /**
   * Each selected node moves one position among its parent's statement children, as one step; nothing
   * when the first (up) or last (down) of them is at the edge already.
   */
  private moveBy(step: -1 | 1): EditResult | EditRefusal {
    const name = this.activeName;
    const tree = name === null ? null : this.tree(name);
    if (name === null || !tree) return { error: "there is no active mockup", diagnostics: [] };
    const nodes = this.selectedNodes(tree);
    if (!nodes.length) return { error: "nothing is selected", diagnostics: [] };
    const parent = nodes[0]!.parent;
    const children = statementChildren(tree, parent);
    for (const n of nodes) if (children.indexOf(n) < 0) return { error: notPlaced(n), diagnostics: [] };
    const edge = step < 0 ? children.indexOf(nodes[0]!) === 0 : children.indexOf(nodes[nodes.length - 1]!) === children.length - 1;
    if (edge) return { edits: [], source: tree.source, tree };
    const parentId = parent?.id ?? null;
    const order = step < 0 ? nodes : [...nodes].reverse();
    const ops: OpOf[] = order.map((n) => (t) => {
      const at = t.byId(n.id)!;
      const k = statementChildren(t, at.parent).indexOf(at);
      // `index` counts the children before the move: one up is before the previous one, one down after the next.
      return { op: "move", nodes: [n.id], parent: parentId, index: step < 0 ? k - 1 : k + 2 };
    });
    return this.applyOps(name, ops, [...this.selected]);
  }

  // --- restructuring commands (R-EDIT-009) --------------------------------------------------------

  /**
   * Wrap the selected siblings in one new call `<name> { … }` (C1) at the place of the first of them,
   * holding them in their order (they keep their ids), as one step, and select the new call. Refused,
   * changing nothing, with the role rule's sentence when `name` cannot hold one of the nodes or the
   * parent (past an `if` or a `ForEach`) cannot hold `name` in the active mockup's pack (C2), and when
   * nothing is selected or a selected node is not placed among its parent's children.
   */
  wrap(name: string): EditResult | EditRefusal {
    return this.runPlan((tree, pack) => this.planWrap(tree, pack, name));
  }

  /**
   * Replace the one selected node by its statement children (C3), its arguments, modifiers and other
   * closures removed with it, as one step, and select the children (they keep their ids). Refused when
   * the node has no children, when the parent cannot hold one of them, and when its content declares a
   * closure parameter or a `let` its children could use (C11).
   */
  unwrap(): EditResult | EditRefusal {
    return this.runPlan((tree, pack) => this.planUnwrap(tree, pack));
  }

  /**
   * Replace the one selected node's element name by `name` (C4) through `setName` (R-EDIT-003.C12),
   * when both are elements of the active mockup's pack with the same role, and remove the labelled
   * arguments the new element does not understand (R-EVAL-004.C7; a closure, a view or a binding is
   * kept) and the positional ones past the number of its `params` (C5). One step; the converted node,
   * which `setName` gives a new id, is selected.
   */
  convert(name: string): EditResult | EditRefusal {
    return this.runPlan((tree, pack) => this.planConvert(tree, pack, name));
  }

  /**
   * Declare `struct <name>: View` whose `body` holds the selected nodes (C6), after the mockup's last
   * struct declaration, else before its first view statement, and replace the nodes by the call
   * `<name>()`, which is selected; one step. Refused when `name` is not an identifier beginning with an
   * uppercase letter, is a struct of the mockup, an element of its pack or a name the mockup already
   * calls (so that the struct can never embed itself, R-EVAL-005.C10), and when the selection uses a
   * `let`, a closure parameter or a struct property declared outside it (C7).
   */
  extractComponent(name: string): EditResult | EditRefusal {
    return this.runPlan((tree, pack) => this.planExtract(tree, pack, name));
  }

  /**
   * The session's commands for a host's menus (C8): every command in menu order with its label, its
   * shortcut in the composite designer and whether it is enabled for the current selection — wrap for
   * {@link WRAP_DEFAULT}, convert for one selected element of the pack, extract for a selection it could
   * extract under a free name, paste whenever the active mockup's code parses; newMockup always,
   * duplicateMockup and deleteMockup whenever there is an active mockup (R-TOOL-013.C4).
   */
  get commands(): DesignCommand[] {
    const name = this.activeName;
    const state = name === null ? null : this.state(name);
    const tree = state && state.tree && state.tree.source === state.code ? state.tree : null;
    const pack = name === null ? "base" : mockupPack(this.document, name) ?? "base";
    const nodes = tree ? this.selectedNodes(tree) : [];
    const placed = !!tree && nodes.length > 0 && nodes.every((n) => statementChildren(tree, n.parent).includes(n));
    const ok = (p: CommandPlan | ViewNode[] | EditRefusal | null): boolean => !!p && !("error" in p);
    const enabled = (c: CommandName): boolean => {
      if (c === "undo") return this.canUndo;
      if (c === "redo") return this.canRedo;
      if (c === "newMockup") return true;
      if (c === "duplicateMockup" || c === "deleteMockup") return name !== null;
      if (!tree) return false;
      switch (c) {
        case "paste": return true;
        case "delete": case "cut": case "copy": return nodes.length > 0;
        case "duplicate": return placed;
        case "moveUp": case "moveDown": {
          if (!placed) return false;
          const children = statementChildren(tree, nodes[0]!.parent);
          return c === "moveUp" ? children.indexOf(nodes[0]!) > 0 : children.indexOf(nodes[nodes.length - 1]!) < children.length - 1;
        }
        case "wrap": return ok(this.planWrap(tree, pack, WRAP_DEFAULT));
        case "unwrap": return ok(this.planUnwrap(tree, pack));
        case "convert": return nodes.length === 1 && nodes[0]!.kind !== "if" && this.packElement(pack, nodes[0]!.name) !== null;
        case "extractComponent": return ok(this.checkExtractSelection(tree));
      }
      return false;
    };
    return COMMANDS.map((c) => ({ ...c, enabled: enabled(c.name) }));
  }

  /**
   * Run a command by its name (C8) with its arguments: `{name}` for wrap (default {@link WRAP_DEFAULT}),
   * convert and extractComponent, `{text}` for paste, `{mockup}` for duplicateMockup and deleteMockup
   * (newMockup takes none: a `VStack`). Returns what the command's method returns; copy returns
   * `{text}`. An unknown name is refused.
   */
  run(command: string, args: CommandArgs = {}): EditResult | EditRefusal | CutResult | { text: string } | { mockup: string } | { mockup: string; edits: TextEdit[] } | Refused {
    const a = args ?? {};
    switch (command) {
      case "delete": return this.delete();
      case "duplicate": return this.duplicate();
      case "cut": return this.cut();
      case "copy": return { text: this.copy() };
      case "paste": return this.paste(a.text as string);
      case "moveUp": return this.moveUp();
      case "moveDown": return this.moveDown();
      case "wrap": return this.wrap(a.name as string);
      case "unwrap": return this.unwrap();
      case "convert": return this.convert(a.name as string);
      case "extractComponent": return this.extractComponent(a.name as string);
      case "newMockup": return this.newMockup();
      case "duplicateMockup": return this.duplicateMockup(a.mockup);
      case "deleteMockup": return this.deleteMockup(a.mockup);
      case "undo": return this.undo();
      case "redo": return this.redo();
    }
    return { error: `unknown command ${JSON.stringify(command)}: expected ${COMMANDS.map((c) => c.name).join(", ")}` };
  }

  /** Plan a command on the active mockup's tree with its pack, and apply the plan as one step. */
  private runPlan(plan: (tree: SyntaxTree, pack: string) => CommandPlan | EditRefusal): EditResult | EditRefusal {
    const name = this.activeName;
    const tree = name === null ? null : this.tree(name);
    if (name === null || !tree) return { error: "there is no active mockup", diagnostics: [] };
    const p = plan(tree, mockupPack(this.document, name) ?? "base");
    if ("error" in p) return p;
    return this.applyOps(name, p.ops, p.select);
  }

  /** The selected nodes, when there are some and each is placed among its parent's statement children. */
  private placedSelection(tree: SyntaxTree): ViewNode[] | EditRefusal {
    const nodes = this.selectedNodes(tree);
    if (!nodes.length) return { error: "nothing is selected", diagnostics: [] };
    for (const n of nodes) if (statementChildren(tree, n.parent).indexOf(n) < 0) return { error: notPlaced(n), diagnostics: [] };
    return nodes;
  }

  /** Whether the role rules of `pack` can be asked. */
  private rulesFor(pack: string): boolean {
    return rolesLoaded() && registry.ids().includes(pack);
  }

  /** An element of `pack`, or null (also when the pack is not loaded). */
  private packElement(pack: string, name: string) {
    return registry.ids().includes(pack) ? registry.get(pack).element(name) ?? null : null;
  }

  private planWrap(tree: SyntaxTree, pack: string, name: string): CommandPlan | EditRefusal {
    if (typeof name !== "string" || !ELEMENT_NAME.test(name)) {
      return { error: `${JSON.stringify(name ?? null)} is not an element name: a capitalised identifier, or several joined by dots`, diagnostics: [] };
    }
    const nodes = this.placedSelection(tree);
    if ("error" in nodes) return nodes;
    const parent = nodes[0]!.parent;
    if (this.rulesFor(pack)) {
      const r = canContain(pack, holderOf(parent)?.name ?? null, name);
      if (!r.ok) return { error: r.reason, diagnostics: [] };
      for (const n of nodes) {
        const c = canContain(pack, name, n.name);
        if (!c.ok) return { error: c.reason, diagnostics: [] };
      }
    }
    const index = statementChildren(tree, parent).indexOf(nodes[0]!);
    const parentId = parent?.id ?? null;
    const ids = nodes.map((n) => n.id);
    const ops: OpOf[] = [
      () => ({ op: "insert", parent: parentId, index, code: `${name} {\n}` }),
      (_t, inserted) => ({ op: "move", nodes: ids, parent: inserted[0]!, index: "end" }),
    ];
    return { ops, select: "inserted" };
  }

  private planUnwrap(tree: SyntaxTree, pack: string): CommandPlan | EditRefusal {
    const nodes = this.placedSelection(tree);
    if ("error" in nodes) return nodes;
    if (nodes.length !== 1) return { error: "unwrap needs one selected node", diagnostics: [] };
    const n = nodes[0]!;
    const children = n.kind === "call" ? statementChildren(tree, n) : [];
    if (!children.length) return { error: `${n.name} has no children to unwrap`, diagnostics: [] };
    const content = (n.syntax as A.Call).trailing.find(([label]) => label === null)?.[1];
    if (content?.params.length) {
      return { error: `${n.name} declares the parameter ${content.params.join(", ")} for its children, so they cannot stand without it`, diagnostics: [] };
    }
    if (content?.body.some((st) => st.kind === "LetStmt")) {
      return { error: `${n.name} declares a let for its children, so they cannot stand without it`, diagnostics: [] };
    }
    if (this.rulesFor(pack)) {
      const holder = holderOf(n.parent)?.name ?? null;
      for (const c of children) {
        const r = canContain(pack, holder, c.name);
        if (!r.ok) return { error: r.reason, diagnostics: [] };
      }
    }
    const index = statementChildren(tree, n.parent).indexOf(n);
    const parentId = n.parent?.id ?? null;
    const ids = children.map((c) => c.id);
    return {
      ops: [
        () => ({ op: "move", nodes: ids, parent: parentId, index }),
        () => ({ op: "remove", nodes: [n.id] }),
      ],
      select: ids,
    };
  }

  private planConvert(tree: SyntaxTree, pack: string, name: string): CommandPlan | EditRefusal {
    const nodes = this.selectedNodes(tree);
    if (!nodes.length) return { error: "nothing is selected", diagnostics: [] };
    if (nodes.length !== 1) return { error: "convert needs one selected node", diagnostics: [] };
    const n = nodes[0]!;
    if (n.kind === "if") return { error: `${n.ordinal} is an if statement, not an element`, diagnostics: [] };
    if (typeof name !== "string" || !ELEMENT_NAME.test(name)) {
      return { error: `${JSON.stringify(name ?? null)} is not an element name: a capitalised identifier, or several joined by dots`, diagnostics: [] };
    }
    if (!registry.ids().includes(pack)) return { error: `pack '${pack}' is not loaded`, diagnostics: [] };
    const p = registry.get(pack);
    const from = p.element(n.name);
    const to = p.element(name);
    if (!from) return { error: `${n.name} is not an element of pack '${pack}'`, diagnostics: [] };
    if (!to) return { error: `${name} is not an element of pack '${pack}'`, diagnostics: [] };
    if (from.role !== to.role) {
      const title = (role: string) => roleRule(role)?.title ?? role;
      return { error: `${n.name} is ${article(title(from.role))} and ${name} ${article(title(to.role))} in pack '${pack}': convert keeps the role`, diagnostics: [] };
    }
    const index = n.index;
    const at = (t: SyntaxTree) => t.byOrdinal(index)!.id;
    const ops: OpOf[] = [(t) => ({ op: "setName", node: at(t), name })];
    if (n.kind === "call") {
      const call = n.syntax as A.Call;
      const viewArgs = new Set(n.children.map((c) => c.expr));
      for (const arg of call.args) {
        if (arg.label === null) continue;
        const v = arg.value;
        if (v.kind === "Closure" || viewArgs.has(v) || (v.kind === "Ident" && v.binding === true)) continue;
        if (labelUnderstood(p, to, arg.label)) continue;
        const label = arg.label;
        ops.push((t) => ({ op: "setArgument", node: at(t), label, value: null }));
      }
      const positional = call.args.filter((a) => a.label === null).length;
      for (let k = positional - 1; k >= to.params.length; k--) {
        ops.push((t) => ({ op: "setArgument", node: at(t), label: null, position: k, value: null }));
      }
    }
    return { ops, select: (t) => [at(t)] };
  }

  /** What extract asks of the selection whatever the name (C7): placed nodes using nothing declared outside them. */
  private checkExtractSelection(tree: SyntaxTree): ViewNode[] | EditRefusal {
    const nodes = this.placedSelection(tree);
    if ("error" in nodes) return nodes;
    const inside = (at: number | undefined) => at !== undefined && nodes.some((n) => n.span.start <= at && at < n.span.end);
    const outside = new Set<string>();
    collectDeclarations(tree.module, (name, at) => {
      if (!inside(at)) outside.add(name);
    });
    const struct = tree.module.structs.find((st) => st.start !== undefined && st.end !== undefined && st.start <= nodes[0]!.first && nodes[0]!.first < st.end);
    for (const prop of struct?.properties ?? []) outside.add(prop.name);
    const used = new Set<string>();
    for (const n of nodes) freeNames(n.expr, new Set(), used);
    const bad = [...used].find((u) => outside.has(u));
    if (bad !== undefined) return { error: `the selection uses ${bad}, declared outside it`, diagnostics: [] };
    return nodes;
  }

  private planExtract(tree: SyntaxTree, pack: string, name: string): CommandPlan | EditRefusal {
    if (typeof name !== "string" || !COMPONENT_NAME.test(name)) {
      return { error: `${JSON.stringify(name ?? null)} is not a component name: an identifier beginning with an uppercase letter`, diagnostics: [] };
    }
    if (tree.module.structs.some((st) => st.name === name)) return { error: `${name} is already a struct of this mockup`, diagnostics: [] };
    if (this.packElement(pack, name)) return { error: `${name} is an element of pack '${pack}'`, diagnostics: [] };
    if (tree.nodes.some((n) => n.name === name)) {
      return { error: `the mockup already uses ${name}, so the struct would change what it shows`, diagnostics: [] };
    }
    const nodes = this.checkExtractSelection(tree);
    if ("error" in nodes) return nodes;
    const unit = indentUnit(tree.source);
    const body = nodes.flatMap((n) => nodeCode(tree, n).split("\n").map((l) => (l ? unit + unit + l : l)));
    const decl = [`struct ${name}: View {`, `${unit}var body: some View {`, ...body, `${unit}}`, "}"].join("\n");
    const parent = nodes[0]!.parent;
    const parentId = parent?.id ?? null;
    const index = statementChildren(tree, parent).indexOf(nodes[0]!);
    const ids = nodes.map((n) => n.id);
    const ops: OpOf[] = [
      () => ({ op: "remove", nodes: ids }),
      () => ({ op: "insert", parent: parentId, index, code: `${name}()` }),
      (t) => {
        const structs = t.module.structs.filter((st) => st.end !== undefined);
        const last = structs[structs.length - 1];
        if (last) return { op: "text", edits: [{ start: last.end!, end: last.end!, text: `\n\n${decl}` }] };
        const first = statementChildren(t, null)[0];
        const at = first ? t.source.lastIndexOf("\n", first.span.start - 1) + 1 : t.source.length;
        return { op: "text", edits: [{ start: at, end: at, text: `${decl}\n\n` }] };
      },
    ];
    return { ops, select: "inserted" };
  }

  /** The node of the active mockup a click names, and its tree. */
  private clicked(node: string): { tree: SyntaxTree; target: ViewNode } | Refused {
    const name = this.activeName;
    if (name === null) return { error: "there is no active mockup" };
    const tree = this.tree(name);
    const target = tree?.byId(node);
    if (!tree || !target) return { error: `${JSON.stringify(node)} is not a node of mockup ${JSON.stringify(name)}` };
    return { tree, target };
  }

  /** The selected nodes of a tree, in source order. */
  private selectedNodes(tree: SyntaxTree): ViewNode[] {
    return this.selected.map((id) => tree.byId(id)).filter((n): n is ViewNode => !!n).sort((a, b) => a.first - b.first);
  }

  /** Whether pasted elements go into `node` (C5): it is a container whose role accepts each of them. */
  private accepts(tree: SyntaxTree, node: ViewNode, elements: readonly string[], pack: string): boolean {
    if (!this.isContainer(node.id, pack)) return false;
    if (!rolesLoaded() || !registry.ids().includes(pack)) return true;
    return elements.every((e) => canContain(pack, node.name, e).ok);
  }

  /**
   * Apply a command's operations one after the other to the active mockup as one change and one step
   * (C10): one `change` whose single edit turns the code before into the code after, an `insert` per
   * inserted view, then the selection (`inserted`: the inserted views in source order). Nothing
   * changes when any operation is refused.
   */
  private applyOps(name: string, ops: readonly OpOf[], select: SelectAfter): EditResult | EditRefusal {
    const state = this.state(name)!;
    if (!state.tree || state.tree.source !== state.code) {
      return { error: `the code of mockup ${JSON.stringify(name)} does not parse`, diagnostics: state.diagnostics.filter((d) => d.severity === "error") };
    }
    const start = state.tree;
    let tree = start;
    const inserted: string[] = [];
    for (const make of ops) {
      const op = make(tree, inserted);
      if ("error" in op) return op;
      if (op.op === "text") {
        const t = reparse(tree, op.edits);
        if (!t.tree) return { error: "the edited source does not parse", diagnostics: t.diagnostics };
        tree = t.tree;
        continue;
      }
      const r = edit(tree, op);
      if ("error" in r) return r;
      if (op.op === "insert") {
        const n = insertedNode(tree, r.tree);
        if (n) inserted.push(n.id);
      }
      tree = r.tree;
    }
    if (tree.source === start.source) return { edits: [], source: start.source, tree: start };
    const edits = diff(start.source, tree.source);
    const pending = this.begin(name, "code", {});
    const mockup = this.mockup(name)!;
    mockup.code = tree.source;
    state.code = tree.source;
    state.tree = tree;
    const step = this.record(pending, edits);
    this.notify({ kind: "change", detail: { kind: "code", mockup: name, edits, code: tree.source } });
    const final = tree;
    const added = inserted.map((id) => final.byId(id)).filter((n): n is ViewNode => !!n).sort((a, b) => a.first - b.first);
    for (const n of added) this.notify({ kind: "insert", detail: { mockup: name, node: n.id, element: n.name } });
    const next = select === "inserted" ? added.map((n) => n.id) : typeof select === "function" ? select(final, inserted) : select;
    this.afterCodeChange(name, state, next);
    this.settle(step);
    return { edits, source: tree.source, tree };
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
    if (!this.parses(name)) return { ok: false, reason: "The code does not parse: fix it in the code view first" };
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

  /**
   * Rename a mockup (R-TOOL-012.C4 to C7): refused, changing and notifying nothing, for an empty name or
   * one another mockup holds (names are case-sensitive and kept as written); renaming to its own name
   * changes nothing. Otherwise one `rename` `{from, to}` and one undo step; the active mockup and the
   * document's `view.active` follow the name.
   */
  renameMockup(from: string, to: string): { mockup: string } | Refused {
    const mockup = this.mockup(from);
    if (!mockup) return { error: `there is no mockup named ${JSON.stringify(from)}` };
    const refused = renameRefusal(this.document.mockups.map((m) => m.name), from, to);
    if (refused !== null) return { error: refused };
    if (to === from) return { mockup: from };
    const pending = this.begin(from, "rename", {});
    this.setName(mockup, to);
    const step = this.record(pending, []);
    this.notify({ kind: "rename", detail: { from, to } });
    this.settle(step);
    return { mockup: to };
  }

  /**
   * Add a mockup (R-TOOL-012.C8) with `code` (default {@link NEW_MOCKUP_CODE}) and `options`: named
   * `Mockup <n>` (the smallest free `n` from 1), placed at the active mockup's `y`, 80 units right of
   * the rightmost frame that overlaps the active one vertically (sizes from {@link measure}), and made
   * the active mockup. One `change` of kind `mockups`, then `active` (and `select`, `hover` when they
   * are cleared); one undo step.
   */
  newMockup(code: string = NEW_MOCKUP_CODE, options?: Record<string, unknown>): { mockup: string } | Refused {
    if (typeof code !== "string") return { error: "code must be a string" };
    if (options !== undefined && (options === null || typeof options !== "object" || Array.isArray(options))) return { error: "options must be an object" };
    const name = newMockupName(this.document.mockups.map((m) => m.name));
    const current = this.activeName === null ? null : this.mockup(this.activeName);
    const at = newMockupPlace(current ? this.box(current) : null, this.document.mockups.map((m) => this.box(m)));
    return this.addMockup({ name, x: at.x, y: at.y, ...(options ? { options: { ...options } } : {}), code });
  }

  /**
   * Copy a mockup, the active one by default (R-TOOL-013.C5): its code, options and every other key,
   * named `<name> copy` or `<name> copy <n>` ({@link duplicateMockupName}) and placed as a new mockup is
   * placed, beside the mockup it copies (R-TOOL-012.C8); the copy becomes the active mockup. One
   * `change` of kind `mockups`, then `active`; one undo step.
   */
  duplicateMockup(name?: string): { mockup: string } | Refused {
    const target = name ?? this.activeName;
    if (target === null) return { error: "there is no active mockup" };
    const source = this.mockup(target);
    if (!source) return { error: `there is no mockup named ${JSON.stringify(target)}` };
    const copy = structuredClone(source);
    copy.name = duplicateMockupName(this.document.mockups.map((m) => m.name), source.name);
    const at = newMockupPlace(this.box(source), this.document.mockups.map((m) => this.box(m)));
    copy.x = at.x;
    copy.y = at.y;
    return this.addMockup(copy);
  }

  /**
   * Remove a mockup, the active one by default (R-TOOL-013.C4). Deleting the active mockup makes the
   * next one in document order active, else the one before it, else none (the selection and the hover
   * then cleared without an `active`). One `change` of kind `mockups`, then `active`, `select` and
   * `hover` as they changed; one undo step, whose undo puts the mockup back where it was, active again
   * when it was.
   */
  deleteMockup(name?: string): { mockup: string } | Refused {
    const target = name ?? this.activeName;
    if (target === null) return { error: "there is no active mockup" };
    const mockup = this.mockup(target);
    if (!mockup) return { error: `there is no mockup named ${JSON.stringify(target)}` };
    const pending = this.begin(target, "mockups", {}, true);
    const list = this.document.mockups;
    const k = list.indexOf(mockup);
    list.splice(k, 1);
    const step = this.record(pending, []);
    // The active mockup moves on before the change is told, so that no listener reads a removed one.
    const switched = this.activeName === target;
    if (switched) this.activeName = (list[k] ?? list[k - 1])?.name ?? null;
    this.notify({ kind: "change", detail: { kind: "mockups", mockup: target, edits: [], code: mockup.code } });
    if (switched) {
      const active = this.activeName ?? target;
      if (this.activeName !== null) this.notify({ kind: "active", detail: { mockup: active } });
      if (this.selected.length) {
        this.selected = [];
        this.notify({ kind: "select", detail: { mockup: active, nodes: [] } });
      }
      if (this.hoveredId !== null) {
        this.hoveredId = null;
        this.notify({ kind: "hover", detail: { mockup: active, node: null } });
      }
    }
    this.settle(step);
    return { mockup: target };
  }

  /** A mockup's frame for placing (R-TOOL-012.C8): its position and the size {@link measure} gives, else its options' `width` and `height`, else 0. */
  private box(m: DesignMockup): { x: number; y: number; w: number; h: number } {
    const size = this.measure?.(m.name) ?? null;
    const own = (key: "width" | "height"): number => {
      const v = m.options?.[key];
      return typeof v === "number" && Number.isFinite(v) ? v : 0;
    };
    return { x: m.x, y: m.y, w: size?.w ?? own("width"), h: size?.h ?? own("height") };
  }

  /** Append a mockup to the document as one step of kind `mockups` and make it active. */
  private addMockup(mockup: DesignMockup): { mockup: string } {
    const place = this.place();
    const list = [...this.document.mockups];
    this.document.mockups.push(mockup);
    const before: Snapshot = {
      name: mockup.name, list, code: mockup.code, tree: this.stateOf(mockup).tree,
      options: mockup.options && structuredClone(mockup.options), x: mockup.x, y: mockup.y,
    };
    const pending: Pending = { mockup, kind: "mockups", before, place, key: undefined };
    const step = this.record(pending, []);
    this.notify({ kind: "change", detail: { kind: "mockups", mockup: mockup.name, edits: [], code: mockup.code } });
    this.setActive(mockup.name);
    this.settle(step);
    return { mockup: mockup.name };
  }

  // --- sections and the view (R-TOOL-014) --------------------------------------------------------

  /** The document's sections, in document order (none when it has no `sections`). */
  get sections(): readonly DesignSection[] {
    return this.document.sections ?? [];
  }

  /**
   * Add a section named `name` enclosing the active mockup's frame with a margin of 40 canvas units
   * (C2, {@link sectionAround}; the frame's size from {@link measure}), at the end of the document's
   * `sections`, which it creates when the document has none. Refused, changing nothing, for an empty
   * name or with no active mockup. One `change` of kind `sections`; one undo step.
   */
  newSection(name: string): { section: number } | Refused {
    const refused = sectionNameRefusal(name);
    if (refused !== null) return { error: refused };
    const active = this.activeName === null ? null : this.mockup(this.activeName);
    if (!active) return { error: "there is no active mockup" };
    return this.changeSections((list) => {
      list.push({ name, ...sectionAround(this.box(active)) });
      return list.length - 1;
    });
  }

  /**
   * Move section `index` to `(x, y)` (C3) with every frame lying wholly inside it before the move
   * ({@link framesInside}, the frames' sizes from {@link measure}), each by the same distance. One
   * `change` of kind `sections`; one undo step; a move to where it is changes nothing.
   */
  moveSection(index: number, x: number, y: number): { section: number } | Refused {
    const section = this.sections[index];
    if (!section) return { error: `there is no section ${index}` };
    if (!Number.isFinite(x) || !Number.isFinite(y)) return { error: "x and y must be finite numbers" };
    if (section.x === x && section.y === y) return { section: index };
    const dx = x - section.x;
    const dy = y - section.y;
    const inside = new Set(framesInside(section, this.document.mockups.map((m) => [m.name, this.box(m)] as const)));
    return this.changeSections(() => {
      section.x = x;
      section.y = y;
      for (const m of this.document.mockups) {
        if (!inside.has(m.name)) continue;
        m.x += dx;
        m.y += dy;
      }
      return index;
    });
  }

  /** Give section `index` the box `box` (C3), its frames left where they are. One `change` of kind `sections`; one undo step. */
  resizeSection(index: number, box: CanvasBox): { section: number } | Refused {
    const section = this.sections[index];
    if (!section) return { error: `there is no section ${index}` };
    const ok = box && Number.isFinite(box.x) && Number.isFinite(box.y) && Number.isFinite(box.w) && Number.isFinite(box.h) && box.w > 0 && box.h > 0;
    if (!ok) return { error: "a section's box needs finite x and y and a positive w and h" };
    if (section.x === box.x && section.y === box.y && section.w === box.w && section.h === box.h) return { section: index };
    return this.changeSections(() => {
      Object.assign(section, { x: box.x, y: box.y, w: box.w, h: box.h });
      return index;
    });
  }

  /**
   * Rename section `index` (C3): refused for an empty name; section names need not be unique, and
   * renaming to its own name changes nothing. One `change` of kind `sections`; one undo step.
   */
  renameSection(index: number, name: string): { section: number } | Refused {
    const section = this.sections[index];
    if (!section) return { error: `there is no section ${index}` };
    const refused = sectionNameRefusal(name);
    if (refused !== null) return { error: refused };
    if (section.name === name) return { section: index };
    return this.changeSections(() => {
      section.name = name;
      return index;
    });
  }

  /**
   * Write a canvas's view and the active mockup's name to the document's `view` (C4): `zoom`, `x`, `y`
   * and `active` (removed when no mockup is active), its other keys kept, but only when the view or the
   * active mockup differs from the one the document opens with ({@link documentView}, and `view.active`
   * when a mockup holds it, else the first mockup), so that a document opened and written back without
   * an edit is unchanged (C5). Not a step of the history and notifies nothing. Without `view` the
   * document's own is kept and only the active mockup is compared. Returns the document's view.
   */
  saveView(view?: CanvasView): DesignView | undefined {
    const doc = this.document;
    const opened = documentView(doc.view);
    const named = doc.view?.active;
    const openedActive = typeof named === "string" && this.mockup(named) ? named : doc.mockups[0]?.name ?? null;
    const v = view && Number.isFinite(view.zoom) && Number.isFinite(view.x) && Number.isFinite(view.y) ? view : opened;
    if (v.zoom === opened.zoom && v.x === opened.x && v.y === opened.y && this.activeName === openedActive) return doc.view;
    const target = (doc.view ??= {});
    target.zoom = v.zoom;
    target.x = v.x;
    target.y = v.y;
    if (this.activeName === null) delete target.active;
    else target.active = this.activeName;
    return target;
  }

  /** Change the sections as one step of the history: `change` the document's list of sections, notify, settle. */
  private changeSections(change: (list: DesignSection[]) => number): { section: number } {
    const place = this.place();
    const before = this.sectionsSnapshot();
    const list = (this.document.sections ??= []);
    const index = change(list);
    const step: SectionStep = {
      mockup: null, kind: "sections", before, after: this.sectionsSnapshot(), placeBefore: place, placeAfter: place, key: undefined, time: this.now(),
    };
    this.steps.length = this.cursor;
    this.steps.push(step);
    if (this.steps.length > this.historyLimit) this.steps.splice(0, this.steps.length - this.historyLimit);
    this.cursor = this.steps.length;
    this.open = step;
    this.notify({ kind: "change", detail: { kind: "sections", mockup: "", edits: [], code: "" } });
    this.settle(step);
    return { section: index };
  }

  private sectionsSnapshot(): SectionsSnapshot {
    const list = this.document.sections;
    return {
      list: list === undefined ? undefined : [...list],
      values: (list ?? []).map((s) => [s, { name: s.name, x: s.x, y: s.y, w: s.w, h: s.h }]),
      frames: this.document.mockups.map((m) => [m, m.x, m.y]),
    };
  }

  /** Put the sections and the frames back to a snapshot: one `change` of kind `sections`. */
  private restoreSections(snap: SectionsSnapshot): { mockup: string; edits: TextEdit[] } {
    if (snap.list === undefined) delete this.document.sections;
    else if (this.document.sections) this.document.sections.splice(0, this.document.sections.length, ...snap.list);
    else this.document.sections = [...snap.list];
    for (const [s, v] of snap.values) Object.assign(s, v);
    for (const [m, x, y] of snap.frames) {
      m.x = x;
      m.y = y;
    }
    this.notify({ kind: "change", detail: { kind: "sections", mockup: "", edits: [], code: "" } });
    return { mockup: "", edits: [] };
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
    if (step.kind === "sections") return this.restoreSections(step.before);
    return this.restore(step, step.before, step.placeBefore, step.inverse);
  }

  /** Reapply the step undone last (C3): the state and the selection from after it; one `change` (C7). */
  redo(): { mockup: string; edits: TextEdit[] } | Refused {
    if (!this.canRedo) return { error: "there is nothing to redo" };
    const step = this.steps[this.cursor++]!;
    this.open = null;
    if (step.kind === "sections") return this.restoreSections(step.after);
    return this.restore(step, step.after, step.placeAfter, step.edits);
  }

  // --- internals ----------------------------------------------------------------------------------

  /** A change of a mockup begins: what its step keeps of the state before it. */
  private begin(name: string, kind: StepKind, history: HistoryOptions, list = false): Pending {
    const key = typeof history?.coalesce === "string" ? history.coalesce : undefined;
    const mockup = this.mockup(name)!;
    return { mockup, kind, before: this.snapshot(mockup, list), place: this.place(), key };
  }

  /**
   * The change is made (before its `change` is notified, so that a listener reads `canUndo` right):
   * merged into the open step when it coalesces with it (C4), else a new step that drops the steps that
   * could have been redone (C6) and, past the limit, the oldest (C9). Returns the step to settle.
   */
  private record(p: Pending, edits: TextEdit[]): Step | null {
    const after = this.snapshot(p.mockup, p.before.list !== undefined);
    const time = this.now();
    const last = this.cursor > 0 ? this.steps[this.cursor - 1]! : null;
    if (p.key !== undefined && last && last.kind !== "sections" && last === this.open && this.cursor === this.steps.length
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
    const step: MockupStep = {
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

  private snapshot(mockup: DesignMockup, list = false): Snapshot {
    const state = this.stateOf(mockup);
    return {
      name: mockup.name, ...(list ? { list: [...this.document.mockups] } : {}),
      code: mockup.code, tree: state.tree,
      options: mockup.options === undefined ? undefined : structuredClone(mockup.options),
      x: mockup.x, y: mockup.y,
    };
  }

  private place(): Place {
    return { active: this.activeName === null ? null : this.mockup(this.activeName), nodes: [...this.selected] };
  }

  /** Put a step's mockup back to a snapshot and the active mockup and selection back to a place. */
  private restore(step: MockupStep, snap: Snapshot, place: Place, edits: TextEdit[]): { mockup: string; edits: TextEdit[] } | Refused {
    const mockup = step.mockup;
    if (snap.list) this.document.mockups.splice(0, this.document.mockups.length, ...snap.list);
    const held = this.document.mockups.includes(mockup);
    if (!held && !snap.list) return { error: `there is no mockup named ${JSON.stringify(mockup.name)}` };
    const from = mockup.name;
    if (snap.name !== from) this.setName(mockup, snap.name);
    const name = mockup.name;
    const state = this.stateOf(mockup);
    const wanted = place.active !== null && this.document.mockups.includes(place.active) ? place.active.name : this.activeName;
    const active = wanted !== null && this.mockup(wanted) ? wanted : this.document.mockups[0]?.name ?? null;
    const switched = active !== this.activeName;
    if (switched) {
      this.activeName = active;
      if (active !== null) this.notify({ kind: "active", detail: { mockup: active } });
    }
    mockup.code = snap.code;
    state.code = snap.code;
    state.tree = snap.tree;
    if (snap.options === undefined) delete mockup.options;
    else mockup.options = structuredClone(snap.options);
    mockup.x = snap.x;
    mockup.y = snap.y;
    const shown = step.kind === "code" ? [...edits] : [];
    if (step.kind === "rename") this.notify({ kind: "rename", detail: { from, to: name } });
    else this.notify({ kind: "change", detail: { kind: step.kind, mockup: name, edits: shown, code: mockup.code } });
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
    if (held) this.updateDiagnostics(name, state);
    return { mockup: name, edits: shown };
  }

  /** The state of a mockup, parsed when first needed or when its code changed outside the session. */
  private state(name: string): MockupState | null {
    const mockup = this.mockup(name);
    return mockup ? this.stateOf(mockup) : null;
  }

  private stateOf(mockup: DesignMockup): MockupState {
    let state = this.states.get(mockup);
    if (!state) {
      state = { code: mockup.code, tree: null, diagnostics: [] };
      state.tree = parseTree(mockup.code).tree;
      state.diagnostics = this.check(mockup.name, mockup.code);
      this.states.set(mockup, state);
    } else if (state.code !== mockup.code) {
      this.reparseState(state, mockup.code);
      state.diagnostics = this.check(mockup.name, mockup.code);
    }
    return state;
  }

  /** Give a mockup another name: the active mockup and the document's `view.active` follow it. */
  private setName(mockup: DesignMockup, name: string): void {
    const old = mockup.name;
    mockup.name = name;
    if (this.activeName === old) this.activeName = name;
    if (this.document.view && this.document.view.active === old) this.document.view.active = name;
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
  return a.name === b.name && a.code === b.code && a.x === b.x && a.y === b.y && JSON.stringify(a.options) === JSON.stringify(b.options)
    && (a.list === b.list || (!!a.list && !!b.list && sameList(a.list, b.list)));
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

/** The node whose role rules hold a parent's children: past an `if` and a `ForEach`, null for the root. */
function holderOf(parent: ViewNode | null): ViewNode | null {
  let holder = parent;
  while (holder && (holder.kind === "if" || TRANSPARENT.has(holder.name))) holder = holder.parent;
  return holder;
}

/** A role title with its indefinite article. */
function article(title: string): string {
  return `${/^[aeiou]/i.test(title) ? "an" : "a"} ${title}`;
}

/** Every `let` and closure parameter a module declares, with the offset of its declaration. */
function collectDeclarations(module: A.Module, found: (name: string, at: number | undefined) => void): void {
  const walk = (x: unknown): void => {
    if (Array.isArray(x)) {
      for (const y of x) walk(y);
      return;
    }
    if (!x || typeof x !== "object") return;
    const node = x as { kind?: string; name?: string; params?: string[]; start?: number };
    if (node.kind === "LetStmt") found(node.name!, node.start);
    if (node.kind === "Closure") for (const p of node.params ?? []) found(p, node.start);
    for (const [k, v] of Object.entries(x)) if (k !== "loc" && v && typeof v === "object") walk(v);
  };
  walk(module.statements);
  for (const st of module.structs) {
    walk(st.body);
    for (const p of st.properties) walk(p.default);
  }
}

/** The identifiers an expression uses that it does not declare itself (closure parameters, `let`s). */
function freeNames(x: unknown, bound: ReadonlySet<string>, out: Set<string>): void {
  if (Array.isArray(x)) {
    // A list of statements: a `let` binds its name for the statements after it.
    let b = bound;
    for (const y of x) {
      freeNames(y, b, out);
      const let_ = y as { kind?: string; name?: string };
      if (let_?.kind === "LetStmt") b = new Set([...b, let_.name!]);
    }
    return;
  }
  if (!x || typeof x !== "object") return;
  const node = x as { kind?: string; name?: string; params?: string[]; body?: unknown; value?: unknown };
  if (node.kind === "Ident") {
    if (!bound.has(node.name!)) out.add(node.name!);
    return;
  }
  if (node.kind === "Closure") {
    freeNames(node.body, new Set([...bound, ...(node.params ?? [])]), out);
    return;
  }
  for (const [k, v] of Object.entries(x)) if (k !== "loc" && v && typeof v === "object") freeNames(v, bound, out);
}

/** Why a command cannot act on a node that stands outside its parent's statement children. */
function notPlaced(n: ViewNode): string {
  return `${n.name} is not placed among its parent's children (an argument, a modifier's content or a struct body)`;
}

/** Every string identifier of a tree's `.id(…)` modifiers. */
function usedIdentifiers(tree: SyntaxTree): Set<string> {
  const used = new Set<string>();
  for (const n of tree.nodes) for (const id of identifiersOf(n)) used.add(id);
  return used;
}

/**
 * A view's code with each `.id("x")` that `used` holds renamed to `x-<n>`, `n` the smallest integer
 * from 2 that `used` does not hold (R-EDIT-008.C2); every identifier of the result is added to `used`.
 */
function freshIdentifiers(code: string, used: Set<string>): string {
  let tree = parseTree(code).tree;
  if (!tree) return code;
  for (const id of tree.nodes.map((n) => n.id)) {
    const n = tree.byId(id);
    const x = n ? identifiersOf(n)[0] : undefined;
    if (!n || x === undefined) continue;
    if (!used.has(x)) {
      used.add(x);
      continue;
    }
    let k = 2;
    while (used.has(`${x}-${k}`)) k++;
    const r = edit(tree, { op: "rename", node: id, id: `${x}-${k}` });
    if ("error" in r) continue;
    used.add(`${x}-${k}`);
    tree = r.tree;
  }
  return tree.source;
}

/**
 * The views pasted text holds (R-EDIT-008.C5, C6): each top-level view's code at column 0 with its
 * comment lines, and the element names of the calls among them; refused, with the syntax
 * diagnostics, when the text does not parse, and when it holds no view or anything but views.
 */
function pastedViews(text: unknown): { codes: string[]; elements: string[] } | EditRefusal {
  if (typeof text !== "string") return { error: "the pasted text is not a string", diagnostics: [] };
  const r = parseTree(text.replace(/^(?:[ \t]*\r?\n)+/, "").replace(/\s+$/, ""));
  if (!r.tree) {
    const errors = r.diagnostics.filter((d) => d.severity === "error");
    const d = errors[0];
    const at = d && d.location.line ? ` (line ${d.location.line}, column ${d.location.col})` : "";
    return { error: `the pasted text does not parse: ${d ? d.message : "unknown error"}${at}`, diagnostics: errors };
  }
  const tree = r.tree;
  const m = tree.module;
  if (m.imports.length || m.structs.length || m.attributes.length) {
    return { error: "the pasted text must hold views only, not an import, a directive or a struct", diagnostics: [] };
  }
  const roots: ViewNode[] = [];
  for (const s of m.statements) {
    const root = tree.roots.find((n) => (s.kind === "IfStmt" ? n.syntax === s : s.kind === "ExprStmt" && n.expr === s.expr));
    if (!root) return { error: "the pasted text must hold views only, not a let or another statement", diagnostics: [] };
    roots.push(root);
  }
  if (!roots.length) return { error: "the pasted text holds no view", diagnostics: [] };
  return { codes: roots.map((n) => nodeCode(tree, n)), elements: roots.filter((n) => n.kind === "call").map((n) => n.name) };
}

/** An edit refusal as a sentence: its first letter capitalised. */
function sentence(text: string): string {
  return text ? text[0]!.toUpperCase() + text.slice(1) : text;
}

function sameList<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

function sameDiagnostics(a: readonly Diagnostic[], b: readonly Diagnostic[]): boolean {
  return a.length === b.length && a.every((d, i) => JSON.stringify(d.toJSON()) === JSON.stringify(b[i].toJSON()));
}
