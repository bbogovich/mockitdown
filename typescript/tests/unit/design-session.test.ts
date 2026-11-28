// R-EDIT-006 TC-1 (C1, C2, C3, C4, C5, C6, C9, C10): the design session of `mockitdown/design`, over a
// two-mockup document. The DOM events of the design-tool components (C7, C8, C11, TC-2) come with them.
import assert from "node:assert/strict";
import { test } from "node:test";
import { DESIGN_EVENTS, DesignSession, newDesign, readDesign, writeDesign, type DesignDocument, type DesignNotification } from "mockitdown/design";
import { setup } from "./helpers.js";

const core = setup();

const SIGN_IN = 'VStack {\n  Text("Welcome back")\n  Button("Sign in")\n}\n';
const INBOX = '// The inbox\nNavigationStack {\n  List {\n    Text("Ada")\n    Text("Grace")\n  }\n}\n';

function twoMockups(): DesignDocument {
  const d = newDesign("Mail");
  d.defaults = { pack: "fluent" };
  d.mockups.push({ name: "Sign in", x: 0, y: 0, code: SIGN_IN });
  d.mockups.push({ name: "Inbox", x: 600, y: 0, options: { pack: "mui" }, code: INBOX });
  return d;
}

function recorder(session: DesignSession): DesignNotification[] {
  const seen: DesignNotification[] = [];
  session.subscribe((n) => seen.push(n));
  return seen;
}

const why = (r: object): string => ("error" in r ? String(r.error) : "applied");
const kinds = (ns: readonly DesignNotification[]): string[] => ns.map((n) => n.kind);
const idOf = (s: DesignSession, ordinal: string): string => {
  const id = s.nodeFor(s.active!, ordinal);
  if (!id) assert.fail(ordinal);
  return id;
};

test("a session holds the document, the active mockup, the selection, the hover and a tree per mockup (C1, C2)", () => {
  const d = twoMockups();
  const s = new DesignSession(d);
  assert.equal(s.document, d);
  assert.equal(s.active, "Sign in", "the first mockup when the view names none");
  assert.deepEqual(s.selection, []);
  assert.equal(s.hovered, null);
  assert.deepEqual(s.tree("Sign in")!.nodes.map((n) => n.name), ["VStack", "Text", "Button"]);
  assert.deepEqual(s.tree("Inbox")!.nodes.map((n) => n.name), ["NavigationStack", "List", "Text", "Text"]);
  assert.deepEqual(s.diagnostics("Inbox"), []);
  assert.equal(s.tree("Nowhere"), null);
  d.view = { active: "Inbox" };
  assert.equal(new DesignSession(d).active, "Inbox", "the view's active mockup");
  assert.equal(new DesignSession(newDesign("Empty")).active, null);
});

test("apply of an insert and of a remove each notify one change whose edits give the code (C3, C4, C5, C6, V1)", () => {
  const s = new DesignSession(twoMockups());
  const seen = recorder(s);
  const original = s.code("Sign in")!;
  const vstack = idOf(s, "n1");
  const r1 = s.apply({ op: "insert", parent: vstack, index: 1, code: 'Image(systemName: "envelope")' });
  if (!("edits" in r1)) assert.fail(why(r1));
  const r2 = s.apply({ op: "remove", nodes: ["n4"] }); // Button, after the insert
  assert.ok("edits" in r2, why(r2));
  const changes = seen.filter((n) => n.kind === "change");
  assert.equal(changes.length, 2);
  // The insert is also told as an insert, with the new node and its element.
  const inserts = seen.filter((n) => n.kind === "insert");
  assert.equal(inserts.length, 1);
  assert.deepEqual(inserts[0].detail, { mockup: "Sign in", node: r1.tree.nodes[2].id, element: "Image" });
  assert.deepEqual(kinds(seen), ["change", "insert", "change"]);
  let code = original;
  for (const c of changes) {
    assert.equal(c.kind, "change");
    if (c.kind !== "change") continue;
    assert.equal(c.detail.kind, "code");
    assert.equal(c.detail.mockup, "Sign in");
    assert.ok(c.detail.edits.length > 0);
    code = core.applyEdits(code, c.detail.edits);
    assert.equal(code, c.detail.code);
  }
  assert.equal(code, s.code("Sign in"));
  assert.equal(code, 'VStack {\n  Text("Welcome back")\n  Image(systemName: "envelope")\n}\n');
  assert.equal(s.document.mockups[0].code, code, "the document holds the edited code");
  assert.equal(s.document.mockups[1].code, INBOX, "the other mockup is unchanged");
  assert.equal(s.tree("Sign in")!.source, code);
  assert.equal(s.nodeFor("Sign in", "n1"), vstack, "the tree from reparse keeps the ids");
});

