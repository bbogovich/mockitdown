// IT-64: the selection commands of the design session (R-EDIT-008). TC-1 (C1, C2, C4, C5, C6, C7,
// C10, C11): duplicate with -copy id suffixes, cut and paste into a stack and after a leaf, a refused
// paste, moves at the first and last position, and every command undone and redone with the
// selection restored (F-19.AC9); the session part of C3 (copy) and C8 (range and toggle selection).
// Every expected code below is written by hand from the clauses before the commands ran: the start
// document with the lines each command adds, removes or moves, indented as the edit corpus prints
// children (the parent's first child's indentation).
import assert from "node:assert/strict";
import { test } from "node:test";
import { DesignSession, newDesign, type DesignDocument, type DesignNotification, type TextEdit } from "mockitdown/design";
import { setup } from "./helpers.js";

setup();

const MAIN = [
  "VStack {",
  '  Text("Title")',
  '  Button("A").id("ok")',
  "  // the row",
  "  HStack {",
  '    Text("Left").id("left")',
  "  }",
  "}",
  "",
].join("\n");

function doc(): DesignDocument {
  const d = newDesign("Commands");
  d.defaults = { pack: "base" };
  d.mockups.push({ name: "Main", x: 0, y: 0, code: MAIN });
  return d;
}

const lines = (...ls: string[]): string => [...ls, ""].join("\n");
const why = (r: object): string => ("error" in r ? String((r as { error: unknown }).error) : "applied");

/** The node of the active mockup whose own code (from its first token) starts with `head`, the n-th such. */
function node(s: DesignSession, head: string, nth = 0): string {
  const tree = s.tree(s.active!)!;
  const found = tree.nodes.filter((n) => tree.source.slice(n.first).startsWith(head));
  const n = found[nth];
  if (!n) assert.fail(`no node starts with ${head}`);
  return n.id;
}

/** The selection as the first line of each selected node, from its first token. */
function selected(s: DesignSession): string[] {
  const tree = s.tree(s.active!)!;
  return s.selection.map((id) => {
    const n = tree.byId(id)!;
    return tree.source.slice(n.first, tree.source.indexOf("\n", n.first));
  });
}

function recorder(s: DesignSession): DesignNotification[] {
  const seen: DesignNotification[] = [];
  s.subscribe((n) => seen.push(n));
  return seen;
}

