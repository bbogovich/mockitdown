/**
 * The structural edit API (R-EDIT-002): `edit(source, op)` inserts, removes or moves view nodes and
 * returns the smallest text edits (M-EDIT-3) that do it, the edited source and its tree. Everything
 * outside the edited ranges is kept as written; new code follows the printing rules the edit corpus
 * (`shared/conformance/edit/`) fixes: indentation from the new parent, the file's indentation unit, one
 * view per line.
 *
 * Positions among a parent's children count its *statement children*: the view nodes standing as
 * statements in its content — the unlabelled trailing closure of a call, the braced branches of an
 * `if`. A node can be removed or moved only when it is a statement of a body (a closure, an `if`
 * branch, a struct body or the top level); views in arguments and `let` values are changed by the
 * argument operations (R-EDIT-003).
 */

import { Diagnostic, Location } from "../diagnostics.js";
import type * as A from "./ast.js";
import { indentUnit, Lexer, type Token } from "./lexer.js";

export { indentUnit };
import { parseTree, reparseCarrying, type CarriedRange, type SyntaxTree, type TextEdit, type ViewNode } from "./tree.js";

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

const OPS = "insert, remove, move, setArgument, setModifier, rename, setRefs, setComment or setName";

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

/**
 * Apply one edit operation to a source, or to a tree the host already holds (the result's tree then
 * continues its ids). Returns `{edits, source, tree}`, or `{error, diagnostics}` and no edits when the
 * operation is refused.
 */
export function edit(input: string | SyntaxTree, op: EditOp): EditResult | EditRefusal {
  let tree: SyntaxTree;
  if (typeof input === "string") {
    const r = parseTree(input);
    if (!r.tree) return { error: `the source does not parse: ${describe(r.diagnostics[0])}`, diagnostics: r.diagnostics };
    tree = r.tree;
  } else tree = input;
  let plan: Plan;
  try {
    plan = new Editor(tree).plan(op);
  } catch (e) {
    if (e instanceof Refusal) return { error: e.message, diagnostics: e.diagnostics };
    throw e;
  }
  const edits = normalise(plan.edits);
  const carried: CarriedRange[] = [];
  if (plan.moved) {
    // The edit holding the moved code (merged with a removal it touches, its text is the same).
    const ins = plan.moved.edit;
    let shift = 0;
    for (const e of edits) {
      if (e.text === ins.text && (e.start === ins.start || e.end === ins.start)) {
        carried.push({ start: e.start + shift, end: e.start + shift + e.text.length, nodes: plan.moved.nodes });
        break;
      }
      shift += e.text.length - (e.end - e.start);
    }
  }
  const r = reparseCarrying(tree, edits, carried);
  if (!r.tree) return { error: `the edited source does not parse: ${describe(r.diagnostics[0])}`, diagnostics: r.diagnostics };
  return { edits, source: r.tree.source, tree: r.tree };
}

// --- internals ------------------------------------------------------------------------------------

/**
 * The view nodes standing as statements in the body a node stands in (the top level, a struct body, a
 * closure or a braced `if` branch), in source order; null when the node is no statement of a body (an
 * argument, a `let` value or an `else if`, C20). The design session's `delete` picks the node to select
 * next among them.
 */
export function bodySiblings(tree: SyntaxTree, node: ViewNode): ViewNode[] | null {
  return new Editor(tree).bodyFor(node);
}

/**
 * The statement children of a node, which `index` of an insert or a move counts: the view statements
 * of its unlabelled trailing closure or its braced `if` branches, in source order (empty when it has
 * none); with `parent` null, the view statements of the top level.
 */
export function statementChildren(tree: SyntaxTree, parent: ViewNode | null): ViewNode[] {
  return new Editor(tree).childrenOf(parent);
}

/**
 * A node's code as the clipboard holds it (R-EDIT-008.C3): its source text from its leading comment
 * lines to its end, with a comment trailing its last line when it stands on lines of its own,
 * re-indented so that its first line starts at column 0 and the others keep their indentation
 * relative to it.
 */
export function nodeCode(tree: SyntaxTree, node: ViewNode): string {
  return reindent(new Editor(tree).linesOf(node), "").join("\n");
}

/** The string identifiers of a node's `.id(…)` modifiers, in order (R-EDIT-003.C8). */
export function identifiersOf(n: ViewNode): string[] {
  const out: string[] = [];
  for (const m of n.modifiers) {
    if (m.kind !== "Call" || m.callee.kind !== "Member" || m.callee.name !== "id") continue;
    const v = m.args[0]?.value;
    if (v?.kind === "Literal" && typeof v.value === "string") out.push(v.value);
    else if (v?.kind === "StringLit" && v.parts.every((p) => typeof p === "string")) out.push(v.parts.join(""));
  }
  return out;
}

class Refusal extends Error {
  readonly diagnostics: Diagnostic[];
  constructor(message: string, diagnostics: Diagnostic[] = []) {
    super(message);
    this.diagnostics = diagnostics;
  }
}

function describe(d: Diagnostic | undefined): string {
  if (!d) return "unknown error";
  return d.location.line ? `${d.message} (line ${d.location.line}, column ${d.location.col})` : d.message;
}

