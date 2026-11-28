// IT-65: the restructuring commands of the design session (R-EDIT-009). TC-1 (C1-C7, C10, C11, C12):
// wrap, unwrap, convert and extract component, with their refusals, each one step that undoes to the
// original with the selection restored and renders without a new diagnostic (V1). TC-2 (C8): the
// command list a host builds its menus from, and `run`.
// Every expected code below is written by hand from the clauses before the commands ran: the start
// mockup with the lines each command adds, removes or moves, children indented as the edit corpus
// prints them (the parent's first child's indentation, else the parent's plus the file's unit).
import assert from "node:assert/strict";
import { test } from "node:test";
import { DesignSession, newDesign, type DesignDocument } from "mockitdown/design";
import { setup } from "./helpers.js";

setup();

const lines = (...ls: string[]): string => [...ls, ""].join("\n");
const why = (r: object): string => ("error" in r ? String((r as { error: unknown }).error) : "applied");

function session(code: string, pack = "base"): DesignSession {
  const d: DesignDocument = newDesign("Restructure");
  d.defaults = { pack };
  d.mockups.push({ name: "Main", x: 0, y: 0, code });
  return new DesignSession(d);
}

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
    const end = tree.source.indexOf("\n", n.first);
    return tree.source.slice(n.first, end < 0 ? undefined : end);
  });
}

const state = (s: DesignSession) => ({ code: s.code("Main")!, selection: [...s.selection] });
const messages = (s: DesignSession): string[] => s.diagnostics("Main").map((d) => d.message);

/** One step: undo gives back the code and selection from before, redo those from after (C10, V1). */
function oneStep(s: DesignSession, before: { code: string; selection: string[] }): void {
  const after = state(s);
  let n = 0;
  const off = s.subscribe((x) => {
    if (x.kind === "change") n++;
  });
  assert.ok(!("error" in s.undo()));
  assert.equal(s.code("Main"), before.code, "undo gives back the original code");
  assert.deepEqual([...s.selection], before.selection, "undo gives back the selection before the command");
  assert.equal(s.canUndo, false, "the command was one step");
  assert.ok(!("error" in s.redo()));
  assert.equal(s.code("Main"), after.code);
  assert.deepEqual([...s.selection], after.selection, "redo gives back the selection after the command");
  assert.equal(n, 2);
  off();
}

/** A refused command changes nothing and records no step. */
function refused(s: DesignSession, r: object, reason: RegExp): void {
  const code = s.code("Main");
  assert.match(why(r), reason);
  assert.equal(s.code("Main"), code);
  assert.equal(s.canUndo, false, "no step");
}

const BUTTONS = lines(
  "VStack {",
  '  Text("Title")',
  '  Button("A").id("a")',
  '  Button("B").id("b")',
  "}",
);

const WRAPPED = lines(
  "VStack {",
  '  Text("Title")',
  "  HStack {",
  '    Button("A").id("a")',
  '    Button("B").id("b")',
  "  }",
  "}",
);

test("TC-1: wrap puts the selected siblings into one new call at the first one's place and selects it (C1, C10, V1)", () => {
  const s = session(BUTTONS);
  const a = node(s, 'Button("A")');
  const b = node(s, 'Button("B")');
  s.select([b, a]);
  const before = state(s);
  const diags = messages(s);
  assert.equal(why(s.wrap("HStack")), "applied");
  assert.equal(s.code("Main"), WRAPPED);
  assert.deepEqual(selected(s), ["HStack {"]);
  assert.equal(node(s, 'Button("A")'), a, "the wrapped nodes keep their ids");
  assert.deepEqual(messages(s), diags, "no new diagnostic");
  oneStep(s, before);
});

