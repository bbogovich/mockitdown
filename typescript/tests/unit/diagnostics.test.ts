// IT-68 (unit part): the diagnostics list's model (R-TOOL-010 TC-1, C1 to C3), `mockitdown/design`'s
// diagnostics.ts. Every expected value was written by hand from the sources below before the code ran.
//
//   WARN = 'VStack {\n  Text("A", bogus: 1)\n  Bogus()\n}\n' (43 characters). Line starts: 1 → 0, 2 → 9,
//   3 → 31, 4 → 41. `Text("A", bogus: 1)` spans 11-30, its label `bogus` is line 2 column 13 (offset 21);
//   `Bogus()` spans 33-40; an unknown element's error stands at its call's `(` (line 3 column 8, offset 38;
//   first written as column 3, corrected after the run: the evaluator locates a call at its parenthesis).
//   BROKEN = 'VStack {\n  Text("A"\n}\n': line 3 starts at 20, where the `}` stands in for the missing `)`.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  activateDiagnostic, DesignSession, diagnosticEntries, diagnosticOffset, diagnosticTarget, newDesign, NO_PROBLEMS, REVEAL_EVENT,
  type DesignDocument,
} from "mockitdown/design";
import { setup } from "./helpers.js";

setup();

const WARN = 'VStack {\n  Text("A", bogus: 1)\n  Bogus()\n}\n';
const BROKEN = 'VStack {\n  Text("A"\n}\n';
const CLEAN = 'VStack {\n  Text("A")\n}\n';

function doc(code: string): DesignDocument {
  const d = newDesign("Diagnostics");
  d.defaults = { pack: "base" };
  d.mockups.push({ name: "Main", x: 0, y: 0, code });
  d.mockups.push({ name: "Other", x: 600, y: 0, code: CLEAN });
  return d;
}

const nodeNamed = (s: DesignSession, name: string) => s.tree("Main")!.nodes.find((n) => n.name === name)!;

test("C1: the active mockup's diagnostics in order, each with severity, message, line and column", () => {
  const s = new DesignSession(doc(WARN));
  const entries = diagnosticEntries(s);
  assert.deepEqual(entries.map((e) => [e.index, e.severity, e.message, e.line, e.col, e.where]), [
    [0, "warning", "'bogus' is not understood by Text in pack 'base'", 2, 13, "2:13"],
    [1, "error", "'Bogus' is not an element of pack 'base' and no struct of that name is declared or imported", 3, 8, "3:8"],
  ]);
  assert.equal(NO_PROBLEMS, "No problems");
  assert.equal(REVEAL_EVENT, "mockitdown-reveal");
  s.setActive("Other");
  assert.deepEqual(diagnosticEntries(s), []);
  assert.deepEqual(diagnosticEntries(s, "Main").length, 2);
  assert.deepEqual(diagnosticEntries(new DesignSession(newDesign("Empty"))), []);
});

test("diagnosticOffset: 1-based line and column, the column counted in code points", () => {
  const code = "a\u{1F680}b\ncd";
  assert.equal(diagnosticOffset(code, 1, 1), 0);
  assert.equal(diagnosticOffset(code, 1, 3), 3);
  assert.equal(diagnosticOffset(code, 2, 2), 6);
  assert.equal(diagnosticOffset(code, 1, 99), 4);
  assert.equal(diagnosticOffset(code, 3, 1), null);
  assert.equal(diagnosticOffset(code, 0, 0), null);
  assert.equal(diagnosticOffset(WARN, 2, 13), 21);
  assert.equal(diagnosticOffset(WARN, 3, 8), 38);
});

test("C2: an entry leads to the innermost node holding its location, else to its place in the code", () => {
  const s = new DesignSession(doc(WARN));
  const text = nodeNamed(s, "Text");
  const bogus = nodeNamed(s, "Bogus");
  assert.deepEqual([text.span.start, text.span.end, bogus.span.start, bogus.span.end], [11, 30, 33, 40]);
  const [warning, error] = s.diagnostics("Main");
  assert.deepEqual(diagnosticTarget(s, warning!), { kind: "node", mockup: "Main", node: text.id });
  assert.deepEqual(diagnosticTarget(s, error!), { kind: "node", mockup: "Main", node: bogus.id });
  // A diagnostic of an imported file, or one with no location, leads nowhere.
  assert.equal(diagnosticTarget(s, { severity: "warning", message: "x", location: { line: 1, col: 1, source: "components/pill.mockitdown" } }), null);
  assert.equal(diagnosticTarget(s, { severity: "warning", message: "x", location: { line: 0, col: 0, source: "" } }), null);

  // Activating selects the node (V1: the element carrying the unknown argument).
  assert.deepEqual(activateDiagnostic(s, 0), { kind: "node", mockup: "Main", node: text.id });
  assert.deepEqual(s.selection, [text.id]);
  assert.deepEqual(activateDiagnostic(s, 1), { kind: "node", mockup: "Main", node: bogus.id });
  assert.deepEqual(s.selection, [bogus.id]);
  assert.equal(activateDiagnostic(s, 2), null);
  assert.deepEqual(s.selection, [bogus.id]);

  // A syntax error: no node while the code does not parse, so its place in the code, the selection kept.
  s.setCode("Main", BROKEN);
  assert.equal(s.parses("Main"), false);
  const broken = diagnosticEntries(s);
  assert.equal(broken.length, 1);
  assert.deepEqual([broken[0]!.severity, broken[0]!.line, broken[0]!.col], ["error", 3, 1]);
  assert.deepEqual(activateDiagnostic(s, 0), { kind: "code", mockup: "Main", range: { start: 20, end: 20 } });
});

test("C3: a diagnostics notification carries what the list shows next", () => {
  const s = new DesignSession(doc(WARN));
  const seen: number[] = [];
  s.subscribe((n) => {
    if (n.kind === "diagnostics") seen.push(diagnosticEntries(s).length);
  });
  s.setCode("Main", BROKEN);
  s.setCode("Main", CLEAN);
  assert.deepEqual(seen, [1, 0]);
});