interface Plan {
  edits: TextEdit[];
  /** The insertion holding moved code, and the nodes it carries (C8). */
  moved?: { edit: TextEdit; nodes: ViewNode[] };
}

/** An argument of a call: its label, where it starts (its label), where its value starts and its end. */
interface ArgShape {
  label: string | null;
  start: number;
  valueStart: number;
  end: number;
}

/** A call's name end, its parentheses (offsets of `(` and `)`), its arguments and whether it has a trailing closure. */
interface CallShape {
  nameEnd: number;
  parens: [number, number] | null;
  args: ArgShape[];
  trailing: boolean;
}

/** A modifier of a chain: its name, the offset of its `.`, the end of its name, its end and its parentheses. */
interface ModifierShape {
  name: string;
  dot: number;
  nameEnd: number;
  end: number;
  parens: [number, number] | null;
}

/** A list of statements: the top level, a struct body, a closure or an `if` branch. */
interface Body {
  stmts: readonly A.Node[];
  /** The view nodes standing as statements in it, in order. */
  children: ViewNode[];
  /** The offsets of its `{` and `}`, and where its statements may start (null for the top level). */
  open: number | null;
  close: number | null;
  inner: number | null;
}

/** Sort edits and merge an insertion into the removal that starts at the same offset (M-EDIT-3.I1). */
function normalise(edits: TextEdit[]): TextEdit[] {
  const sorted = [...edits].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: TextEdit[] = [];
  for (const e of sorted) {
    const last = out[out.length - 1];
    if (last && last.start === last.end && last.start === e.start && e.text === "") {
      out[out.length - 1] = { start: e.start, end: e.end, text: last.text };
    } else if (last && last.text === "" && last.end === e.start && e.start === e.end) {
      out[out.length - 1] = { start: last.start, end: last.end, text: e.text };
    } else out.push(e);
  }
  return out;
}

class Editor {
  private readonly tree: SyntaxTree;
  private readonly src: string;
  private readonly tokens: Token[];
  private readonly unit: string;
  /** The body each statement node stands in. */
  private readonly bodyOf = new Map<ViewNode, Body>();
  /** The content bodies of a node: a call's unlabelled trailing closure, an `if`'s braced branches. */
  private readonly contentOf = new Map<ViewNode, Body[]>();
  /** Nodes that are an `else if`: the statement of a branch without braces. */
  private readonly elseIf = new Set<ViewNode>();
  /** The top level's statements. */
  private top: Body | null = null;

  constructor(tree: SyntaxTree) {
    this.tree = tree;
    this.src = tree.source;
    this.tokens = new Lexer(tree.source).tokens();
    this.unit = indentUnit(tree.source);
    this.index();
  }

  /** The statements of the body a node stands in, or null when it is no statement of a body. */
  bodyFor(n: ViewNode): ViewNode[] | null {
    if (this.elseIf.has(n)) return null;
    const body = this.bodyOf.get(n);
    return body ? [...body.children] : null;
  }

  /** A node's lines as a move carries them (its first line's indentation included). */
  linesOf(n: ViewNode): string[] {
    return this.nodeLines(n);
  }

  /** The statement children `place` counts, or the top level's with null. */
  childrenOf(parent: ViewNode | null): ViewNode[] {
    if (parent === null) return [...this.top!.children];
    return (this.contentOf.get(parent) ?? []).flatMap((b) => b.children);
  }

  plan(op: EditOp): Plan {
    const kind = (op as { op?: unknown } | null)?.op;
    if (kind === "insert") return this.insert(op as InsertOp);
    if (kind === "remove") return this.remove(op as RemoveOp);
    if (kind === "move") return this.move(op as MoveOp);
    if (kind === "setArgument") return this.setArgument(op as SetArgumentOp);
    if (kind === "setModifier") {
      const m = op as SetModifierOp;
      return this.setModifier(this.node(m.node), m.name, m.index ?? 0, m.args);
    }
    if (kind === "rename") return this.rename(op as RenameOp);
    if (kind === "setRefs") return this.setRefs(op as SetRefsOp);
    if (kind === "setComment") return this.setComment(op as SetCommentOp);
    if (kind === "setName") return this.setName(op as SetNameOp);
    throw new Refusal(`unknown operation ${JSON.stringify(kind ?? null)}: expected ${OPS}`);
  }

  // --- operations ----------------------------------------------------------------------------------

  private insert(op: InsertOp): Plan {
    if (op.parent === null) {
      const lines = this.codeLines(op.code);
      return { edits: [this.placeTop(op.index, lines)] };
    }
    const parent = this.node(op.parent);
    const lines = this.codeLines(op.code);
    return { edits: [this.place(parent, op.index, [lines])] };
  }

  private remove(op: RemoveOp): Plan {
    const nodes = this.siblings(op.nodes);
    return { edits: mergeRanges(nodes.map((n) => this.removal(n))) };
  }

