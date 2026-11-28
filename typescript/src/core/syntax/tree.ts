/**
 * The syntax tree an editor works on (R-EDIT-001): the parsed module, the source's comments and its
 * *view nodes* — what a designer selects — each with its span in the source, its ordinal (`n1`, `n2`,
 * … in source order) and an opaque id that survives every edit not touching the node's name.
 *
 * A view node is a call whose callee is an identifier or a dotted name of capitalised identifiers
 * (`Text("a")`, `VStack { … }`, `Badge.Ribbon("New")`), an identifier standing alone as a view
 * statement or as the base of a modifier chain in one (`Divider`, `Spacer.frame(height: 8)`), or an
 * `if` statement. A member call on a view (`.font(.title)`, `Spacer.frame(…)`) is a modifier: it
 * belongs to the node whose chain it is in. The rule is pack-independent: a dotted segment is part of
 * the name when it starts with a capital letter, as type names do in Swift.
 *
 * Offsets are UTF-16 code units, end exclusive, as JavaScript strings index them. The tree holds no
 * global state: the id counter is shared only by a tree and the trees derived from it.
 */

import { Diagnostic, MockitdownSyntaxError } from "../diagnostics.js";
import type * as A from "./ast.js";
import { Lexer, type Comment } from "./lexer.js";
import { Parser } from "./parser.js";

/** A range of the source: UTF-16 offsets, end exclusive. */
export interface Span {
  readonly start: number;
  readonly end: number;
}

/** A text edit (M-EDIT-3): replace `[start, end)` of the text before the change with `text`. */
export interface TextEdit {
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

/** What a view node is: a call, a bare identifier, or an `if` statement. */
export type ViewNodeKind = "call" | "ident" | "if";

/** One selectable node of a {@link SyntaxTree} (R-EDIT-001.C7). */
export class ViewNode {
  /** Opaque, unique within the tree, never reused for another node of the trees derived from it (C6). */
  readonly id: string;
  /** 1-based position in source order (C4); {@link ordinal} writes it `n<k>`. */
  readonly index: number;
  readonly kind: ViewNodeKind;
  /** The element or struct name as written (`Text`, `Badge.Ribbon`); `if` for an `if` statement. */
  readonly name: string;
  /** From its leading comment lines (C11) or first token to the end of its modifier chain and closures. */
  readonly span: Span;
  /** The span of its name (the `if` keyword for an `if` statement). */
  readonly nameSpan: Span;
  /** The offset of its first token (its span starts earlier when comment lines lead it). */
  readonly first: number;
  /** The view node it is in, null at the top level of the source or of a struct. */
  parent: ViewNode | null = null;
  /** Its child view nodes in source order: arguments, closures, slots, modifier arguments, `if` branches. */
  readonly children: ViewNode[] = [];
  /** The call, identifier or `if` statement the node is. */
  readonly syntax: A.Call | A.Ident | A.IfStmt;
  /** The whole expression: the node with its modifier chain (the `if` statement itself for `if`). */
  readonly expr: A.Node;
  /** Its modifiers in source order (`Text("a").bold().font(.title)` → bold, font). */
  readonly modifiers: readonly (A.Call | A.Member)[];

  constructor(init: {
    id: string; index: number; kind: ViewNodeKind; name: string; span: Span; nameSpan: Span; first: number;
    syntax: A.Call | A.Ident | A.IfStmt; expr: A.Node; modifiers: readonly (A.Call | A.Member)[];
  }) {
    this.id = init.id;
    this.index = init.index;
    this.kind = init.kind;
    this.name = init.name;
    this.span = init.span;
    this.nameSpan = init.nameSpan;
    this.first = init.first;
    this.syntax = init.syntax;
    this.expr = init.expr;
    this.modifiers = init.modifiers;
  }

  /** The ordinal as written: `n1`, `n2`, … (C4). */
  get ordinal(): string {
    return `n${this.index}`;
  }
}

/** The id counter a tree shares with every tree derived from it, so that no id is reused (C6). */
interface IdSource {
  next: number;
}

/** A parsed source with its view nodes (R-EDIT-001.C5). */
export class SyntaxTree {
  readonly source: string;
  readonly module: A.Module;
  /** Every comment of the source, in order (C2). */
  readonly comments: readonly Comment[];
  /** Every view node, in ordinal order. */
  readonly nodes: readonly ViewNode[];
  /** The view nodes without a parent, in source order. */
  readonly roots: readonly ViewNode[];
  /** @internal The id counter shared with derived trees. */
  readonly ids: IdSource;
  private readonly byIdMap: Map<string, ViewNode>;