test("TC-1: wrap is refused, naming the rule, when the parent cannot hold the new call or it cannot hold a node (C2)", () => {
  const split = session(lines(
    "NavigationSplitView {",
    '  List { Text("Inbox") }',
    "} detail: {",
    '  Text("Detail")',
    "}",
  ));
  split.select([node(split, "NavigationSplitView")]);
  refused(split, split.wrap("VStack"), /^A frame cannot be placed inside a vertical stack$/);

  const s = session(BUTTONS);
  s.select([node(s, 'Button("A")')]);
  refused(s, s.wrap("Text"), /^A text cannot hold other elements$/);
  refused(s, s.wrap("List"), /^A content element cannot be placed inside a list$/);
  refused(s, s.wrap("stack"), /not an element name/);
  s.select([]);
  refused(s, s.wrap("HStack"), /^nothing is selected$/);
});

test("TC-1: unwrap replaces a container by its children, its arguments and modifiers with it, and selects them (C3, C10, V1)", () => {
  const s = session(lines(
    "VStack {",
    '  Text("Title")',
    "  HStack(spacing: 4) {",
    '    Button("A").id("a")',
    '    Button("B").id("b")',
    '  }.padding().id("row")',
    "}",
  ));
  s.select([node(s, "HStack")]);
  const before = state(s);
  const diags = messages(s);
  assert.equal(why(s.unwrap()), "applied");
  assert.equal(s.code("Main"), BUTTONS);
  assert.deepEqual(selected(s), ['Button("A").id("a")', 'Button("B").id("b")']);
  assert.deepEqual(messages(s), diags);
  oneStep(s, before);

  // Wrap then unwrap gives back the original.
  const w = session(BUTTONS);
  w.select([node(w, 'Button("A")'), node(w, 'Button("B")')]);
  w.wrap("HStack");
  assert.equal(why(w.unwrap()), "applied");
  assert.equal(w.code("Main"), BUTTONS);
});

test("TC-1: unwrap is refused for a leaf, when the parent cannot hold a child, and for content with a parameter or a let (C3, C11)", () => {
  const s = session(BUTTONS);
  s.select([node(s, 'Text("Title")')]);
  refused(s, s.unwrap(), /^Text has no children to unwrap$/);

  const grid = session(lines(
    "Grid {",
    "  GridRow {",
    '    Text("a")',
    "  }",
    "}",
  ));
  grid.select([node(grid, "GridRow")]);
  refused(grid, grid.unwrap(), /^A content element cannot be placed inside a grid$/);

  const each = session(lines(
    'let items = ["a", "b"]',
    "VStack {",
    "  ForEach(items) { item in",
    "    Text(item)",
    "  }",
    "}",
  ));
  each.select([node(each, "ForEach")]);
  refused(each, each.unwrap(), /^ForEach declares the parameter item for its children/);

  const local = session(lines(
    "VStack {",
    '  let name = "Ada"',
    "  Text(name)",
    "}",
  ));
  local.select([node(local, "VStack")]);
  refused(local, local.unwrap(), /^VStack declares a let for its children/);
});

test("TC-1: convert renames the element to one of the same role, keeping what the new one understands (C4, C5, C10, V1)", () => {
  const start = lines(
    "VStack {",
    '  Button("Save", role: .destructive, bogus: 1).id("save")',
    '  Button("Go", "extra") {}',
    "}",
  );
  const s = session(start, "vuetify");
  s.select([node(s, 'Button("Save"')]);
  const before = state(s);
  assert.deepEqual(messages(s), ["'bogus' is not understood by Button in pack 'vuetify'"]);
  assert.equal(why(s.convert("VBtn")), "applied");
  const converted = lines(
    "VStack {",
    '  VBtn("Save", role: .destructive).id("save")',
    '  Button("Go", "extra") {}',
    "}",
  );
  assert.equal(s.code("Main"), converted);
  assert.deepEqual(selected(s), ['VBtn("Save", role: .destructive).id("save")'], "the converted node is selected");
  assert.deepEqual(messages(s), [], "no new diagnostic (and bogus is gone)");
  oneStep(s, before);

  // A positional argument past the new element's params (VBtn has one) goes; the closure stays.
  s.select([node(s, 'Button("Go"')]);
  assert.equal(why(s.convert("VBtn")), "applied");
  assert.equal(s.code("Main"), lines(
    "VStack {",
    '  VBtn("Save", role: .destructive).id("save")',
    '  VBtn("Go") {}',
    "}",
  ));
});