  private move(op: MoveOp): Plan {
    const nodes = this.siblings(op.nodes);
    const parent = op.parent === null ? null : this.node(op.parent);
    for (let p: ViewNode | null = parent; p; p = p.parent) {
      if (nodes.includes(p)) {
        throw new Refusal(p === parent
          ? `cannot move ${p.ordinal} into itself`
          : `cannot move ${p.ordinal} into ${parent!.ordinal}, one of its descendants`);
      }
    }
    const removals = mergeRanges(nodes.map((n) => this.removal(n)));
    const blocks = nodes.map((n) => this.nodeLines(n));
    let insertion = parent === null ? this.placeTop(op.index, blocks.flat()) : this.place(parent, op.index, blocks);
    // An insertion point inside a removed range (an inline node removed with the separator before it)
    // moves to the end of that range, the code following a separator.
    for (const r of removals) {
      if (r.start < insertion.start && insertion.start < r.end) {
        insertion = { start: r.end, end: r.end, text: `; ${insertion.text.replace(/; $/, "")}` };
      }
    }
    const moved = nodes.flatMap((n) => [n, ...descendants(n)]).sort((a, b) => a.first - b.first);
    return { edits: [...removals, insertion], moved: { edit: insertion, nodes: moved } };
  }

  // --- arguments, modifiers and identifiers (R-EDIT-003) -------------------------------------------

  private setArgument(op: SetArgumentOp): Plan {
    const n = this.callNode(op.node);
    const label = op.label ?? null;
    if (label !== null && (typeof label !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(label))) {
      throw new Refusal(`${JSON.stringify(label)} is not an argument label`);
    }
    if (op.value !== null && typeof op.value !== "string") throw new Refusal("the value of an argument is not a string or null");
    const value = op.value === null ? null : this.argumentCode(label, op.value);
    const call = this.callShape(n);
    const args = call.args;
    const positional = args.filter((a) => a.label === null);
    let target: ArgShape | undefined;
    let position = 0;
    if (label === null) {
      position = op.position as number;
      if (!Number.isInteger(position) || position < 0 || position > positional.length) {
        throw new Refusal(`position ${JSON.stringify(op.position ?? null)} is out of range for ${n.ordinal}: `
          + `0 to ${positional.length}`);
      }
      target = positional[position];
    } else target = args.find((a) => a.label === label);
    const what = label === null ? `positional argument ${position}` : `argument ${label}`;
    if (value === null) {
      if (!target) throw new Refusal(`${n.ordinal} has no ${what}`);
      return { edits: [this.argumentRemoval(call, target)] };
    }
    // C2: replace in place.
    if (target) return { edits: [{ start: target.valueStart, end: target.end, text: value }] };
    const text = label === null ? value : `${label}: ${value}`;
    // C4: a call without parentheses gets them directly after its name.
    if (!call.parens) return { edits: [{ start: call.nameEnd, end: call.nameEnd, text: `(${text})` }] };
    if (!args.length) return { edits: [{ start: call.parens[0] + 1, end: call.parens[0] + 1, text }] };
    if (label === null && positional.length) {
      // A new positional argument at its position: before the one it displaces, else after the last.
      if (position < positional.length) return { edits: [this.argumentBefore(positional[position], text)] };
      return { edits: [this.argumentAfter(positional[positional.length - 1], text)] };
    }
    if (label === null) return { edits: [this.argumentBefore(args[0], text)] };
    return { edits: [this.argumentAfter(args[args.length - 1], text)] };
  }

  /** New argument text before `a`: on its line, or on a line of its own when `a` starts its line. */
  private argumentBefore(a: ArgShape, text: string): TextEdit {
    const sep = this.startsLine(a.start) ? `,\n${this.lineIndent(a.start)}` : ", ";
    return { start: a.start, end: a.start, text: text + sep };
  }

  /** New argument text after `a`: on its line, or on a line of its own when `a` starts its line. */
  private argumentAfter(a: ArgShape, text: string): TextEdit {
    const sep = this.startsLine(a.start) ? `,\n${this.lineIndent(a.start)}` : ", ";
    return { start: a.end, end: a.end, text: sep + text };
  }

  /** C3, C4: an argument with the separator before or after it; the last one with empty parentheses before a closure. */
  private argumentRemoval(call: CallShape, a: ArgShape): TextEdit {
    const args = call.args;
    const i = args.indexOf(a);
    if (args.length === 1) {
      const [lp, rp] = call.parens!;
      if (call.trailing) return { start: lp, end: rp + 1, text: "" };
      return { start: lp + 1, end: rp, text: "" };
    }
    if (i < args.length - 1) return { start: a.start, end: args[i + 1].start, text: "" };
    return { start: args[i - 1].end, end: a.end, text: "" };
  }