  constructor(source: string, module: A.Module, comments: readonly Comment[], nodes: ViewNode[], ids: IdSource) {
    this.source = source;
    this.module = module;
    this.comments = comments;
    this.nodes = nodes;
    this.roots = nodes.filter((n) => n.parent === null);
    this.ids = ids;
    this.byIdMap = new Map(nodes.map((n) => [n.id, n]));
  }

  /** The node with this id, or null (C8). */
  byId(id: string): ViewNode | null {
    return this.byIdMap.get(id) ?? null;
  }

  /** The node with this ordinal, given as `n3` or 3, or null (C8). */
  byOrdinal(ordinal: string | number): ViewNode | null {
    const k = typeof ordinal === "number" ? ordinal : /^n[1-9][0-9]*$/.test(ordinal) ? Number(ordinal.slice(1)) : NaN;
    return Number.isInteger(k) && k >= 1 && k <= this.nodes.length ? this.nodes[k - 1] : null;
  }

  /** The innermost node whose span holds `offset` (`start <= offset < end`), or null (C8). */
  atOffset(offset: number): ViewNode | null {
    let found: ViewNode | null = null;
    let nodes: readonly ViewNode[] = this.roots;
    for (;;) {
      const hit = nodes.find((n) => n.span.start <= offset && offset < n.span.end);
      if (!hit) return found;
      found = hit;
      nodes = hit.children;
    }
  }

  /** The source text of a span. */
  text(span: Span): string {
    return this.source.slice(span.start, span.end);
  }
}

/** What {@link parseTree} and {@link reparse} return: a tree, or null with the syntax diagnostics. */
export interface TreeResult {
  tree: SyntaxTree | null;
  diagnostics: Diagnostic[];
}

/** Parse `source` into a {@link SyntaxTree} (R-EDIT-001.C5); `tree` is null when it does not parse. */
export function parseTree(source: string): TreeResult {
  return build(source, { next: 1 }, null);
}

/**
 * Apply text edits (M-EDIT-3) to the tree's source and parse the result (R-EDIT-001.C9). A node
 * whose name lies outside every edited range keeps its id; one whose name lies in an inserted or
 * replaced range gets a new one (C10). Edits out of order, overlapping or outside the text throw a
 * RangeError.
 */
export function reparse(tree: SyntaxTree, edits: readonly TextEdit[]): TreeResult {
  return build(applyEdits(tree.source, edits), tree.ids, { tree, edits, carried: [] });
}

/**
 * A range of the edited text that holds moved code (R-EDIT-002.C8): the view nodes whose first token
 * lies in it take, in source order, the ids of the old nodes the code was moved from.
 */
export interface CarriedRange {
  /** Offsets in the text after the edits. */
  readonly start: number;
  readonly end: number;
  /** The moved nodes and their descendants, in source order. */
  readonly nodes: readonly ViewNode[];
}

/**
 * @internal {@link reparse}, with moved code keeping its ids: in each carried range the new nodes
 * take the old nodes' ids, in order, when they match one to one by name.
 */
export function reparseCarrying(tree: SyntaxTree, edits: readonly TextEdit[], carried: readonly CarriedRange[]): TreeResult {
  return build(applyEdits(tree.source, edits), tree.ids, { tree, edits, carried });
}

/** The text after applying `edits` (M-EDIT-3: ascending, not overlapping, offsets into `text`). */
export function applyEdits(text: string, edits: readonly TextEdit[]): string {
  let out = "";
  let at = 0;
  for (const e of edits) {
    if (!Number.isInteger(e.start) || !Number.isInteger(e.end) || e.start < at || e.end < e.start || e.end > text.length) {
      throw new RangeError(`text edit [${e.start}, ${e.end}) is out of order, overlaps another or is outside the text`);
    }
    out += text.slice(at, e.start) + e.text;
    at = e.end;
  }
  return out + text.slice(at);
}

// --- building --------------------------------------------------------------------------------------

interface Prior {
  tree: SyntaxTree;
  edits: readonly TextEdit[];
  carried: readonly CarriedRange[];
}

function build(source: string, ids: IdSource, prior: Prior | null): TreeResult {
  let module: A.Module;
  let comments: Comment[];
  try {
    const lexer = new Lexer(source);
    const tokens = lexer.tokens();
    comments = lexer.comments;
    module = new Parser(tokens).parseModule();
  } catch (e) {
    if (e instanceof MockitdownSyntaxError) return { tree: null, diagnostics: [e.diagnostic] };
    throw e;
  }
  const raw = new Collector(source, comments).collect(module);
  raw.sort((a, b) => a.first - b.first);
  const keep = prior ? idMapper(prior) : (): string | null => null;
  const carry = new Map<RawNode, string>();
  for (const c of prior?.carried ?? []) {
    const inside = raw.filter((r) => c.start <= r.first && r.first < c.end);
    if (inside.length === c.nodes.length && inside.every((r, i) => r.name === c.nodes[i].name)) {
      inside.forEach((r, i) => carry.set(r, c.nodes[i].id));
    }
  }
  const used = new Set(carry.values());
  const nodes = raw.map((r, i) => {
    let id = carry.get(r) ?? keep(r.nameSpan, r.name);
    if (id === null || (!carry.has(r) && used.has(id))) id = `id${ids.next++}`;
    return new ViewNode({ ...r, index: i + 1, id });
  });
  const of = new Map(raw.map((r, i) => [r, nodes[i]]));
  raw.forEach((r, i) => {
    if (r.parent) {
      const p = of.get(r.parent)!;
      nodes[i].parent = p;
      p.children.push(nodes[i]);
    }
  });
  for (const n of nodes) n.children.sort((a, b) => a.first - b.first);
  return { tree: new SyntaxTree(source, module, comments, nodes, ids), diagnostics: [] };
}

/** Maps a new node's name span to the id of the old node it corresponds to, when no edit touched it. */
function idMapper(prior: Prior): (span: Span, name: string) => string | null {
  // The edited ranges in the new text, with the total shift of the text after each.
  const ranges: { start: number; end: number; shift: number }[] = [];
  let shift = 0;
  for (const e of prior.edits) {
    const start = e.start + shift;
    shift += e.text.length - (e.end - e.start);
    ranges.push({ start, end: start + e.text.length, shift });
  }
  const old = new Map(prior.tree.nodes.map((n) => [`${n.nameSpan.start}:${n.nameSpan.end}`, n]));
  return (span, name) => {
    let delta = 0;
    for (const r of ranges) {
      const touched = r.end > r.start
        ? span.start < r.end && r.start < span.end // inserted or replaced text overlaps the name
        : span.start < r.start && r.start < span.end; // a removal inside the name
      if (touched) return null;
      if (r.end <= span.start) delta = r.shift;
    }
    const n = old.get(`${span.start - delta}:${span.end - delta}`);
    return n && n.name === name ? n.id : null;
  };
}

interface RawNode {
  kind: ViewNodeKind;
  name: string;
  span: Span;
  nameSpan: Span;
  first: number;
  syntax: A.Call | A.Ident | A.IfStmt;
  expr: A.Node;
  modifiers: (A.Call | A.Member)[];
  parent: RawNode | null;
}

/** Whether a member segment continues a dotted type name (`Badge.Ribbon`) rather than modifying. */
function isTypeSegment(name: string): boolean {
  return /^\p{Lu}/u.test(name);
}

/** The dotted name of identifiers a callee is (`Text`, `Badge.Ribbon`), or null. */
function dottedName(callee: A.Node): string | null {
  if (callee.kind === "Ident") return callee.name;
  if (callee.kind === "Member" && isTypeSegment(callee.name)) {
    const base = dottedName(callee.base);
    return base === null ? null : `${base}.${callee.name}`;
  }
  return null;
}

class Collector {
  private readonly out: RawNode[] = [];
  private readonly source: string;
  private readonly commentByEnd: Map<number, Comment>;

