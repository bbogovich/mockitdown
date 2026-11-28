// R-EDIT-002 TC-2 (C3, C8, C9, C14): refusals and node ids of the edit API, and the as-built rules
// the corpus does not reach (names by id and by number, a tree as input, the indentation unit).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { setup } from "./helpers.js";

const core = setup();
const { edit, indentUnit, parseTree } = core;
type Op = Parameters<typeof edit>[1];
type Result = ReturnType<typeof edit>;
type Applied = Exclude<Result, { error: string }>;
type Refused = Extract<Result, { error: string }>;

function applied(r: Result): Applied {
  if ("error" in r) assert.fail(r.error);
  return r;
}

function refusal(r: Result): Refused {
  if (!("error" in r)) assert.fail("the operation was applied");
  return r;
}

const SOURCE = `VStack {
    Text("Title")
        .bold()
    HStack {
        Image(systemName: "star")
        Text("Rated")
    }
    Button("OK")
}
`;

function refused(source: string, op: Op): string {
  const r = refusal(edit(source, op));
  assert.equal("edits" in r, false, "no edits");
  assert.ok(r.error.length > 0);
  return r.error;
}

describe("R-EDIT-002 TC-2: refusals and ids", () => {
  it("refuses a node that does not exist or is a modifier call (C3)", () => {
    // n1 VStack, n2 Text, n3 HStack, …: `.bold()` has no ordinal of its own.
    const t = parseTree(SOURCE).tree!;
    assert.deepEqual(t.nodes.map((n) => n.name), ["VStack", "Text", "HStack", "Image", "Text", "Button"]);
    assert.match(refused(SOURCE, { op: "remove", nodes: ["n7"] }), /n7 is not a view node/);
    assert.match(refused(SOURCE, { op: "remove", nodes: ["id42"] }), /id42 is not a view node/);
    assert.match(refused(SOURCE, { op: "remove", nodes: ["bold"] }), /bold is not a view node/);
    assert.match(refused(SOURCE, { op: "insert", parent: 0, index: 0, code: "Divider()" }), /0 is not a view node/);
  });

  it("names nodes by id, by ordinal and by number (C3)", () => {
    const t = parseTree(SOURCE).tree!;
    const button = t.byOrdinal("n6")!;
    for (const ref of [button.id, "n6", 6]) {
      const r = applied(edit(t, { op: "remove", nodes: [ref] }));
      assert.equal(r.source, SOURCE.replace('    Button("OK")\n', ""));
    }
  });

  it("refuses a move into a moved node or into one of its descendants (C9)", () => {
    assert.match(refused(SOURCE, { op: "move", nodes: ["n3"], parent: "n3", index: 0 }), /into itself/);
    assert.match(refused(SOURCE, { op: "move", nodes: ["n3"], parent: "n4", index: 0 }), /one of its descendants/);
    assert.match(refused(SOURCE, { op: "move", nodes: ["n2", "n3"], parent: "n5", index: 0 }), /n3 into n5/);
  });

  it("refuses code that is two views or does not parse, with the syntax diagnostic (C14)", () => {
    assert.match(refused(SOURCE, { op: "insert", parent: "n1", index: 0, code: 'Text("a"); Text("b")' }), /2 statements/);
    const r = refusal(edit(SOURCE, { op: "insert", parent: "n1", index: 0, code: 'Text("a"' }));
    assert.equal(r.diagnostics.length, 1);
    assert.equal(r.diagnostics[0].code, "syntax");
    assert.ok(r.error.includes(r.diagnostics[0].message), r.error);
    assert.match(refused(SOURCE, { op: "insert", parent: "n1", index: 0, code: "import SwiftUI" }), /not an import/);
  });

  it("keeps the ids of moved nodes and their descendants, and of every untouched node (C8)", () => {
    const t = parseTree(SOURCE).tree!;
    const ids = new Map(t.nodes.map((n) => [n.ordinal, n.id]));
    // Move the HStack (n3, with n4 and n5) to the end, after the Button.
    const r = applied(edit(t, { op: "move", nodes: ["n3"], parent: "n1", index: "end" }));
    const after = r.tree.nodes.map((n) => `${n.name}:${n.id}`);
    assert.deepEqual(after, ["VStack", "Text", "Button", "HStack", "Image", "Text"].map((name, i) =>
      `${name}:${ids.get(["n1", "n2", "n6", "n3", "n4", "n5"][i])}`));
    // A move between parents keeps them too; the tree continues the input tree's ids.
    const r2 = applied(edit(r.tree, { op: "move", nodes: [ids.get("n2")!], parent: ids.get("n3")!, index: 0 }));
    assert.equal(r2.tree.byId(ids.get("n2")!)!.parent!.id, ids.get("n3"));
    assert.deepEqual(new Set(r2.tree.nodes.map((n) => n.id)), new Set(ids.values()));
  });

  it("gives inserted nodes new ids and keeps every other id (C1)", () => {
    const t = parseTree(SOURCE).tree!;
    const r = applied(edit(t, { op: "insert", parent: "n3", index: 1, code: 'VStack {\n    Text("x")\n}' }));
    const old = new Set(t.nodes.map((n) => n.id));
    const fresh = r.tree.nodes.filter((n) => !old.has(n.id)).map((n) => n.name);
    assert.deepEqual(fresh, ["VStack", "Text"]);
    assert.equal(r.tree.nodes.length, t.nodes.length + 2);
  });

  it("refuses an unparsable source with its diagnostic", () => {
    const r = refusal(edit("VStack {\n", { op: "remove", nodes: ["n1"] }));
    assert.match(r.error, /^the source does not parse: /);
    assert.equal(r.diagnostics[0].code, "syntax");
  });

  it("takes the indentation unit from the smallest step, else four spaces (C11)", () => {
    assert.equal(indentUnit('VStack {\n  HStack {\n      Text("a")\n  }\n}\n'), "  ");
    assert.equal(indentUnit('VStack {\n   Text("a")\n}\n'), "   ");
    assert.equal(indentUnit('Text("a")\n'), "    ");
    assert.equal(indentUnit('VStack {\n\tText("a")\n}\n'), "\t");
  });

  it("refuses a parent with only labelled trailing closures, and an out-of-range index", () => {
    assert.match(refused('Banner("x") actions: {\n    Button("Undo")\n}\n', { op: "insert", parent: "n1", index: 0, code: "Divider()" }),
      /only labelled trailing closures/);
    assert.match(refused(SOURCE, { op: "insert", parent: "n3", index: 3, code: "Divider()" }), /0 to 2, or "end"/);
    assert.match(refused(SOURCE, { op: "insert", parent: "n3", index: -1, code: "Divider()" }), /out of range/);
  });
});