  /** C5–C7: add, replace or remove occurrence `index` of `.name(…)` in the node's chain. */
  private setModifier(n: ViewNode, name: unknown, index: unknown, args: unknown): Plan {
    this.notIf(n);
    if (typeof name !== "string" || !/^[a-z_][A-Za-z0-9_]*$/.test(name)) {
      throw new Refusal(`${JSON.stringify(name ?? null)} is not a modifier name: an identifier starting with a lower-case letter`);
    }
    if (args !== null && typeof args !== "string") throw new Refusal("the arguments of a modifier are not a string or null");
    const code = args === null ? null : this.modifierArgs(args);
    const mods = this.modifierShapes(n);
    const same = mods.filter((m) => m.name === name);
    if (!Number.isInteger(index) || (index as number) < 0 || (index as number) > same.length
      || (code === null && index === same.length)) {
      throw new Refusal(same.length
        ? `${n.ordinal} has ${same.length} .${name} modifier${same.length > 1 ? "s" : ""}: index ${JSON.stringify(index ?? null)} is out of range`
        : `${n.ordinal} has no .${name} modifier`);
    }
    const target = same[index as number];
    if (target && code === null) return { edits: [this.modifierRemoval(target)] };
    if (target) {
      if (target.parens) return { edits: [{ start: target.parens[0] + 1, end: target.parens[1], text: code! }] };
      return { edits: [{ start: target.nameEnd, end: target.nameEnd, text: `(${code})` }] };
    }
    // C6: appended to the chain, on its line, or on a line of its own like the other continuation lines.
    const text = `.${name}(${code})`;
    const end = n.expr.end!;
    const lines = mods.filter((m) => this.startsLine(m.dot));
    if (!lines.length) return { edits: [{ start: end, end, text }] };
    const indent = this.lineIndent(lines[lines.length - 1].dot);
    const at = blank(this.src.slice(end, lineEnd(this.src, end))) || trailingComment(this.src.slice(end, lineEnd(this.src, end)))
      ? lineEnd(this.src, end) : end;
    return { edits: [{ start: at, end: at, text: `\n${indent}${text}` }] };
  }

  /** C7: a modifier on a line of its own goes with its line; one sharing a line goes with the spaces before it. */
  private modifierRemoval(m: ModifierShape): TextEdit {
    const src = this.src;
    const rest = src.slice(m.end, lineEnd(src, m.end));
    if (this.startsLine(m.dot) && (blank(rest) || trailingComment(rest))) {
      const a = lineStart(src, m.dot);
      const b = lineEnd(src, m.end);
      if (b >= src.length) return { start: a - 1, end: b, text: "" };
      return { start: a, end: b + 1, text: "" };
    }
    const lead = this.startsLine(m.dot) ? 0 : /[ \t]*$/.exec(src.slice(lineStart(src, m.dot), m.dot))![0].length;
    return { start: m.dot - lead, end: m.end, text: "" };
  }

  /** C8, C9: the node's `.id(…)`, refused when another node carries the identifier. */
  private rename(op: RenameOp): Plan {
    const n = this.node(op.node);
    const id = op.id;
    if (id !== null && (typeof id !== "string" || id === "")) throw new Refusal(`${JSON.stringify(id ?? null)} is not an identifier`);
    if (id !== null) {
      for (const other of this.tree.nodes) {
        if (other !== n && this.identifiers(other).includes(id)) {
          throw new Refusal(`the identifier ${JSON.stringify(id)} is already used by ${other.ordinal}`);
        }
      }
    }
    return this.setModifier(n, "id", 0, id === null ? null : quote(id));
  }

  /** C10: the node's `.ref(…)`, removed for an empty list. */
  private setRefs(op: SetRefsOp): Plan {
    const n = this.node(op.node);
    if (!Array.isArray(op.refs) || op.refs.some((r) => typeof r !== "string")) throw new Refusal("the references are not a list of strings");
    return this.setModifier(n, "ref", 0, op.refs.length ? op.refs.map(quote).join(", ") : null);
  }

  /** C11: the comment lines directly above the node, one `//` line per line of the text, at its indentation. */
  private setComment(op: SetCommentOp): Plan {
    const n = this.node(op.node);
    if (op.text !== null && typeof op.text !== "string") throw new Refusal("the comment is not a string or null");
    if (!this.startsLine(n.first)) throw new Refusal(`${n.ordinal} does not start its line, so it has no comment lines above it`);
    const start = lineStart(this.src, n.span.start);
    const end = lineStart(this.src, n.first);
    const indent = this.lineIndent(n.first);
    const text = op.text === null || op.text === "" ? ""
      : op.text.replace(/\r?\n$/, "").split(/\r?\n/).map((l) => `${indent}//${l ? ` ${l}` : ""}\n`).join("");
    if (start === end && text === "") throw new Refusal(`${n.ordinal} has no comment lines above it`);
    return { edits: [{ start, end, text }] };
  }

  /** C12: the node's name, nothing else. */
  private setName(op: SetNameOp): Plan {
    const n = this.node(op.node);
    this.notIf(n);
    if (typeof op.name !== "string" || !/^\p{Lu}[\p{L}\p{N}_]*(?:\.\p{Lu}[\p{L}\p{N}_]*)*$/u.test(op.name)) {
      throw new Refusal(`${JSON.stringify(op.name ?? null)} is not an element name: a capitalised identifier, or several joined by dots`);
    }
    return { edits: [{ start: n.nameSpan.start, end: n.nameSpan.end, text: op.name }] };
  }

  private notIf(n: ViewNode): void {
    if (n.kind === "if") throw new Refusal(`${n.ordinal} is an if statement, not a call`);
  }