  constructor(source: string, comments: readonly Comment[]) {
    this.source = source;
    this.commentByEnd = new Map(comments.map((c) => [c.end, c]));
  }

  collect(mod: A.Module): RawNode[] {
    for (const s of mod.structs) {
      for (const p of s.properties) if (p.default) this.expr(p.default, null, false);
      if (s.body) this.stmts(s.body, null);
    }
    this.stmts(mod.statements, null);
    return this.out;
  }

  private stmts(stmts: readonly A.Node[], parent: RawNode | null): void {
    for (const s of stmts) this.stmt(s, parent);
  }

  private stmt(s: A.Node, parent: RawNode | null): void {
    if (s.kind === "IfStmt") {
      const first = s.start!;
      const node = this.add({
        kind: "if", name: "if", syntax: s, expr: s, modifiers: [], first,
        nameSpan: { start: first, end: first + 2 }, span: { start: this.leading(first), end: s.end! }, parent,
      });
      this.expr(s.cond, node, false);
      this.stmts(s.then, node);
      this.stmts(s.other, node);
    } else if (s.kind === "ExprStmt") this.expr(s.expr, parent, true);
    else if (s.kind === "LetStmt") this.expr(s.value, parent, false);
    else this.expr(s, parent, false);
  }

  /** Visit an expression; `statement` when it stands alone as a view statement. */
  private expr(e: A.Node, parent: RawNode | null, statement: boolean): void {
    const modifiers: (A.Call | A.Member)[] = [];
    let cur = e;
    for (;;) {
      if (cur.kind === "Call" && cur.callee.kind === "Member" && dottedName(cur.callee) === null) {
        modifiers.push(cur);
        cur = cur.callee.base;
      } else if (cur.kind === "Member" && dottedName(cur) === null) {
        modifiers.push(cur); // `Color.red`, or `view.modifier` without parentheses
        cur = cur.base;
      } else break;
    }
    modifiers.reverse();
    let root: RawNode | null = null;
    if (cur.kind === "Call" && dottedName(cur.callee) !== null && cur.start !== undefined) {
      root = this.add({
        kind: "call", name: dottedName(cur.callee)!, syntax: cur, expr: e, modifiers, first: cur.start, parent,
        nameSpan: { start: cur.callee.start!, end: cur.callee.end! },
        span: { start: statement ? this.leading(cur.start) : cur.start, end: e.end! },
      });
      for (const a of cur.args) this.expr(a.value, root, false);
      for (const [, c] of cur.trailing) this.stmts(c.body, root);
    } else if (cur.kind === "Ident" && statement && cur.start !== undefined) {
      root = this.add({
        kind: "ident", name: cur.name, syntax: cur, expr: e, modifiers, first: cur.start, parent,
        nameSpan: { start: cur.start, end: cur.end! },
        span: { start: this.leading(cur.start), end: e.end! },
      });
    }
    if (root) {
      for (const m of modifiers) {
        if (m.kind !== "Call") continue;
        for (const a of m.args) this.expr(a.value, root, false);
        for (const [, c] of m.trailing) this.stmts(c.body, root);
      }
      return;
    }
    this.children(e, parent);
  }