function applyEdits(code: string, edits: readonly TextEdit[]): string {
  let out = code;
  for (const e of [...edits].sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}

const state = (s: DesignSession) => ({ code: s.code("Main")!, selection: [...s.selection] });

/** Undo the latest step and redo it: the code and the selection from before and after it come back (C10, V1). */
function roundTrip(s: DesignSession, before: { code: string; selection: string[] }): void {
  const after = state(s);
  const seen = recorder(s);
  assert.ok(!("error" in s.undo()));
  assert.equal(s.code("Main"), before.code, "undo gives back the code before the command");
  assert.deepEqual([...s.selection], before.selection, "undo gives back the selection before the command");
  assert.ok(!("error" in s.redo()));
  assert.equal(s.code("Main"), after.code, "redo gives back the code after the command");
  assert.deepEqual([...s.selection], after.selection, "redo gives back the selection after the command");
  assert.equal(seen.filter((n) => n.kind === "change").length, 2, "one change for the undo, one for the redo");
}

/** How many steps can be undone (undone and redone again to count them). */
function steps(s: DesignSession): number {
  let n = 0;
  while (s.canUndo) {
    s.undo();
    n++;
  }
  for (let k = 0; k < n; k++) s.redo();
  return n;
}

test("TC-1: duplicate inserts a copy after the node, the copy's id becomes <id>-copy, then <id>-copy-<n> from 2, and the copy is selected (C1, C2, C10)", () => {
  const s = new DesignSession(doc());
  const ok = node(s, 'Button("A")');
  s.select([ok]);
  const seen = recorder(s);
  const before = state(s);
  assert.equal(why(s.duplicate()), "applied");
  assert.equal(s.code("Main"), lines(
    "VStack {",
    '  Text("Title")',
    '  Button("A").id("ok")',
    '  Button("A").id("ok-copy")',
    "  // the row",
    "  HStack {",
    '    Text("Left").id("left")',
    "  }",
    "}",
  ));
  assert.deepEqual(selected(s), ['Button("A").id("ok-copy")'], "the copy is selected");
  const changes = seen.filter((n) => n.kind === "change");
  assert.equal(changes.length, 1, "one change");
  if (changes[0]!.kind === "change") assert.equal(applyEdits(MAIN, changes[0]!.detail.edits), s.code("Main"));
  assert.deepEqual(seen.filter((n) => n.kind === "insert").map((n) => n.detail), [{ mockup: "Main", node: s.selection[0], element: "Button" }]);
  roundTrip(s, before);

  // A second duplicate of the original: ok-copy is taken, so ok-copy-2, directly after the original.
  s.select([ok]);
  s.duplicate();
  assert.equal(s.code("Main"), lines(
    "VStack {",
    '  Text("Title")',
    '  Button("A").id("ok")',
    '  Button("A").id("ok-copy-2")',
    '  Button("A").id("ok-copy")',
    "  // the row",
    "  HStack {",
    '    Text("Left").id("left")',
    "  }",
    "}",
  ));
  assert.equal(steps(s), 2, "two duplicates, two steps");

  // A duplicate of the copy: its id is ok-copy, so its copy is ok-copy-copy, directly after it.
  s.select([node(s, 'Button("A")', 2)]);
  assert.deepEqual(selected(s), ['Button("A").id("ok-copy")']);
  s.duplicate();
  assert.equal(s.code("Main"), lines(
    "VStack {",
    '  Text("Title")',
    '  Button("A").id("ok")',
    '  Button("A").id("ok-copy-2")',
    '  Button("A").id("ok-copy")',
    '  Button("A").id("ok-copy-copy")',
    "  // the row",
    "  HStack {",
    '    Text("Left").id("left")',
    "  }",
    "}",
  ));
  assert.deepEqual(selected(s), ['Button("A").id("ok-copy-copy")'], "the copy of the copy is selected");
  assert.equal(steps(s), 3, "three duplicates, three steps");
});

test("TC-1: duplicating several siblings copies each after itself, its descendants' ids renamed too (C1, C2, C10, V1)", () => {
  const s = new DesignSession(doc());
  s.select([node(s, 'Text("Title")'), node(s, "HStack")]);
  const before = state(s);
  assert.equal(why(s.duplicate()), "applied");
  assert.equal(s.code("Main"), lines(
    "VStack {",
    '  Text("Title")',
    '  Text("Title")',
    '  Button("A").id("ok")',
    "  // the row",
    "  HStack {",
    '    Text("Left").id("left")',
    "  }",
    "  // the row",
    "  HStack {",
    '    Text("Left").id("left-copy")',
    "  }",
    "}",
  ));
  assert.deepEqual(selected(s), ['Text("Title")', "HStack {"]);
  assert.equal(s.selection[0], node(s, 'Text("Title")', 1), "the copy, not the original");
  assert.equal(s.selection[1], node(s, "HStack", 1));
  assert.equal(steps(s), 1, "one step");
  roundTrip(s, before);
});

test("TC-1: copy returns the selected nodes' code at column 0, joined by line feeds (C3)", () => {
  const s = new DesignSession(doc());
  assert.equal(s.copy(), "", "nothing selected, nothing copied");
  s.select([node(s, "HStack")]);
  assert.equal(s.copy(), '// the row\nHStack {\n  Text("Left").id("left")\n}');
  s.select([node(s, "HStack"), node(s, 'Text("Title")')]);
  assert.equal(s.copy(), 'Text("Title")\n// the row\nHStack {\n  Text("Left").id("left")\n}', "in source order");
  assert.equal(s.canUndo, false, "copy changes nothing");
});

test("TC-1: cut removes the selection as one step, and paste puts it into a stack, after a leaf, or at the end (C4, C5, C10)", () => {
  const s = new DesignSession(doc());
  s.select([node(s, 'Button("A")')]);
  let before = state(s);
  const cut = s.cut();
  assert.ok(!("error" in cut), why(cut));
  if ("error" in cut) return;
  assert.equal(cut.text, 'Button("A").id("ok")');
  assert.equal(s.code("Main"), lines(
    "VStack {",
    '  Text("Title")',
    "  // the row",
    "  HStack {",
    '    Text("Left").id("left")',
    "  }",
    "}",
  ));
  assert.deepEqual(selected(s), ["HStack {"], "the next sibling, as delete selects");
  roundTrip(s, before);

  // One stack selected: its role accepts a button, so the button becomes its last child, id kept.
  before = state(s);
  assert.equal(why(s.paste(cut.text)), "applied");
  assert.equal(s.code("Main"), lines(
    "VStack {",
    '  Text("Title")',
    "  // the row",
    "  HStack {",
    '    Text("Left").id("left")',
    '    Button("A").id("ok")',
    "  }",
    "}",
  ));
  assert.deepEqual(selected(s), ['Button("A").id("ok")'], "the pasted view is selected");
  roundTrip(s, before);

  // A leaf selected: after it; "ok" is taken now, so the pasted copy is ok-copy.
  s.select([node(s, 'Text("Title")')]);
  before = state(s);
  assert.equal(why(s.paste(cut.text)), "applied");
  assert.equal(s.code("Main"), lines(
    "VStack {",
    '  Text("Title")',
    '  Button("A").id("ok-copy")',
    "  // the row",
    "  HStack {",
    '    Text("Left").id("left")',
    '    Button("A").id("ok")',
    "  }",
    "}",
  ));
  roundTrip(s, before);

  // Nothing selected: at the end of the mockup's root.
  s.select([]);
  before = state(s);
  assert.equal(why(s.paste(cut.text)), "applied");
  assert.equal(s.code("Main"), lines(
    "VStack {",
    '  Text("Title")',
    '  Button("A").id("ok-copy")',
    "  // the row",
    "  HStack {",
    '    Text("Left").id("left")',
    '    Button("A").id("ok")',
    "  }",
    "}",
    'Button("A").id("ok-copy-2")',
  ));
  roundTrip(s, before);
  assert.equal(steps(s), 4, "the cut and three pastes");
});

test("TC-1: paste of several views goes after the last of several selected nodes, in order, as one step (C5, C10)", () => {
  const s = new DesignSession(doc());
  s.select([node(s, 'Text("Title")'), node(s, 'Button("A")')]);
  const before = state(s);
  assert.equal(why(s.paste('Text("x")\n// why\nText("y")\n')), "applied");
  assert.equal(s.code("Main"), lines(
    "VStack {",
    '  Text("Title")',
    '  Button("A").id("ok")',
    '  Text("x")',
    "  // why",
    '  Text("y")',
    "  // the row",
    "  HStack {",
    '    Text("Left").id("left")',
    "  }",
    "}",
  ));
  assert.deepEqual(selected(s), ['Text("x")', 'Text("y")']);
  assert.equal(steps(s), 1);
  roundTrip(s, before);
});

test("TC-1: a paste that does not parse as views is refused with the syntax diagnostic and records no step (C6)", () => {
  const s = new DesignSession(doc());
  const seen = recorder(s);
  const r = s.paste('Button("A"');
  assert.ok("error" in r, "refused");
  if (!("error" in r)) return;
  assert.ok(r.diagnostics.length > 0 && r.diagnostics[0]!.severity === "error", "with the syntax diagnostic");
  for (const text of ["let a = 1", "", "struct Row: View {\n  var body: some View {\n    Text(\"r\")\n  }\n}"]) {
    assert.ok("error" in s.paste(text), `${JSON.stringify(text)} holds no views to paste`);
  }
  assert.equal(s.code("Main"), MAIN);
  assert.equal(s.canUndo, false, "no step");
  assert.equal(seen.length, 0, "nothing notified");
});

test("TC-1: moveUp and moveDown move the selection one position; at the first or last position nothing, and no step (C7, C10)", () => {
  const s = new DesignSession(doc());
  const title = node(s, 'Text("Title")');
  s.select([title]);
  const up = s.moveUp();
  assert.ok(!("error" in up) && up.edits.length === 0, "the first position: nothing");
  assert.equal(s.canUndo, false, "and no step");
  s.select([node(s, "HStack")]);
  const down = s.moveDown();
  assert.ok(!("error" in down) && down.edits.length === 0, "the last position: nothing");
  assert.equal(s.canUndo, false);

  s.select([title]);
  let before = state(s);
  assert.equal(why(s.moveDown()), "applied");
  assert.equal(s.code("Main"), lines(
    "VStack {",
    '  Button("A").id("ok")',
    '  Text("Title")',
    "  // the row",
    "  HStack {",
    '    Text("Left").id("left")',
    "  }",
    "}",
  ));
  assert.deepEqual([...s.selection], [title], "the moved node keeps its id and stays selected");
  roundTrip(s, before);
  s.moveUp();
  assert.equal(s.code("Main"), MAIN);

  // Two siblings each move one position up, as one step.
  s.select([node(s, 'Button("A")'), node(s, "HStack")]);
  before = state(s);
  assert.equal(why(s.moveUp()), "applied");
  assert.equal(s.code("Main"), lines(
    "VStack {",
    '  Button("A").id("ok")',
    "  // the row",
    "  HStack {",
    '    Text("Left").id("left")',
    "  }",
    '  Text("Title")',
    "}",
  ));
  assert.deepEqual(selected(s), ['Button("A").id("ok")', "HStack {"]);
  roundTrip(s, before);
  assert.equal(steps(s), 3, "two moves of the title and one of the pair");
});

test("C8 (session): selectRange selects the siblings from the selection's first node, toggleSelected adds or removes, a non-sibling replaces", () => {
  const s = new DesignSession(doc());
  const title = node(s, 'Text("Title")');
  const ok = node(s, 'Button("A")');
  const row = node(s, "HStack");
  const left = node(s, 'Text("Left")');
  assert.deepEqual(s.selectRange(ok), { selection: [ok] }, "no selection: the clicked node");
  s.select([title]);
  assert.deepEqual(s.selectRange(row), { selection: [title, ok, row] }, "from the first to the clicked");
  assert.deepEqual(s.selectRange(ok), { selection: [title, ok] }, "the range is anchored at the first");
  s.select([row]);
  assert.deepEqual(s.selectRange(title), { selection: [row, ok, title] }, "upwards from the first");
  assert.deepEqual(s.selectRange(left), { selection: [left] }, "a non-sibling replaces the selection");
  s.select([title]);
  assert.deepEqual(s.toggleSelected(row), { selection: [title, row] }, "added");
  assert.deepEqual(s.toggleSelected(title), { selection: [row] }, "removed");
  assert.deepEqual(s.toggleSelected(left), { selection: [left] }, "a non-sibling replaces the selection");
  assert.deepEqual(s.toggleSelected(left), { selection: [] }, "the last one removed");
  assert.ok("error" in s.toggleSelected("nope"));
  assert.equal(s.canUndo, false, "selection is no step");
});

test("TC-1: duplicate and the moves are refused with nothing selected or for a node outside its parent's statement children (C12)", () => {
  const s = new DesignSession(doc());
  for (const command of ["duplicate", "moveUp", "moveDown", "cut"] as const) {
    assert.ok("error" in s[command](), `${command} with nothing selected`);
  }
  s.setCode("Main", 'Section(header: Text("H")) {\n  Text("Row")\n}\n');
  const before = steps(s);
  s.select([node(s, 'Text("H")')]);
  for (const command of ["duplicate", "moveUp", "moveDown"] as const) {
    const r = s[command]();
    assert.ok("error" in r && /not placed among its parent's children/.test(r.error), `${command} of an argument: ${why(r)}`);
  }
  assert.equal(s.code("Main"), 'Section(header: Text("H")) {\n  Text("Row")\n}\n');
  assert.equal(steps(s), before, "no step");
});