test("one change notification however many text edits an operation makes (C6)", () => {
  const s = new DesignSession(twoMockups());
  s.setActive("Inbox");
  const seen = recorder(s);
  // Move both list rows out of the List into the NavigationStack: a removal and an insertion.
  const r = s.apply({ op: "move", nodes: ["n3", "n4"], parent: "n1", index: 0 });
  assert.ok("edits" in r && r.edits.length >= 2, why(r));
  assert.deepEqual(kinds(seen), ["change"]);
});

test("the selection keeps a surviving node and drops a removed one (C3)", () => {
  const s = new DesignSession(twoMockups());
  const text = idOf(s, "n2");
  const button = idOf(s, "n3");
  assert.ok("selection" in s.select([text, button]));
  const seen = recorder(s);
  const r = s.apply({ op: "remove", nodes: [button] });
  assert.ok("edits" in r);
  assert.deepEqual(s.selection, [text]);
  assert.deepEqual(kinds(seen), ["change", "select"]);
  assert.deepEqual(seen[1].detail, { mockup: "Sign in", nodes: [text] });
});

test("a refused operation changes nothing and notifies nothing (C3)", () => {
  const s = new DesignSession(twoMockups());
  const seen = recorder(s);
  const r = s.apply({ op: "remove", nodes: ["n9"] });
  assert.ok("error" in r);
  assert.equal(s.code("Sign in"), SIGN_IN);
  assert.deepEqual(seen, []);
});

test("a syntax error keeps the last valid tree and notifies diagnostics (C2, C4, C5)", () => {
  const s = new DesignSession(twoMockups());
  const before = s.tree("Sign in")!;
  const text = idOf(s, "n2");
  s.select([text]);
  const seen = recorder(s);
  const broken = 'VStack {\n  Text("Welcome back"\n  Button("Sign in")\n}\n';
  s.setCode("Sign in", broken);
  assert.equal(s.code("Sign in"), broken);
  assert.equal(s.tree("Sign in"), before, "the last valid tree");
  const diags = s.diagnostics("Sign in");
  assert.ok(diags.length > 0 && diags[0].severity === "error");
  assert.deepEqual(kinds(seen), ["change", "diagnostics"]);
  const change = seen[0];
  if (change.kind !== "change") assert.fail(change.kind);
  assert.equal(change.detail.kind, "code");
  assert.equal(core.applyEdits(SIGN_IN, change.detail.edits), broken);
  assert.deepEqual(seen[1].detail, { mockup: "Sign in", diagnostics: diags });
  // An operation on code that does not parse is refused.
  assert.ok("error" in s.apply({ op: "remove", nodes: ["n3"] }));
  // Fixed again: a new tree whose untouched nodes keep their ids, and diagnostics cleared.
  s.setCode("Sign in", SIGN_IN.replace("Welcome back", "Hello"));
  assert.notEqual(s.tree("Sign in"), before);
  assert.equal(s.nodeFor("Sign in", "n1"), before.nodes[0].id);
  assert.deepEqual(s.diagnostics("Sign in"), []);
  assert.deepEqual(kinds(seen), ["change", "diagnostics", "change", "diagnostics"]);
});

test("setting the same code notifies nothing (C4)", () => {
  const s = new DesignSession(twoMockups());
  const seen = recorder(s);
  s.setCode("Sign in", SIGN_IN);
  assert.deepEqual(seen, []);
});