test("TC-1: convert is refused to an element of another role, to a name the pack does not define, and with no single node (C4)", () => {
  const s = session(BUTTONS);
  s.select([node(s, 'Button("A")')]);
  refused(s, s.convert("Text"), /^Button is a button and Text a text in pack 'base': convert keeps the role$/);
  refused(s, s.convert("Nope"), /^Nope is not an element of pack 'base'$/);
  s.select([node(s, 'Button("A")'), node(s, 'Button("B")')]);
  refused(s, s.convert("IconButton"), /^convert needs one selected node$/);
});

const CARD = lines(
  "VStack {",
  '  Text("Orders")',
  "  // the card",
  "  VStack {",
  '    Text("Order 1")',
  '    Button("Open")',
  "  }",
  "}",
);

test("TC-1: extract component declares the struct before the first view and calls it in the selection's place (C6, C10, V1)", () => {
  const s = session(CARD);
  s.select([node(s, "VStack", 1)]);
  const before = state(s);
  const diags = messages(s);
  assert.equal(why(s.extractComponent("OrderCard")), "applied");
  assert.equal(s.code("Main"), lines(
    "struct OrderCard: View {",
    "  var body: some View {",
    "    // the card",
    "    VStack {",
    '      Text("Order 1")',
    '      Button("Open")',
    "    }",
    "  }",
    "}",
    "",
    "VStack {",
    '  Text("Orders")',
    "  OrderCard()",
    "}",
  ));
  assert.deepEqual(selected(s), ["OrderCard()"]);
  assert.deepEqual(messages(s), diags, "no new diagnostic, and no self-embedding struct");
  oneStep(s, before);
});

test("TC-1: extract component goes after the last struct, with several nodes in order (C6)", () => {
  const s = session(lines(
    "import SwiftUI",
    "",
    "struct Header: View {",
    "  var body: some View {",
    '    Text("Head")',
    "  }",
    "}",
    "",
    "VStack {",
    "  Header()",
    '  Text("One")',
    '  Text("Two")',
    "}",
  ));
  s.select([node(s, 'Text("Two")'), node(s, 'Text("One")')]);
  const diags = messages(s);
  assert.equal(why(s.extractComponent("Lines")), "applied");
  assert.equal(s.code("Main"), lines(
    "import SwiftUI",
    "",
    "struct Header: View {",
    "  var body: some View {",
    '    Text("Head")',
    "  }",
    "}",
    "",
    "struct Lines: View {",
    "  var body: some View {",
    '    Text("One")',
    '    Text("Two")',
    "  }",
    "}",
    "",
    "VStack {",
    "  Header()",
    "  Lines()",
    "}",
  ));
  assert.deepEqual(messages(s), diags);
});

test("TC-1: extract component is refused for a taken or invalid name and for a selection using a binding from outside it (C7, C12)", () => {
  const s = session(lines(
    "struct Header: View {",
    "  var body: some View {",
    '    Text("Head")',
    "  }",
    "}",
    "",
    'let items = ["a", "b"]',
    "VStack {",
    "  Header()",
    "  ForEach(items) { item in",
    "    Text(item)",
    "  }",
    '  Text("Plain")',
    "  OrderCard()",
    "}",
  ));
  s.select([node(s, 'Text("Plain")')]);
  refused(s, s.extractComponent("Header"), /^Header is already a struct of this mockup$/);
  refused(s, s.extractComponent("Button"), /^Button is an element of pack 'base'$/);
  refused(s, s.extractComponent("card"), /^"card" is not a component name: an identifier beginning with an uppercase letter$/);
  refused(s, s.extractComponent("OrderCard"), /^the mockup already uses OrderCard, so the struct would change what it shows$/);
  s.select([node(s, "Text(item)")]);
  refused(s, s.extractComponent("ItemRow"), /^the selection uses item, declared outside it$/);
  s.select([node(s, "ForEach")]);
  refused(s, s.extractComponent("ItemRows"), /^the selection uses items, declared outside it$/);
  s.select([]);
  refused(s, s.extractComponent("ItemRows"), /^nothing is selected$/);
});

