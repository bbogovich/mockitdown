// R-EDIT-002 TC-1 (C1, C2, C4–C8, C10–C13, C15–C18) and R-EDIT-003 TC-1 (C1–C8, C10–C13): the edit
// corpus in shared/conformance/edit/.
// Each case's operation applied to its source gives exactly its expected file (or the message of its
// error file); the returned edits applied to the source give the same text; the edited source renders
// with no diagnostic the source lacked. A meta-test checks that the corpus covers C16.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { CONF, setup } from "./helpers.js";

const core = setup();
const { applyEdits, check, edit } = core;
const DIR = join(CONF, "edit");

interface Case {
  name: string;
  op: string;
}

const cases = (JSON.parse(readFileSync(join(DIR, "index.json"), "utf8")) as { cases: Case[] }).cases;
const read = (file: string): string => readFileSync(join(DIR, file), "utf8");
const opOf = (name: string): Record<string, unknown> & { op: string; covers: string[] } => JSON.parse(read(`${name}.op.json`));
const diagKey = (d: { severity: string; code: string; message: string }): string => `${d.severity} ${d.code}: ${d.message}`;

/** The situations C16 asks the corpus to cover, as the `covers` tags of the cases' op.json. */
const REQUIRED = [
  "insert:first", "insert:middle", "insert:last", "insert:empty", "insert:no-closure",
  "remove:first", "remove:middle", "remove:last", "remove:all",
  "move:first", "move:middle", "move:last", "move:empty", "move:no-closure",
  "source:comments", "source:blank-lines", "source:let", "source:foreach", "source:if", "source:struct",
  "indent:unit", "indent:tabs", "indent:relative",
  // every refusal of R-EDIT-002 (C3, C9, C14) and of its as-built clauses
  "refuse:not-a-node", "refuse:move-into-self", "refuse:move-into-descendant", "refuse:insert-syntax",
  "refuse:insert-not-one-view", "refuse:not-siblings", "refuse:not-a-statement", "refuse:index",
  "refuse:named-twice", "refuse:no-nodes", "refuse:labelled-closures", "refuse:else-if", "refuse:unknown-op",
  "refuse:source-syntax",
  // R-EDIT-003.C13: every operation of R-EDIT-003, and its refusals
  "setArgument:add-labelled", "setArgument:add-positional", "setArgument:replace-labelled", "setArgument:replace-positional",
  "setArgument:remove-labelled", "setArgument:remove-positional", "setArgument:add-parens", "setArgument:remove-parens",
  "setArgument:multiline",
  "setModifier:add-inline", "setModifier:add-line", "setModifier:replace", "setModifier:occurrence",
  "setModifier:remove-inline", "setModifier:remove-line",
  "rename:add", "rename:replace", "rename:remove", "setRefs:set", "setRefs:clear",
  "setComment:add", "setComment:replace", "setComment:remove", "setName",
  "refuse:duplicate-id", "refuse:no-argument", "refuse:no-modifier", "refuse:argument-syntax", "refuse:position",
  "refuse:modifier-name", "refuse:element-name", "refuse:not-a-call", "refuse:comment-inline",
];

describe("R-EDIT-002 TC-1: the edit corpus", () => {
  it("index.json lists every case once, with its operation, and every file belongs to a case (C15, C18)", () => {
    const names = cases.map((c) => c.name);
    assert.equal(new Set(names).size, names.length);
    const files = new Set(readdirSync(DIR));
    for (const c of cases) {
      assert.equal(opOf(c.name).op, c.op, c.name);
      assert.ok(files.has(`${c.name}.mockitdown`), c.name);
      const expected = files.has(`${c.name}.expected.mockitdown`);
      const error = files.has(`${c.name}.error.txt`);
      assert.ok(expected !== error, `${c.name}: exactly one of .expected.mockitdown and .error.txt`);
    }
    const owned = new Set(["index.json", ...cases.flatMap((c) => [
      `${c.name}.mockitdown`, `${c.name}.op.json`, `${c.name}.expected.mockitdown`, `${c.name}.error.txt`,
    ])]);
    assert.deepEqual([...files].filter((f) => !owned.has(f)), []);
  });

  it("covers every situation of C16 and every operation of R-EDIT-003 (each op.json's covers list)", () => {
    const covered = new Set(cases.flatMap((c) => opOf(c.name).covers));
    assert.deepEqual(REQUIRED.filter((t) => !covered.has(t)), []);
    // A refused case covers a refusal, and only a refused case does.
    for (const c of cases) {
      const refused = existsSync(join(DIR, `${c.name}.error.txt`));
      const tags = opOf(c.name).covers.filter((t) => t.startsWith("refuse:"));
      assert.equal(tags.length > 0, refused, c.name);
    }
  });

  for (const c of cases) {
    it(c.name, () => {
      const source = read(`${c.name}.mockitdown`);
      const { covers: _covers, ...op } = opOf(c.name);
      const result = edit(source, op as unknown as Parameters<typeof edit>[1]);
      if (existsSync(join(DIR, `${c.name}.error.txt`))) {
        if (!("error" in result)) assert.fail("the operation was applied");
        assert.equal(result.error, read(`${c.name}.error.txt`).replace(/\n$/, ""));
        assert.equal("edits" in result, false, "no edits");
        return;
      }
      if ("error" in result) assert.fail(result.error);
      assert.equal(result.source, read(`${c.name}.expected.mockitdown`));
      // C1, C2: ascending, non-overlapping edits that turn the source into the result.
      for (let i = 1; i < result.edits.length; i++) assert.ok(result.edits[i - 1].end <= result.edits[i].start);
      assert.equal(applyEdits(source, result.edits), result.source);
      assert.equal(result.tree.source, result.source);
      // C17: no new diagnostic.
      const before = new Set(check(source).map(diagKey));
      assert.deepEqual(check(result.source).map(diagKey).filter((k) => !before.has(k)), []);
    });
  }
});