  private callNode(ref: NodeRef): ViewNode {
    const n = this.node(ref);
    this.notIf(n);
    return n;
  }

  /** The string identifiers of a node's `.id(…)` modifiers. */
  private identifiers(n: ViewNode): string[] {
    return identifiersOf(n);
  }

  /** The code of an argument value, which must parse as one (C1). */
  private argumentCode(label: string | null, value: string): string {
    const code = value.trim();
    const prefix = `X(${label === null ? "" : `${label}: `}`;
    const call = this.probe(prefix, `${code})`, "the value");
    if (call.args.length !== 1 || call.args[0].label !== label) throw new Refusal("the value is not one argument value");
    return code;
  }

  /** The code between a modifier's parentheses, which must parse as an argument list (C5). */
  private modifierArgs(args: string): string {
    const code = args.trim();
    this.probe("X(", `${code})`, "the modifier arguments");
    return code;
  }

  /**
   * Parse `prefix + code`, which must be one call without closures or modifiers. A syntax diagnostic
   * on the first line counts its column from the start of `rest` (the caller's code and the closing
   * `)`), at most just after the caller's code.
   */
  private probe(prefix: string, rest: string, what: string): A.Call {
    const code = prefix + rest;
    const r = parseTree(code);
    if (!r.tree) {
      const diagnostics = r.diagnostics.map((d) => d.location.line !== 1 ? d
        : new Diagnostic(d.severity, d.message, new Location(1, Math.min(Math.max(1, d.location.col - prefix.length), rest.length), d.location.source), d.code));
      throw new Refusal(`${what} do${what.endsWith("s") ? "" : "es"} not parse: ${describe(diagnostics[0])}`, diagnostics);
    }
    const s = r.tree.module.statements;
    const e = s.length === 1 && s[0].kind === "ExprStmt" ? s[0].expr : null;
    if (!e || e.kind !== "Call" || e.callee.kind !== "Ident" || e.trailing.length || e.end !== code.length) {
      throw new Refusal(`${what} ${what.endsWith("s") ? "are" : "is"} not ${what.endsWith("s") ? "an argument list" : "an argument value"}`);
    }
    return e;
  }

  /** Where a node's call writes its name, parentheses and arguments. */
  private callShape(n: ViewNode): CallShape {
    if (n.kind === "ident") return { nameEnd: n.nameSpan.end, parens: null, args: [], trailing: false };
    const call = n.syntax as A.Call;
    const nameEnd = call.callee.end!;
    return { nameEnd, parens: this.parens(nameEnd), args: call.args.map((a) => this.argShape(a)), trailing: call.trailing.length > 0 };
  }

  private argShape(a: A.Arg): ArgShape {
    const valueStart = a.value.start!;
    let start = valueStart;
    if (a.label !== null) {
      let i = this.tokens.findIndex((t) => t.start >= valueStart) - 1;
      while (i >= 0 && this.tokens[i].kind === "NEWLINE") i--;
      if (i >= 1 && this.tokens[i].kind === "COLON") start = this.tokens[i - 1].start;
    }
    return { label: a.label, start, valueStart, end: a.value.end! };
  }

  /** The `(` directly after `offset` (the end of a name) and its matching `)`, or null. */
  private parens(offset: number): [number, number] | null {
    const i = this.tokens.findIndex((t) => t.start >= offset);
    if (i < 0 || this.tokens[i].kind !== "LPAREN") return null;
    let depth = 0;
    for (let j = i; j < this.tokens.length; j++) {
      const k = this.tokens[j].kind;
      if (k === "LPAREN") depth++;
      else if (k === "RPAREN" && --depth === 0) return [this.tokens[i].start, this.tokens[j].start];
    }
    return null;
  }

  /** The node's modifiers with their names, dots and parentheses. */
  private modifierShapes(n: ViewNode): ModifierShape[] {
    return n.modifiers.map((m) => {
      const member = (m.kind === "Call" ? m.callee : m) as A.Member;
      const dot = this.tokens.find((t) => t.start >= member.base.end! && t.kind === "DOT")!.start;
      const nameEnd = member.end!;
      return { name: member.name, dot, nameEnd, end: m.end!, parens: m.kind === "Call" ? this.parens(nameEnd) : null };
    });
  }

  private startsLine(at: number): boolean {
    return blank(this.src.slice(lineStart(this.src, at), at));
  }

  // --- naming and checks ---------------------------------------------------------------------------

  /** C3: a node named by id or ordinal. */
  private node(ref: NodeRef): ViewNode {
    const n = typeof ref === "string" ? this.tree.byId(ref) ?? this.tree.byOrdinal(ref)
      : typeof ref === "number" ? this.tree.byOrdinal(ref) : null;
    if (!n) throw new Refusal(`${typeof ref === "string" ? ref : JSON.stringify(ref ?? null)} is not a view node of the source`);
    return n;
  }