test("TC-2: session.commands lists the eighteen commands with labels, shortcuts and whether each is enabled (C8)", () => {
  const s = session(BUTTONS);
  const names = s.commands.map((c) => c.name);
  assert.deepEqual(names, ["delete", "duplicate", "cut", "copy", "paste", "moveUp", "moveDown", "wrap", "unwrap", "convert", "extractComponent", "newMockup", "duplicateMockup", "deleteMockup", "newSection", "deleteSection", "undo", "redo"]);
  assert.deepEqual(s.commands.map((c) => [c.label, c.shortcut]), [
    ["Delete", "Delete"], ["Duplicate", "Mod+D"], ["Cut", "Mod+X"], ["Copy", "Mod+C"], ["Paste", "Mod+V"],
    ["Move Up", "Alt+ArrowUp"], ["Move Down", "Alt+ArrowDown"], ["Wrap in Stack", "Mod+G"], ["Unwrap", "Mod+Shift+G"],
    ["Convert To…", null], ["Extract Component…", null], ["New Mockup", null], ["Duplicate Mockup", null], ["Delete Mockup", null],
    ["New Section", null], ["Delete Section", null],
    ["Undo", "Mod+Z"], ["Redo", "Mod+Shift+Z"],
  ]);
  const enabled = () => Object.fromEntries(s.commands.map((c) => [c.name, c.enabled]));
  assert.deepEqual(enabled(), {
    delete: false, duplicate: false, cut: false, copy: false, paste: true, moveUp: false, moveDown: false,
    wrap: false, unwrap: false, convert: false, extractComponent: false,
    newMockup: true, duplicateMockup: true, deleteMockup: true, newSection: true, deleteSection: false, undo: false, redo: false,
  }, "nothing selected");
  s.select([node(s, 'Text("Title")')]);
  assert.deepEqual(enabled(), {
    delete: true, duplicate: true, cut: true, copy: true, paste: true, moveUp: false, moveDown: true,
    wrap: true, unwrap: false, convert: true, extractComponent: true,
    newMockup: true, duplicateMockup: true, deleteMockup: true, newSection: true, deleteSection: false, undo: false, redo: false,
  }, "a leaf at the first position");
  s.select([node(s, "VStack")]);
  assert.equal(enabled().unwrap, true, "a container");
  s.duplicate();
  assert.equal(enabled().undo, true);
});

test("TC-2: session.run runs a command by name with its arguments, as the method does (C8)", () => {
  const a = session(BUTTONS);
  const b = session(BUTTONS);
  for (const s of [a, b]) s.select([node(s, 'Button("A")'), node(s, 'Button("B")')]);
  assert.equal(why(a.run("wrap", { name: "VStack" })), "applied");
  assert.equal(why(b.wrap("VStack")), "applied");
  assert.equal(a.code("Main"), b.code("Main"));
  assert.equal(a.code("Main"), WRAPPED.replace("HStack", "VStack"));
  assert.equal(why(a.run("undo")), "applied");
  assert.equal(a.code("Main"), BUTTONS);
  assert.equal(typeof (a.run("copy") as { text: string }).text, "string");
  assert.match(why(a.run("nope")), /^unknown command "nope"/);
  assert.match(why(a.run("wrap", {})), /not an element name/);
});
