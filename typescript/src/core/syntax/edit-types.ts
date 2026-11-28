/**
 * The operation types of the structural edit API (R-EDIT-002, R-EDIT-003), what `edit()` returns, and
 * the internals shared by the Editor (`edit.ts`) and the argument operations (`edit-arguments.ts`): the
 * refusal an operation throws and the plan it builds. `edit.ts` re-exports the public types.
 */

import type { Diagnostic } from "../diagnostics.js";
import type { SyntaxTree, TextEdit, ViewNode } from "./tree.js";

/** A node named by its id (`id12`) or its ordinal (`n3` or 3) (R-EDIT-002.C3). */
export type NodeRef = string | number;

/** A position among a parent's statement children: 0 to their count, or `end`. */
export type EditIndex = number | "end";

/**
 * Insert one view's code as a child of `parent` (C4), or, with `parent` null, as a statement of the
 * top level (the root of the mockup), `index` counting its view statements.
 */
export interface InsertOp {
  op: "insert";
  parent: NodeRef | null;
  index: EditIndex;
  code: string;
}

/** Remove sibling view nodes (C6). */
export interface RemoveOp {
  op: "remove";
  nodes: NodeRef[];
}

/**
 * Move sibling view nodes under `parent`, before its statement child `index` (C8), or, with `parent`
 * null, to the top level before its view statement `index`. `index` counts the children as they are
 * before the move.
 */
export interface MoveOp {
  op: "move";
  nodes: NodeRef[];
  parent: NodeRef | null;
  index: EditIndex;
}

/**
 * Add, replace or remove one argument of a node's call (R-EDIT-003.C1): the labelled argument `label`,
 * or, with `label` null, the positional argument at `position` among the positional ones. `value` is
 * the code of the value, or null to remove the argument.
 */
export interface SetArgumentOp {
  op: "setArgument";
  node: NodeRef;
  label?: string | null;
  position?: number;
  value: string | null;
}

/**
 * Add, replace or remove a modifier of a node's chain (R-EDIT-003.C5): occurrence `index` (default 0)
 * of `.name(…)`; `args` is the code between its parentheses, or null to remove it.
 */
export interface SetModifierOp {
  op: "setModifier";
  node: NodeRef;
  name: string;
  index?: number;
  args: string | null;
}

/** Set the node's `.id(…)` identifier, or remove it with null (R-EDIT-003.C8, C9). */
export interface RenameOp {
  op: "rename";
  node: NodeRef;
  id: string | null;
}

/** Set the node's `.ref(…)` references, removing the modifier for an empty list (R-EDIT-003.C10). */
export interface SetRefsOp {
  op: "setRefs";
  node: NodeRef;
  refs: string[];
}

/** Replace the comment lines directly above the node, or remove them with null (R-EDIT-003.C11). */
export interface SetCommentOp {
  op: "setComment";
  node: NodeRef;
  text: string | null;
}

/** Replace the node's element name, keeping its arguments, modifiers and closures (R-EDIT-003.C12). */
export interface SetNameOp {
  op: "setName";
  node: NodeRef;
  name: string;
}

export type EditOp = InsertOp | RemoveOp | MoveOp | SetArgumentOp | SetModifierOp | RenameOp | SetRefsOp | SetCommentOp | SetNameOp;

/** An applied operation: the text edits, the edited source and its tree (C1). */
export interface EditResult {
  edits: TextEdit[];
  source: string;
  tree: SyntaxTree;
}

/** A refused operation: why, and the syntax diagnostics when code did not parse (C1, C14). */
export interface EditRefusal {
  error: string;
  diagnostics: Diagnostic[];
}

// --- internals shared by the Editor and the argument operations ------------------------------------

/** A refused operation, thrown while planning and returned by `edit()` as an `EditRefusal`. */
export class Refusal extends Error {
  readonly diagnostics: Diagnostic[];
  constructor(message: string, diagnostics: Diagnostic[] = []) {
    super(message);
    this.diagnostics = diagnostics;
  }
}

/** A diagnostic as a refusal quotes it: its message, and its line and column when it has them. */
export function describe(d: Diagnostic | undefined): string {
  if (!d) return "unknown error";
  return d.location.line ? `${d.message} (line ${d.location.line}, column ${d.location.col})` : d.message;
}

/** What an operation plans: its text edits, and for a move the code it carries. */
export interface Plan {
  edits: TextEdit[];
  /** The insertion holding moved code, and the nodes it carries (C8). */
  moved?: { edit: TextEdit; nodes: ViewNode[] };
}