  /** The named nodes, which must be distinct statements of one body, in source order (C6, C8). */
  private siblings(refs: NodeRef[]): ViewNode[] {
    if (!Array.isArray(refs) || refs.length === 0) throw new Refusal("the operation names no nodes");
    const nodes = refs.map((r) => this.node(r));
    const seen = new Set<ViewNode>();
    for (const n of nodes) {
      if (seen.has(n)) throw new Refusal(`${n.ordinal} is named twice`);
      seen.add(n);
      if (this.elseIf.has(n)) throw new Refusal(`${n.ordinal} is an else-if branch, not a statement of a body`);
      if (!this.bodyOf.has(n)) throw new Refusal(`${n.ordinal} is not a statement of a body: it is an argument or a let value`);
    }
    const body = this.bodyOf.get(nodes[0]);
    for (const n of nodes) {
      if (this.bodyOf.get(n) !== body) throw new Refusal(`${nodes[0].ordinal} and ${n.ordinal} are not siblings`);
    }
    return nodes.sort((a, b) => a.first - b.first);
  }

  // --- placing code --------------------------------------------------------------------------------

  /**
   * The edit writing `blocks` (each a node's lines, its first line's indentation included) as children
   * of `parent` before its statement child `index` (C4, C5, C10, C12).
   */
  private place(parent: ViewNode, index: EditIndex, blocks: string[][]): TextEdit {
    const bodies = this.contentOf.get(parent) ?? [];
    const children = bodies.flatMap((b) => b.children);
    if (index !== "end" && !(Number.isInteger(index) && index >= 0 && index <= children.length)) {
      throw new Refusal(`index ${JSON.stringify(index ?? null)} is out of range for ${parent.ordinal}: `
        + `0 to ${children.length}, or "end"`);
    }
    const indent = this.childIndent(parent, children);
    const block = blocks.flatMap((b) => reindent(b, indent)).join("\n");
    const inline = blocks.map((b) => reindent(b, indent).join("\n").trimStart()).join("; ");
    if (bodies.length === 0) {
      if (parent.kind === "call" && (parent.syntax as A.Call).trailing.length) {
        throw new Refusal(`${parent.ordinal} has only labelled trailing closures`);
      }
      if (parent.kind === "if") throw new Refusal(`${parent.ordinal} has no braced branch`);
      // C5: a trailing closure after the call's arguments (or the bare name).
      const at = parent.syntax.end!;
      return { start: at, end: at, text: ` {\n${block}\n${this.lineIndent(parent.first)}}` };
    }
    let body = bodies[bodies.length - 1];
    let k = index === "end" ? body.children.length : index;
    if (index !== "end") {
      for (const b of bodies) {
        body = b;
        if (k <= b.children.length) break;
        k -= b.children.length;
      }
    }
    if (k < body.children.length) {
      const target = body.children[k];
      const ls = lineStart(this.src, target.span.start);
      if (blank(this.src.slice(ls, target.span.start))) return { start: ls, end: ls, text: `${block}\n` };
      return { start: target.span.start, end: target.span.start, text: `${inline}; ` };
    }
    const close = body.close!;
    const closeLine = lineStart(this.src, close);
    if (closeLine > body.open! && blank(this.src.slice(closeLine, close))) {
      return { start: closeLine, end: closeLine, text: `${block}\n` };
    }
    const last = body.stmts[body.stmts.length - 1];
    if (last) return { start: last.end!, end: last.end!, text: `; ${inline}` };
    // An empty closure on one line: `{}` or `{ }` becomes a closure on lines of its own.
    const inner = body.inner!;
    const text = `\n${block}\n${this.lineIndent(parent.first)}`;
    if (blank(this.src.slice(inner, close))) return { start: inner, end: close, text };
    return { start: close, end: close, text };
  }

  /**
   * Where code inserted at the top level goes: before its view statement `index` (on its own line, or
   * inline before it as `place` does), else on a new line after the last top-level statement, else at
   * the end of the source. Top-level code takes the indentation of the first top-level view, else none.
   */
  private placeTop(index: EditIndex, lines: string[]): TextEdit {
    const body = this.top!;
    const children = body.children;
    if (index !== "end" && !(Number.isInteger(index) && index >= 0 && index <= children.length)) {
      throw new Refusal(`index ${JSON.stringify(index ?? null)} is out of range for the top level: 0 to ${children.length}, or "end"`);
    }
    const first = children[0];
    let indent = "";
    if (first) {
      const ls = lineStart(this.src, first.first);
      if (blank(this.src.slice(ls, first.first))) indent = this.src.slice(ls, first.first);
    }
    const block = reindent(lines, indent).join("\n");
    const k = index === "end" ? children.length : index;
    if (k < children.length) {
      const target = children[k];
      const ls = lineStart(this.src, target.span.start);
      if (blank(this.src.slice(ls, target.span.start))) return { start: ls, end: ls, text: `${block}\n` };
      return { start: target.span.start, end: target.span.start, text: `${block.trimStart()}; ` };
    }
    const last = body.stmts[body.stmts.length - 1];
    if (last) {
      const at = lineEnd(this.src, last.end!);
      return { start: at, end: at, text: `\n${block}` };
    }
    const end = this.src.length;
    if (end === 0 || this.src.endsWith("\n")) return { start: end, end, text: `${block}\n` };
    return { start: end, end, text: `\n${block}\n` };
  }