test("nodeFor maps each ordinal of an edit-mode render to a node of the tree (C9)", () => {
  const s = new DesignSession(twoMockups());
  for (const name of ["Sign in", "Inbox"]) {
    const html = core.render(s.code(name)!, { ...s.options(name), edit: true }).html;
    const ordinals = [...html.matchAll(/data-mkd-node="(n[0-9]+)"/g)].map((m) => m[1]);
    assert.ok(ordinals.length >= 3, html);
    const tree = s.tree(name)!;
    for (const o of ordinals) {
      const id = s.nodeFor(name, o);
      if (!id) assert.fail(`${name} ${o}`);
      assert.equal(tree.byId(id)!.ordinal, o);
    }
  }
  assert.equal(s.nodeFor("Sign in", "n99"), null);
  assert.equal(s.nodeFor("Sign in", 2), s.tree("Sign in")!.nodes[1].id);
  assert.equal(s.nodeFor("Nowhere", "n1"), null);
});

test("select replaces the selection with siblings and refuses non-siblings (C4, C5, C10)", () => {
  const s = new DesignSession(twoMockups());
  s.setActive("Inbox");
  const seen = recorder(s);
  const [nav, list, ada, grace] = s.tree("Inbox")!.nodes.map((n) => n.id);
  const ok = s.select([ada, grace]);
  assert.deepEqual(ok, { selection: [ada, grace] });
  assert.deepEqual(seen.at(-1), { kind: "select", detail: { mockup: "Inbox", nodes: [ada, grace] } });
  const refused = s.select([list, ada]);
  if (!("error" in refused)) assert.fail("non-siblings selected");
  assert.match(refused.error, /not siblings/);
  assert.ok("error" in s.select([nav, "x99"]));
  assert.deepEqual(s.selection, [ada, grace], "a refused selection keeps the old one");
  s.select([list]);
  assert.deepEqual(s.selection, [list]);
  s.select([list]);
  s.select([]);
  assert.deepEqual(s.selection, []);
  assert.deepEqual(kinds(seen), ["select", "select", "select"], "no notification when the selection is the same");
});

test("hover and setActive notify their kinds; a new active mockup clears the selection (C1, C4, C5)", () => {
  const s = new DesignSession(twoMockups());
  const seen = recorder(s);
  const text = idOf(s, "n2");
  s.hover(text);
  s.hover(text);
  s.select([text]);
  assert.ok("error" in s.setActive("Nowhere"));
  s.setActive("Inbox");
  s.setActive("Inbox");
  assert.equal(s.active, "Inbox");
  assert.deepEqual(s.selection, []);
  assert.equal(s.hovered, null);
  assert.deepEqual(seen, [
    { kind: "hover", detail: { mockup: "Sign in", node: text } },
    { kind: "select", detail: { mockup: "Sign in", nodes: [text] } },
    { kind: "active", detail: { mockup: "Inbox" } },
    { kind: "select", detail: { mockup: "Inbox", nodes: [] } },
    { kind: "hover", detail: { mockup: "Inbox", node: null } },
  ]);
  assert.ok("error" in s.hover("x99"));
});

test("options and moves are changes of their own kind with no text edits (C5)", () => {
  const s = new DesignSession(twoMockups());
  const seen = recorder(s);
  s.setOptions("Inbox", { pack: "fluent", device: "phone" });
  s.moveMockup("Inbox", 640, 80);
  assert.deepEqual(seen.map((n) => (n.kind === "change" ? [n.detail.kind, n.detail.edits, n.detail.code] : n.kind)), [
    ["options", [], INBOX],
    ["move", [], INBOX],
  ]);
  const inbox = s.document.mockups[1];
  assert.deepEqual([inbox.x, inbox.y, inbox.options], [640, 80, { pack: "fluent", device: "phone" }]);
  assert.ok("error" in s.moveMockup("Inbox", Number.NaN, 0));
  assert.ok("error" in s.setOptions("Nowhere", {}));
});

test("unsubscribe stops the notifications; the document writes with every change applied (C4)", () => {
  const s = new DesignSession(twoMockups());
  const seen: DesignNotification[] = [];
  const off = s.subscribe((n) => seen.push(n));
  s.apply({ op: "remove", nodes: ["n3"] });
  off();
  s.apply({ op: "remove", nodes: ["n2"] });
  assert.equal(seen.length, 1);
  const back = readDesign(writeDesign(s.document));
  if (!("document" in back)) assert.fail("refused");
  assert.equal(back.document.mockups[0].code, "VStack {\n}\n");
});

