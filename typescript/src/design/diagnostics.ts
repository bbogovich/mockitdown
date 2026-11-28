/**
 * The diagnostics list's model (R-TOOL-010): what `mockitdown-diagnostics` shows and where an entry
 * leads, kept here beside the session so that the list itself holds no rule (A-WEB-5.K2).
 *
 *   diagnosticEntries(session);            // the active mockup's diagnostics, in the session's order
 *   activateDiagnostic(session, 0);        // selects the node it names, or returns the range to reveal
 *
 * - An entry (C1) is one of the session's diagnostics of the active mockup with its severity, message,
 *   line and column (1-based, the column counted in code points as the lexer counts it) and `where`,
 *   the text the list shows (`2:13`, or `file:2:13` for an imported file's, empty without a line).
 * - Its target (C2): the innermost view node whose span holds its location (`session.nodeAt`), else,
 *   while the code does not parse or outside every node, the location as an empty range of the
 *   mockup's code, for the host to reveal in its code view. A diagnostic of an imported file, or one
 *   without a line, leads nowhere.
 */

import type { DesignSession } from "./session.js";

/** What the list shows when the active mockup has no diagnostics (C1). */
export const NO_PROBLEMS = "No problems";
/** The event the list dispatches for an entry with no node (C2): `detail: {mockup, range: {start, end}}`. */
export const REVEAL_EVENT = "mockitdown-reveal";

/** A diagnostic as the list reads it: the core's `Diagnostic`, or any object with these fields. */
export interface DiagnosticLike {
  severity: string;
  message: string;
  code?: string;
  location?: { line: number; col: number; source?: string };
}

/** One entry of the list (C1). */
export interface DiagnosticEntry {
  /** Its position in the session's diagnostics of the mockup. */
  index: number;
  severity: string;
  message: string;
  /** The diagnostic's code (`argument`, `unknown`, …), empty when it has none. */
  code: string;
  /** 1-based; 0 when the diagnostic has no location. */
  line: number;
  col: number;
  /** The file of an imported module's diagnostic, empty for the mockup's own code. */
  source: string;
  /** `line:col`, prefixed with the file for an imported one; empty without a line. */
  where: string;
}

/** Where an entry leads (C2): a node to select, or a range of the mockup's code to reveal. */
export type DiagnosticTarget =
  | { kind: "node"; mockup: string; node: string }
  | { kind: "code"; mockup: string; range: { start: number; end: number } };

/** The diagnostics of a mockup (the active one by default) as list entries, in the session's order (C1). */
export function diagnosticEntries(session: DesignSession, name: string | null = session.active): DiagnosticEntry[] {
  if (name === null) return [];
  return session.diagnostics(name).map((d, index) => {
    const line = d.location?.line ?? 0;
    const col = d.location?.col ?? 0;
    const source = d.location?.source ?? "";
    const where = line >= 1 ? `${source ? `${source}:` : ""}${line}:${col}` : "";
    return { index, severity: d.severity, message: d.message, code: d.code ?? "", line, col, source, where };
  });
}

/**
 * The UTF-16 offset of a 1-based line and column of `code`, the column counted in code points (the
 * lexer's columns); a column past the line's end is its end. Null for a line before 1 or past the last.
 */
export function diagnosticOffset(code: string, line: number, col: number): number | null {
  if (!(line >= 1)) return null;
  let start = 0;
  for (let l = 1; l < line; l++) {
    const nl = code.indexOf("\n", start);
    if (nl < 0) return null;
    start = nl + 1;
  }
  const nl = code.indexOf("\n", start);
  const end = nl < 0 ? code.length : nl;
  let at = start;
  for (let c = 1; c < col && at < end; c++) at += (code.codePointAt(at) ?? 0) > 0xffff ? 2 : 1;
  return Math.min(at, end);
}

/** Where a diagnostic of a mockup (the active one by default) leads (C2), or null. */
export function diagnosticTarget(session: DesignSession, diagnostic: DiagnosticLike, name: string | null = session.active): DiagnosticTarget | null {
  if (name === null) return null;
  const loc = diagnostic.location;
  if (!loc || (loc.source ?? "") !== "" || !(loc.line >= 1)) return null;
  const code = session.code(name);
  if (code === null) return null;
  const offset = diagnosticOffset(code, loc.line, loc.col);
  if (offset === null) return null;
  const node = session.nodeAt(name, offset);
  if (node !== null) return { kind: "node", mockup: name, node };
  return { kind: "code", mockup: name, range: { start: offset, end: offset } };
}

/**
 * Activate the entry at `index` of the active mockup (C2): select its node and return its target, or
 * return the range for the host to reveal; null (nothing done) when it leads nowhere.
 */
export function activateDiagnostic(session: DesignSession, index: number): DiagnosticTarget | null {
  const name = session.active;
  if (name === null) return null;
  const d = session.diagnostics(name)[index];
  if (!d) return null;
  const target = diagnosticTarget(session, d, name);
  if (target?.kind === "node") session.select([target.node]);
  return target;
}