  /** C10: the indentation of the parent's first child when it starts its line, else the parent line's plus one unit. */
  private childIndent(parent: ViewNode, children: readonly ViewNode[]): string {
    const first = children[0];
    if (first) {
      const ls = lineStart(this.src, first.first);
      if (blank(this.src.slice(ls, first.first))) return this.src.slice(ls, first.first);
    }
    return this.lineIndent(parent.first) + this.unit;
  }

  private lineIndent(at: number): string {
    return /^[ \t]*/.exec(this.src.slice(lineStart(this.src, at)))![0];
  }

  /** The lines of the code given to `insert`, which must be exactly one view (C14). */
  private codeLines(code: unknown): string[] {
    if (typeof code !== "string") throw new Refusal("the code to insert is not a string");
    const text = code.replace(/^(?:[ \t]*\r?\n)+/, "").replace(/\s+$/, "");
    const r = parseTree(text);
    if (!r.tree) throw new Refusal(`the code to insert does not parse: ${describe(r.diagnostics[0])}`, r.diagnostics);
    const m = r.tree.module;
    if (m.imports.length || m.structs.length || m.attributes.length) {
      throw new Refusal("the code to insert must be one view, not an import, a directive or a struct");
    }
    const stmts = m.statements;
    if (stmts.length !== 1) {
      throw new Refusal(stmts.length ? `the code to insert holds ${stmts.length} statements, not one view` : "the code to insert holds no view");
    }
    const s = stmts[0];
    const view = s.kind === "IfStmt" || (s.kind === "ExprStmt" && r.tree.roots.some((n) => n.expr === s.expr));
    if (!view) throw new Refusal("the code to insert is not a view");
    return text.split("\n").map((l) => l.replace(/\r$/, ""));
  }

  /** A moved node's lines: from its line's indentation to its end, with a comment trailing its last line. */
  private nodeLines(n: ViewNode): string[] {
    const head = this.lineIndent(n.span.start);
    let text = head + this.src.slice(n.span.start, n.span.end);
    if (this.ownsLines(n)) text += trailingComment(this.src.slice(n.span.end, lineEnd(this.src, n.span.end)));
    return text.split("\n").map((l) => l.replace(/\r$/, ""));
  }

  // --- removing ------------------------------------------------------------------------------------

  /** Whether a node stands on lines of its own: nothing before it on its first line, at most a comment after it. */
  private ownsLines(n: ViewNode): boolean {
    if (!blank(this.src.slice(lineStart(this.src, n.span.start), n.span.start))) return false;
    const rest = this.src.slice(n.span.end, lineEnd(this.src, n.span.end));
    return /^[ \t]*;?[ \t]*(?:\/\/.*|(?:\/\*.*?\*\/[ \t]*)*)\r?$/.test(rest);
  }

  /** The range removing a node with its lines, or with its separator when it shares a line (C6, C7). */
  private removal(n: ViewNode): TextEdit {
    const src = this.src;
    if (this.ownsLines(n)) {
      let a = lineStart(src, n.span.start);
      let b = lineEnd(src, n.span.end);
      if (b >= src.length) return { start: a > 0 ? a - 1 : a, end: b, text: "" };
      b += 1;
      // Blank lines that would be left against a brace go with the node: after an opening `{` line
      // (or a closure's `in`), or before a closing `}` line or the end of the source.
      const above = a > 0 ? src.slice(lineStart(src, a - 1), a - 1) : "";
      if (/\{[ \t]*(?:\/\/.*)?\r?$/.test(above) || /\bin[ \t]*\r?$/.test(above)) {
        while (b < src.length && blank(src.slice(b, lineEnd(src, b)))) b = Math.min(lineEnd(src, b) + 1, src.length);
      } else if (b >= src.length || /^[ \t]*\}/.test(src.slice(b, lineEnd(src, b)))) {
        while (a > 0 && blank(src.slice(lineStart(src, a - 1), a - 1))) a = lineStart(src, a - 1);
      }
      return { start: a, end: b, text: "" };
    }
    const after = /^[ \t]*;[ \t]*/.exec(src.slice(n.span.end));
    if (after) return { start: n.span.start, end: n.span.end + after[0].length, text: "" };
    const before = /[ \t]*;[ \t]*$/.exec(src.slice(lineStart(src, n.span.start), n.span.start));
    if (before) return { start: n.span.start - before[0].length, end: n.span.end, text: "" };
    const trail = /^[ \t]*/.exec(src.slice(n.span.end))![0].length;
    const next = src[n.span.end + trail];
    const atEol = next === undefined || next === "\n" || next === "\r";
    const lead = atEol ? /[ \t]*$/.exec(src.slice(0, n.span.start))![0].length : 0;
    return { start: n.span.start - lead, end: n.span.end + trail, text: "" };
  }

  // --- the bodies of the tree ----------------------------------------------------------------------

