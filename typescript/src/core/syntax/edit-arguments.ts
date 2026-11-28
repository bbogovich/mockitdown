/**
 * The operations on one node of the structural edit API (R-EDIT-003): its arguments, its modifiers,
 * its `.id(…)` and `.ref(…)`, the comment lines above it and its name. Each is a function over the
 * Editor's state (`EditorState`: the tree, its source and tokens, and naming a node), returning the
 * plan `edit()` applies; `edit.ts` dispatches to them.
 */

import { Diagnostic, Location } from "../diagnostics.js";
import type * as A from "./ast.js";
import type { Token } from "./lexer.js";
import { parseTree, type SyntaxTree, type TextEdit, type ViewNode } from "./tree.js";
import { describe, Refusal, type NodeRef, type Plan, type RenameOp, type SetArgumentOp, type SetCommentOp, type SetNameOp, type SetRefsOp } from "./edit-types.js";
import { blank, lineEnd, lineIndent, lineStart, quote, startsLine, trailingComment } from "./edit-text.js";

/** What the argument operations read of the Editor: the tree, its source and tokens, and a node by reference (C3). */
export interface EditorState {
  readonly tree: SyntaxTree;
  readonly src: string;
  readonly tokens: Token[];
  node(ref: NodeRef): ViewNode;
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

/** C1–C4: add, replace or remove one argument of the node's call. */
export function setArgument(ed: EditorState, op: SetArgumentOp): Plan {
  const n = callNode(ed, op.node);
  const label = op.label ?? null;
  if (label !== null && (typeof label !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(label))) {
    throw new Refusal(`${JSON.stringify(label)} is not an argument label`);
  }
  if (op.value !== null && typeof op.value !== "string") throw new Refusal("the value of an argument is not a string or null");
  const value = op.value === null ? null : argumentCode(ed, label, op.value);
  const call = callShape(ed, n);
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
    return { edits: [argumentRemoval(ed, call, target)] };
  }
  // C2: replace in place.
  if (target) return { edits: [{ start: target.valueStart, end: target.end, text: value }] };
  const text = label === null ? value : `${label}: ${value}`;
  // C4: a call without parentheses gets them directly after its name.
  if (!call.parens) return { edits: [{ start: call.nameEnd, end: call.nameEnd, text: `(${text})` }] };
  if (!args.length) return { edits: [{ start: call.parens[0] + 1, end: call.parens[0] + 1, text }] };
  if (label === null && positional.length) {
    // A new positional argument at its position: before the one it displaces, else after the last.
    if (position < positional.length) return { edits: [argumentBefore(ed, positional[position], text)] };
    return { edits: [argumentAfter(ed, positional[positional.length - 1], text)] };
  }
  if (label === null) return { edits: [argumentBefore(ed, args[0], text)] };
  return { edits: [argumentAfter(ed, args[args.length - 1], text)] };
}

/** New argument text before `a`: on its line, or on a line of its own when `a` starts its line. */
function argumentBefore(ed: EditorState, a: ArgShape, text: string): TextEdit {
  const sep = startsLine(ed.src, a.start) ? `,\n${lineIndent(ed.src, a.start)}` : ", ";
  return { start: a.start, end: a.start, text: text + sep };
}

/** New argument text after `a`: on its line, or on a line of its own when `a` starts its line. */
function argumentAfter(ed: EditorState, a: ArgShape, text: string): TextEdit {
  const sep = startsLine(ed.src, a.start) ? `,\n${lineIndent(ed.src, a.start)}` : ", ";
  return { start: a.end, end: a.end, text: sep + text };
}

