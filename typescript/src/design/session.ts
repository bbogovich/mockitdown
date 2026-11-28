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
 */

import { check } from "../core/api.js";
import { assetsLoaded } from "../core/assets.js";
import { Diagnostic, MockitdownError } from "../core/diagnostics.js";
import type { RenderOptions } from "../core/options.js";
import { registry } from "../core/packs/registry.js";
import { edit, type EditOp, type EditRefusal, type EditResult } from "../core/syntax/edit.js";
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

/** A refused session request: why. */
export interface Refused {
  error: string;
}

/** Options of a session. */
export interface DesignSessionOptions {
  /**
   * Render options under every mockup's own (`import_resolver`, `asset_base`, …), used when the session
   * checks a mockup for its diagnostics.
   */
  renderOptions?: Partial<RenderOptions>;
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

  /**
   * A session over `document`. The active mockup is the one the document's `view.active` names, else
   * the first mockup, else none. Mockups are parsed when first needed (C2).
   */
  constructor(document: DesignDocument, options: DesignSessionOptions = {}) {
    this.document = document;
    this.renderOptions = { ...(options.renderOptions ?? {}) };
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
  apply(op: EditOp): EditResult | EditRefusal {
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
    const mockup = this.mockup(name)!;
    mockup.code = result.source;
    state.code = result.source;
    state.tree = result.tree;
    this.notify({ kind: "change", detail: { kind: "code", mockup: name, edits: result.edits, code: result.source } });
    if (op.op === "insert") {
      const node = insertedNode(before, result.tree);
      if (node) this.notify({ kind: "insert", detail: { mockup: name, node: node.id, element: node.name } });
    }
    this.afterCodeChange(name, state);
    return result;
  }

  /**
   * Replace a mockup's code with text (C2), as a code editor does: one `change` of kind `code` whose
   * single edit replaces the part that differs. The tree is re-parsed from the last valid one, so nodes
   * outside the changed text keep their ids; code that does not parse keeps the last valid tree and
   * reports its diagnostics.
   */
  setCode(name: string, code: string): { edits: TextEdit[] } | Refused {
    const mockup = this.mockup(name);
    if (!mockup) return { error: `there is no mockup named ${JSON.stringify(name)}` };
    if (typeof code !== "string") return { error: "code must be a string" };
    const state = this.state(name)!;
    const edits = diff(mockup.code, code);
    if (edits.length === 0) return { edits };
    mockup.code = code;
    this.reparseState(state, code);
    this.notify({ kind: "change", detail: { kind: "code", mockup: name, edits, code } });
    this.afterCodeChange(name, state);
    return { edits };
  }

  /** Replace a mockup's render options (null removes them): a `change` of kind `options` with no edits. */
  setOptions(name: string, options: Record<string, unknown> | null): { mockup: string } | Refused {
    const mockup = this.mockup(name);
    if (!mockup) return { error: `there is no mockup named ${JSON.stringify(name)}` };
    if (options !== null && (typeof options !== "object" || Array.isArray(options))) return { error: "options must be an object or null" };
    if (options === null) delete mockup.options;
    else mockup.options = { ...options };
    const state = this.state(name)!;
    this.notify({ kind: "change", detail: { kind: "options", mockup: name, edits: [], code: mockup.code } });
    this.updateDiagnostics(name, state);
    return { mockup: name };
  }

  /** Move a mockup's frame on the canvas: a `change` of kind `move` with no edits. */
  moveMockup(name: string, x: number, y: number): { mockup: string } | Refused {
    const mockup = this.mockup(name);
    if (!mockup) return { error: `there is no mockup named ${JSON.stringify(name)}` };
    if (!Number.isFinite(x) || !Number.isFinite(y)) return { error: "x and y must be finite numbers" };
    if (mockup.x === x && mockup.y === y) return { mockup: name };
    mockup.x = x;
    mockup.y = y;
    this.notify({ kind: "change", detail: { kind: "move", mockup: name, edits: [], code: mockup.code } });
    return { mockup: name };
  }

  // --- internals ----------------------------------------------------------------------------------

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
  private afterCodeChange(name: string, state: MockupState): void {
    if (name === this.activeName && state.tree) {
      const tree = state.tree;
      const kept = this.selected.filter((id) => tree.byId(id));
      if (kept.length !== this.selected.length) {
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

function sameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

function sameDiagnostics(a: readonly Diagnostic[], b: readonly Diagnostic[]): boolean {
  return a.length === b.length && a.every((d, i) => JSON.stringify(d.toJSON()) === JSON.stringify(b[i].toJSON()));
}
