// R-EDIT-003 TC-2 (C9): a duplicate identifier is refused; and the as-built rules the corpus does not
// reach: which nodes keep their ids, the refusals' messages and diagnostics, and names by id.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { setup } from "./helpers.js";

const core = setup();
const { edit, parseTree } = core;
type Op = Parameters<typeof edit>[1];
type Result = ReturnType<typeof edit>;
type Applied = Exclude<Result, { error: string }>;
type Refused = Extract<Result, { error: string }>;

function applied(r: Result): Applied {
  if ("error" in r) assert.fail(r.error);
  return r;
}

function refused(source: string, op: Op): Refused {
  const r = edit(source, op);
  if (!("error" in r)) assert.fail("the operation was applied");
  assert.equal("edits" in r, false, "no edits");
  return r;
}

const SOURCE = `VStack {
    Button("Save").id("save")
    Button("Cancel")
    Text("Note")
        .font(.footnote)
}
`;

describe("R-EDIT-003 TC-2: duplicate identifiers", () => {
  it("refuses an identifier another node carries, naming it, with no edits (C9)", () => {
    const r = refused(SOURCE, { op: "rename", node: "n3", id: "save" });
    assert.match(r.error, /"save"/);
    assert.match(r.error, /already used by n2/);
    assert.deepEqual(r.diagnostics, []);
  });

  it("accepts a node's own identifier and an unused one (C8)", () => {
    assert.equal(applied(edit(SOURCE, { op: "rename", node: "n2", id: "save" })).source, SOURCE);
    assert.equal(applied(edit(SOURCE, { op: "rename", node: "n3", id: "cancel" })).source,
      SOURCE.replace('Button("Cancel")', 'Button("Cancel").id("cancel")'));
  });

  it("writes an identifier as a string literal the lexer reads back", () => {
    const r = applied(edit(SOURCE, { op: "rename", node: "n3", id: 'a "quoted" \\ id' }));
    assert.ok(r.source.includes('.id("a \\"quoted\\" \\\\ id")'), r.source);
    const again = refused(r.source, { op: "rename", node: "n2", id: 'a "quoted" \\ id' });
    assert.match(again.error, /already used by n3/);
  });
});

describe("R-EDIT-003: ids and refusals as built", () => {
  it("keeps every node's id across argument, modifier, identifier and comment edits", () => {
    const t = parseTree(SOURCE).tree!;
    const ids = t.nodes.map((n) => n.id);
    const ops: Op[] = [
      { op: "setArgument", node: "n3", label: "role", value: ".cancel" },
      { op: "setModifier", node: "n4", name: "font", args: null },
      { op: "rename", node: "n3", id: "cancel" },
      { op: "setRefs", node: "n2", refs: ["R-A"] },
      { op: "setComment", node: "n4", text: "a note" },
    ];
    for (const op of ops) assert.deepEqual(applied(edit(t, op)).tree.nodes.map((n) => n.id), ids, op.op);
  });

  it("gives a renamed element a new id, as reparse does for an edited name (R-EDIT-001.C10)", () => {
    const t = parseTree(SOURCE).tree!;
    const r = applied(edit(t, { op: "setName", node: "n3", name: "Link" }));
    assert.notEqual(r.tree.byOrdinal("n3")!.id, t.byOrdinal("n3")!.id);
    assert.equal(r.tree.byOrdinal("n2")!.id, t.byOrdinal("n2")!.id);
  });

  it("names nodes by id as well as by ordinal", () => {
    const t = parseTree(SOURCE).tree!;
    const r = applied(edit(t, { op: "setModifier", node: t.byOrdinal("n3")!.id, name: "bold", args: "" }));
    assert.ok(r.source.includes('Button("Cancel").bold()'));
  });

  it("refuses a value or modifier arguments that do not parse, with the diagnostic counted from the given code", () => {
    const r = refused(SOURCE, { op: "setArgument", node: "n3", label: "role", value: '"open' });
    assert.equal(r.diagnostics.length, 1);
    assert.equal(r.diagnostics[0].code, "syntax");
    assert.equal(r.diagnostics[0].location.line, 1);
    assert.ok(r.diagnostics[0].location.col <= '"open'.length + 1);
    assert.match(refused(SOURCE, { op: "setModifier", node: "n3", name: "padding", args: "8) .x(" }).error,
      /not an argument list/);
    assert.match(refused(SOURCE, { op: "setArgument", node: "n3", label: "x", value: "1, 2" }).error, /not one argument value/);
  });

  it("refuses a removal of what is not there, and an occurrence past the next", () => {
    assert.match(refused(SOURCE, { op: "rename", node: "n3", id: null }).error, /n3 has no \.id modifier/);
    assert.match(refused(SOURCE, { op: "setRefs", node: "n3", refs: [] }).error, /n3 has no \.ref modifier/);
    assert.match(refused(SOURCE, { op: "setComment", node: "n3", text: null }).error, /no comment lines/);
    assert.match(refused(SOURCE, { op: "setModifier", node: "n4", name: "font", index: 2, args: "" }).error,
      /1 \.font modifier: index 2 is out of range/);
    assert.match(refused(SOURCE, { op: "setArgument", node: "n3", label: null, position: -1, value: "1" }).error,
      /position -1 is out of range for n3: 0 to 1/);
  });

  it("adds an occurrence after the last one, at the end of the chain (C5, C6)", () => {
    const r = applied(edit(SOURCE, { op: "setModifier", node: "n4", name: "font", index: 1, args: ".caption" }));
    assert.equal(r.source, SOURCE.replace("        .font(.footnote)\n", "        .font(.footnote)\n        .font(.caption)\n"));
  });
});