/** C3, C4: an argument with the separator before or after it; the last one with empty parentheses before a closure. */
function argumentRemoval(ed: EditorState, call: CallShape, a: ArgShape): TextEdit {
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
export function setModifier(ed: EditorState, n: ViewNode, name: unknown, index: unknown, args: unknown): Plan {
  notIf(ed, n);
  if (typeof name !== "string" || !/^[a-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Refusal(`${JSON.stringify(name ?? null)} is not a modifier name: an identifier starting with a lower-case letter`);
  }
  if (args !== null && typeof args !== "string") throw new Refusal("the arguments of a modifier are not a string or null");
  const code = args === null ? null : modifierArgs(ed, args);
  const mods = modifierShapes(ed, n);
  const same = mods.filter((m) => m.name === name);
  if (!Number.isInteger(index) || (index as number) < 0 || (index as number) > same.length
    || (code === null && index === same.length)) {
    throw new Refusal(same.length
      ? `${n.ordinal} has ${same.length} .${name} modifier${same.length > 1 ? "s" : ""}: index ${JSON.stringify(index ?? null)} is out of range`
      : `${n.ordinal} has no .${name} modifier`);
  }
  const target = same[index as number];
  if (target && code === null) return { edits: [modifierRemoval(ed, target)] };
  if (target) {
    if (target.parens) return { edits: [{ start: target.parens[0] + 1, end: target.parens[1], text: code! }] };
    return { edits: [{ start: target.nameEnd, end: target.nameEnd, text: `(${code})` }] };
  }
  // C6: appended to the chain, on its line, or on a line of its own like the other continuation lines.
  const text = `.${name}(${code})`;
  const end = n.expr.end!;
  const lines = mods.filter((m) => startsLine(ed.src, m.dot));
  if (!lines.length) return { edits: [{ start: end, end, text }] };
  const indent = lineIndent(ed.src, lines[lines.length - 1].dot);
  const at = blank(ed.src.slice(end, lineEnd(ed.src, end))) || trailingComment(ed.src.slice(end, lineEnd(ed.src, end)))
    ? lineEnd(ed.src, end) : end;
  return { edits: [{ start: at, end: at, text: `\n${indent}${text}` }] };
}

/** C7: a modifier on a line of its own goes with its line; one sharing a line goes with the spaces before it. */
function modifierRemoval(ed: EditorState, m: ModifierShape): TextEdit {
  const src = ed.src;
  const rest = src.slice(m.end, lineEnd(src, m.end));
  if (startsLine(ed.src, m.dot) && (blank(rest) || trailingComment(rest))) {
    const a = lineStart(src, m.dot);
    const b = lineEnd(src, m.end);
    if (b >= src.length) return { start: a - 1, end: b, text: "" };
    return { start: a, end: b + 1, text: "" };
  }
  const lead = startsLine(ed.src, m.dot) ? 0 : /[ \t]*$/.exec(src.slice(lineStart(src, m.dot), m.dot))![0].length;
  return { start: m.dot - lead, end: m.end, text: "" };
}

/** C8, C9: the node's `.id(…)`, refused when another node carries the identifier. */
export function rename(ed: EditorState, op: RenameOp): Plan {
  const n = ed.node(op.node);
  const id = op.id;
  if (id !== null && (typeof id !== "string" || id === "")) throw new Refusal(`${JSON.stringify(id ?? null)} is not an identifier`);
  if (id !== null) {
    for (const other of ed.tree.nodes) {
      if (other !== n && identifiersOf(other).includes(id)) {
        throw new Refusal(`the identifier ${JSON.stringify(id)} is already used by ${other.ordinal}`);
      }
    }
  }
  return setModifier(ed, n, "id", 0, id === null ? null : quote(id));
}

/** C10: the node's `.ref(…)`, removed for an empty list. */
export function setRefs(ed: EditorState, op: SetRefsOp): Plan {
  const n = ed.node(op.node);
  if (!Array.isArray(op.refs) || op.refs.some((r) => typeof r !== "string")) throw new Refusal("the references are not a list of strings");
  return setModifier(ed, n, "ref", 0, op.refs.length ? op.refs.map(quote).join(", ") : null);
}

/** C11: the comment lines directly above the node, one `//` line per line of the text, at its indentation. */
export function setComment(ed: EditorState, op: SetCommentOp): Plan {
  const n = ed.node(op.node);
  if (op.text !== null && typeof op.text !== "string") throw new Refusal("the comment is not a string or null");
  if (!startsLine(ed.src, n.first)) throw new Refusal(`${n.ordinal} does not start its line, so it has no comment lines above it`);
  const start = lineStart(ed.src, n.span.start);
  const end = lineStart(ed.src, n.first);
  const indent = lineIndent(ed.src, n.first);
  const text = op.text === null || op.text === "" ? ""
    : op.text.replace(/\r?\n$/, "").split(/\r?\n/).map((l) => `${indent}//${l ? ` ${l}` : ""}\n`).join("");
  if (start === end && text === "") throw new Refusal(`${n.ordinal} has no comment lines above it`);
  return { edits: [{ start, end, text }] };
}

/** C12: the node's name, nothing else. */
export function setName(ed: EditorState, op: SetNameOp): Plan {
  const n = ed.node(op.node);
  notIf(ed, n);
  if (typeof op.name !== "string" || !/^\p{Lu}[\p{L}\p{N}_]*(?:\.\p{Lu}[\p{L}\p{N}_]*)*$/u.test(op.name)) {
    throw new Refusal(`${JSON.stringify(op.name ?? null)} is not an element name: a capitalised identifier, or several joined by dots`);
  }
  return { edits: [{ start: n.nameSpan.start, end: n.nameSpan.end, text: op.name }] };
}

function notIf(ed: EditorState, n: ViewNode): void {
  if (n.kind === "if") throw new Refusal(`${n.ordinal} is an if statement, not a call`);
}

function callNode(ed: EditorState, ref: NodeRef): ViewNode {
  const n = ed.node(ref);
  notIf(ed, n);
  return n;
}

/** The code of an argument value, which must parse as one (C1). */
function argumentCode(ed: EditorState, label: string | null, value: string): string {
  const code = value.trim();
  const prefix = `X(${label === null ? "" : `${label}: `}`;
  const call = probe(ed, prefix, `${code})`, "the value");
  if (call.args.length !== 1 || call.args[0].label !== label) throw new Refusal("the value is not one argument value");
  return code;
}

/** The code between a modifier's parentheses, which must parse as an argument list (C5). */
function modifierArgs(ed: EditorState, args: string): string {
  const code = args.trim();
  probe(ed, "X(", `${code})`, "the modifier arguments");
  return code;
}

/**
 * Parse `prefix + code`, which must be one call without closures or modifiers. A syntax diagnostic
 * on the first line counts its column from the start of `rest` (the caller's code and the closing
 * `)`), at most just after the caller's code.
 */
function probe(ed: EditorState, prefix: string, rest: string, what: string): A.Call {
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
function callShape(ed: EditorState, n: ViewNode): CallShape {
  if (n.kind === "ident") return { nameEnd: n.nameSpan.end, parens: null, args: [], trailing: false };
  const call = n.syntax as A.Call;
  const nameEnd = call.callee.end!;
  return { nameEnd, parens: parens(ed, nameEnd), args: call.args.map((a) => argShape(ed, a)), trailing: call.trailing.length > 0 };
}

function argShape(ed: EditorState, a: A.Arg): ArgShape {
  const valueStart = a.value.start!;
  let start = valueStart;
  if (a.label !== null) {
    let i = ed.tokens.findIndex((t) => t.start >= valueStart) - 1;
    while (i >= 0 && ed.tokens[i].kind === "NEWLINE") i--;
    if (i >= 1 && ed.tokens[i].kind === "COLON") start = ed.tokens[i - 1].start;
  }
  return { label: a.label, start, valueStart, end: a.value.end! };
}

/** The `(` directly after `offset` (the end of a name) and its matching `)`, or null. */
function parens(ed: EditorState, offset: number): [number, number] | null {
  const i = ed.tokens.findIndex((t) => t.start >= offset);
  if (i < 0 || ed.tokens[i].kind !== "LPAREN") return null;
  let depth = 0;
  for (let j = i; j < ed.tokens.length; j++) {
    const k = ed.tokens[j].kind;
    if (k === "LPAREN") depth++;
    else if (k === "RPAREN" && --depth === 0) return [ed.tokens[i].start, ed.tokens[j].start];
  }
  return null;
}

/** The node's modifiers with their names, dots and parentheses. */
function modifierShapes(ed: EditorState, n: ViewNode): ModifierShape[] {
  return n.modifiers.map((m) => {
    const member = (m.kind === "Call" ? m.callee : m) as A.Member;
    const dot = ed.tokens.find((t) => t.start >= member.base.end! && t.kind === "DOT")!.start;
    const nameEnd = member.end!;
    return { name: member.name, dot, nameEnd, end: m.end!, parens: m.kind === "Call" ? parens(ed, nameEnd) : null };
  });
}