test("diagnostics are those of check with the mockup's options; DESIGN_EVENTS names the DOM events (C17, C18)", () => {
  const d = twoMockups();
  d.mockups[1].code = 'Text("a").frobnicate()\n';
  const s = new DesignSession(d);
  assert.deepEqual(s.diagnostics("Inbox").map(String), core.check(d.mockups[1].code, s.options("Inbox")).map(String));
  assert.ok(s.diagnostics("Inbox").length > 0, "an unknown modifier is reported");
  assert.deepEqual(DESIGN_EVENTS, {
    select: "mockitdown-select", change: "mockitdown-change", insert: "mockitdown-insert",
    rename: "mockitdown-rename", diagnostics: "mockitdown-diagnostics",
  });
});

// R-TOOL-003.C11 (TC-1, the session's part): `session.delete()`, the command behind Delete and
// Backspace in the composite designer. The expected codes and selections were written by hand from
// R-EDIT-002.C6, C7 and C25 and the rule of C11 (next sibling, else previous sibling, else parent).
const NESTED = 'VStack {\n  Text("a")\n  HStack {\n    Text("b")\n    Text("c")\n  }\n  Text("d")\n}\n';

function deleting(selection: string[]): { s: DesignSession; seen: DesignNotification[]; result: object; ids: Map<string, string> } {
  const d = newDesign("Nested");
  d.mockups.push({ name: "Nested", x: 0, y: 0, code: NESTED });
  const s = new DesignSession(d);
  const ids = new Map(["n1", "n2", "n3", "n4", "n5", "n6"].map((o) => [o, idOf(s, o)]));
  if (selection.length) assert.equal(why(s.select(selection.map((o) => ids.get(o)!))), "applied");
  const seen = recorder(s);
  return { s, seen, result: s.delete(), ids };
}

test("delete removes the selection as one change, then selects the next sibling, else the previous, else the parent (R-TOOL-003.C11)", () => {
  const changeAndSelect = (ns: readonly DesignNotification[]) => kinds(ns).filter((k) => k === "change" || k === "select");

  const hstack = deleting(["n3"]);
  assert.equal(why(hstack.result), "applied");
  assert.equal(hstack.s.code("Nested"), 'VStack {\n  Text("a")\n  Text("d")\n}\n');
  assert.deepEqual(changeAndSelect(hstack.seen), ["change", "select"], "one change, then one select");
  assert.deepEqual(hstack.s.selection, [hstack.ids.get("n6")], "the next sibling, Text(\"d\")");
  const select = hstack.seen.find((n) => n.kind === "select")!;
  assert.deepEqual(select.detail, { mockup: "Nested", nodes: [hstack.ids.get("n6")] });

  const lastChild = deleting(["n6"]);
  assert.equal(lastChild.s.code("Nested"), 'VStack {\n  Text("a")\n  HStack {\n    Text("b")\n    Text("c")\n  }\n}\n');
  assert.deepEqual(lastChild.s.selection, [lastChild.ids.get("n3")], "no next sibling: the previous one, the HStack");

  const both = deleting(["n4", "n5"]);
  assert.equal(both.s.code("Nested"), 'VStack {\n  Text("a")\n  HStack {\n  }\n  Text("d")\n}\n');
  assert.deepEqual(both.s.selection, [both.ids.get("n3")], "every sibling deleted: the parent");
  assert.deepEqual(changeAndSelect(both.seen), ["change", "select"]);

  const root = deleting(["n1"]);
  assert.equal(root.s.code("Nested"), "");
  assert.deepEqual(root.s.selection, [], "a top-level node without siblings leaves nothing selected");
  assert.deepEqual(changeAndSelect(root.seen), ["change", "select"]);

  const none = deleting([]);
  assert.equal(why(none.result), "nothing is selected");
  assert.deepEqual(none.seen, [], "a refused delete notifies nothing");
  assert.equal(none.s.code("Nested"), NESTED);
});
