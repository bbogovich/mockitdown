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

import type { Diagnostic } from "../diagnostics.js";
import type * as A from "./ast.js";
import { Lexer, type Token } from "./lexer.js";
import { parseTree, reparseCarrying, type CarriedRange, type SyntaxTree, type TextEdit, type ViewNode } from "./tree.js";

/** A node named by its id (`id12`) or its ordinal (`n3` or 3) (R-EDIT-002.C3). */
export type NodeRef = string | number;

/** A position among a parent's statement children: 0 to their count, or `end`. */
export type EditIndex = number | "end";

/** Insert one view's code as a child of `parent` (C4). */
export interface InsertOp {
  op: "insert";
  parent: NodeRef;
  index: EditIndex;
  code: string;
}

/** Remove sibling view nodes (C6). */
export interface RemoveOp {
  op: "remove";
  nodes: NodeRef[];
}

/** Move sibling view nodes under `parent`, before its statement child `index` (C8). */
export interface MoveOp {
  op: "move";
  nodes: NodeRef[];
  parent: NodeRef;
  index: EditIndex;
}

export type EditOp = InsertOp | RemoveOp | MoveOp;

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

  constructor(tree: SyntaxTree) {
    this.tree = tree;
    this.src = tree.source;
    this.tokens = new Lexer(tree.source).tokens();
    this.unit = indentUnit(tree.source);
    this.index();
  }

  plan(op: EditOp): Plan {
    const kind = (op as { op?: unknown } | null)?.op;
    if (kind === "insert") return this.insert(op as InsertOp);
    if (kind === "remove") return this.remove(op as RemoveOp);
    if (kind === "move") return this.move(op as MoveOp);
    throw new Refusal(`unknown operation ${JSON.stringify(kind ?? null)}: expected insert, remove or move`);
  }

  // --- operations ----------------------------------------------------------------------------------

  private insert(op: InsertOp): Plan {
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
    const parent = this.node(op.parent);
    for (let p: ViewNode | null = parent; p; p = p.parent) {
      if (nodes.includes(p)) {
        throw new Refusal(p === parent
          ? `cannot move ${p.ordinal} into itself`
          : `cannot move ${p.ordinal} into ${parent.ordinal}, one of its descendants`);
      }
    }
    const removals = mergeRanges(nodes.map((n) => this.removal(n)));
    let insertion = this.place(parent, op.index, nodes.map((n) => this.nodeLines(n)));
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
    body(m.statements, null, null, null);
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

/** C11: the smallest increase of indentation between consecutive non-blank lines, else four spaces; a tab when lines are indented with tabs. */
export function indentUnit(source: string): string {
  let prev = 0;
  let step = 0;
  let tabs = false;
  for (const line of source.split("\n")) {
    if (blank(line)) continue;
    const ws = /^[ \t]*/.exec(line)![0];
    if (ws.includes("\t")) tabs = true;
    if (ws.length > prev && (step === 0 || ws.length - prev < step)) step = ws.length - prev;
    prev = ws.length;
  }
  if (tabs) return "\t";
  return step ? " ".repeat(step) : "    ";
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
