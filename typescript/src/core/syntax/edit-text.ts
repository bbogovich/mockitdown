/** Text helpers of the structural edit API: ranges, lines, indentation and string literals. */

import type { TextEdit, ViewNode } from "./tree.js";

/** A node's descendant view nodes, depth first. */
export function descendants(n: ViewNode): ViewNode[] {
  return n.children.flatMap((c) => [c, ...descendants(c)]);
}

/** Merge overlapping removals into single ranges. */
export function mergeRanges(edits: TextEdit[]): TextEdit[] {
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
export function reindent(lines: readonly string[], indent: string): string[] {
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

/** The string literal for `text`: quotes, backslashes and control characters escaped. */
export function quote(text: string): string {
  return `"${text.replace(/[\\"]/g, (c) => `\\${c}`).replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")}"`;
}

/** The comment trailing a line (with the spaces before it), or the empty string. */
export function trailingComment(rest: string): string {
  const m = /^([ \t]*);?([ \t]*)(\/\/.*|\/\*.*\*\/)[ \t]*\r?$/.exec(rest);
  return m ? (m[1] + m[2] || " ") + m[3].replace(/\r$/, "") : "";
}

/** The offset where the line holding `at` starts. */
export function lineStart(src: string, at: number): number {
  return src.lastIndexOf("\n", at - 1) + 1;
}

/** The offset where the line holding `at` ends (its `\n`, or the end of the source). */
export function lineEnd(src: string, at: number): number {
  const i = src.indexOf("\n", at);
  return i < 0 ? src.length : i;
}

/** Whether text holds only spaces, tabs and carriage returns. */
export function blank(text: string): boolean {
  return /^[ \t\r]*$/.test(text);
}

/** The indentation of the line holding `at`. */
export function lineIndent(src: string, at: number): string {
  return /^[ \t]*/.exec(src.slice(lineStart(src, at)))![0];
}

/** Whether only indentation stands before `at` on its line. */
export function startsLine(src: string, at: number): boolean {
  return blank(src.slice(lineStart(src, at), at));
}