  private index(): void {
    const byExpr = new Map<A.Node, ViewNode>();
    for (const n of this.tree.nodes) byExpr.set(n.kind === "if" ? n.syntax : n.expr, n);
    const body = (stmts: readonly A.Node[], open: number | null, close: number | null, inner: number | null): Body => {
      const children: ViewNode[] = [];
      for (const s of stmts) {
        const n = s.kind === "ExprStmt" ? byExpr.get(s.expr) : s.kind === "IfStmt" ? byExpr.get(s) : undefined;
        if (n) children.push(n);
      }
      const b: Body = { stmts, children, open, close, inner };
      for (const c of children) this.bodyOf.set(c, b);
      return b;
    };
    const m = this.tree.module;
    this.top = body(m.statements, null, null, null);
    for (const s of m.structs) if (s.body) body(s.body, null, null, null);
    for (const n of this.tree.nodes) {
      const content: Body[] = [];
      if (n.kind === "if") {
        const s = n.syntax as A.IfStmt;
        const then = this.braces(s.cond.end!);
        if (!then) continue;
        content.push(body(s.then, then[0], then[1], then[0] + 1));
        const elseTok = this.tokenAfter(then[1] + 1);
        if (s.other.length && elseTok && elseTok.kind === "KEYWORD" && elseTok.value === "else") {
          const next = this.tokenAfter(elseTok.end);
          if (next && next.kind === "LBRACE") {
            const other = this.braces(next.start)!;
            content.push(body(s.other, other[0], other[1], other[0] + 1));
          } else {
            for (const o of s.other) {
              const e = byExpr.get(o);
              if (e) this.elseIf.add(e);
            }
          }
        }
      } else {
        const closures: [boolean, A.Closure][] = [];
        if (n.kind === "call") {
          const call = n.syntax as A.Call;
          for (const a of call.args) if (a.value.kind === "Closure") closures.push([false, a.value]);
          for (const [label, c] of call.trailing) closures.push([label === null, c]);
        }
        for (const mod of n.modifiers) {
          if (mod.kind !== "Call") continue;
          for (const a of mod.args) if (a.value.kind === "Closure") closures.push([false, a.value]);
          for (const [, c] of mod.trailing) closures.push([false, c]);
        }
        for (const [isContent, c] of closures) {
          const b = body(c.body, c.start!, c.end! - 1, this.closureInner(c));
          if (isContent) content.push(b);
        }
      }
      if (content.length) this.contentOf.set(n, content);
    }
  }

  /** Where a closure's statements may start: after its `{`, or after `in` when it has parameters. */
  private closureInner(c: A.Closure): number {
    if (!c.params.length) return c.start! + 1;
    const t = this.tokens.find((k) => k.start > c.start! && k.kind === "KEYWORD" && k.value === "in");
    return t ? t.end : c.start! + 1;
  }

  private tokenAfter(offset: number): Token | null {
    return this.tokens.find((k) => k.start >= offset && k.kind !== "NEWLINE") ?? null;
  }

  /** The `{` at or after `offset` and its matching `}`. */
  private braces(offset: number): [number, number] | null {
    const i = this.tokens.findIndex((k) => k.start >= offset && k.kind === "LBRACE");
    if (i < 0) return null;
    let depth = 0;
    for (let j = i; j < this.tokens.length; j++) {
      const k = this.tokens[j].kind;
      if (k === "LBRACE") depth++;
      else if (k === "RBRACE" && --depth === 0) return [this.tokens[i].start, this.tokens[j].start];
    }
    return null;
  }
}

function descendants(n: ViewNode): ViewNode[] {
  return n.children.flatMap((c) => [c, ...descendants(c)]);
}

/** Merge overlapping removals into single ranges. */
function mergeRanges(edits: TextEdit[]): TextEdit[] {
  const sorted = [...edits].sort((a, b) => a.start - b.start);
  const out: TextEdit[] = [];
  for (const e of sorted) {
    const last = out[out.length - 1];
    if (last && e.start <= last.end) out[out.length - 1] = { start: last.start, end: Math.max(last.end, e.end), text: "" };
    else out.push(e);
  }
  return out;
}

/** C12: re-indent lines so that the first takes `indent` and the others keep their indentation relative to it. */
function reindent(lines: readonly string[], indent: string): string[] {
  const first = /^[ \t]*/.exec(lines[0] ?? "")![0];
  return lines.map((l) => {
    if (blank(l)) return "";
    if (l.startsWith(first)) return indent + l.slice(first.length);
    return indent + l.trimStart();
  });
}

/** A string literal for `text`, as the lexer reads it back. */
export function stringLiteral(text: string): string {
  return quote(text);
}

function quote(text: string): string {
  return `"${text.replace(/[\\"]/g, (c) => `\\${c}`).replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")}"`;
}

function trailingComment(rest: string): string {
  const m = /^([ \t]*);?([ \t]*)(\/\/.*|\/\*.*\*\/)[ \t]*\r?$/.exec(rest);
  return m ? (m[1] + m[2] || " ") + m[3].replace(/\r$/, "") : "";
}

function lineStart(src: string, at: number): number {
  return src.lastIndexOf("\n", at - 1) + 1;
}

function lineEnd(src: string, at: number): number {
  const i = src.indexOf("\n", at);
  return i < 0 ? src.length : i;
}

function blank(text: string): boolean {
  return /^[ \t\r]*$/.test(text);
}