  /** Visit the sub-expressions of an expression that is no view node. */
  private children(e: A.Node, parent: RawNode | null): void {
    switch (e.kind) {
      case "Call":
        this.expr(e.callee, parent, false);
        for (const a of e.args) this.expr(a.value, parent, false);
        for (const [, c] of e.trailing) this.stmts(c.body, parent);
        break;
      case "Member": this.expr(e.base, parent, false); break;
      case "Closure": this.stmts(e.body, parent); break;
      case "StringLit": for (const p of e.parts) if (typeof p !== "string") this.expr(p, parent, false); break;
      case "ArrayLit": for (const x of e.items) this.expr(x, parent, false); break;
      case "DictLit":
        for (const [k, v] of e.items) {
          this.expr(k, parent, false);
          this.expr(v, parent, false);
        }
        break;
      case "TupleLit": for (const a of e.items) this.expr(a.value, parent, false); break;
      case "RangeExpr": this.expr(e.lo, parent, false); this.expr(e.hi, parent, false); break;
      case "Unary": this.expr(e.operand, parent, false); break;
      case "Binary": this.expr(e.left, parent, false); this.expr(e.right, parent, false); break;
      case "Ternary":
        this.expr(e.cond, parent, false);
        this.expr(e.then, parent, false);
        this.expr(e.other, parent, false);
        break;
      case "Subscript": this.expr(e.base, parent, false); this.expr(e.index, parent, false); break;
      case "IfStmt": case "ExprStmt": case "LetStmt": this.stmt(e, parent); break;
      default: break;
    }
  }

  private add(r: RawNode): RawNode {
    this.out.push(r);
    return r;
  }

  /**
   * Where a node's span starts (C11): at the first of the comment-only lines directly above its first
   * line, when its first token is the first on its line; otherwise at its first token.
   */
  private leading(first: number): number {
    const src = this.source;
    let lineStart = this.lineStart(first);
    if (!this.blank(lineStart, first)) return first;
    let start = first;
    while (lineStart > 0) {
      let r = lineStart - 1; // the line feed ending the line above
      while (r > 0 && (src[r - 1] === " " || src[r - 1] === "\t" || src[r - 1] === "\r")) r -= 1;
      let c = this.commentByEnd.get(r);
      if (!c) break; // a blank line, or code
      let ls = this.lineStart(c.start);
      while (!this.blank(ls, c.start)) { // several comments on one line: `/* a */ // b`
        let q = c.start;
        while (q > ls && (src[q - 1] === " " || src[q - 1] === "\t")) q -= 1;
        const before = this.commentByEnd.get(q);
        if (!before) return start; // code before the comment: it trails that code
        c = before;
        ls = this.lineStart(c.start);
      }
      start = c.start;
      lineStart = ls;
    }
    return start;
  }

  private lineStart(at: number): number {
    return this.source.lastIndexOf("\n", at - 1) + 1;
  }

  private blank(a: number, b: number): boolean {
    return /^[ \t\r﻿]*$/.test(this.source.slice(a, b));
  }
}
