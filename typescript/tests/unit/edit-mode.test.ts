// R-EDIT-004 (edit-mode rendering) in the TypeScript core. The edit-mode conformance cases (`edit-*`)
// run with the rest of the corpus in conformance.test.ts (TC-1); here: the option's default and its
// absence from the fence (TC-2, C1, C10), the attributes of a crafted render, and the numbering the
// evaluator writes against the editing tree's ordinals for every corpus case (C3).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { CONF, setup } from "./helpers.js";

const core = setup();
const { structViewNodes, viewNodeOrdinals } = await import("../../dist/core/syntax/tree.js");

test("TC-2: edit is false by default, render accepts it, and the fence does not offer it (C1, C10)", () => {
  assert.equal(core.DEFAULT_OPTIONS.edit, false);
  assert.equal(core.renderOptions().edit, false);
  const src = 'VStack { Text("a") }';
  assert.ok(!core.render(src).html.includes("data-mkd-"));
  assert.ok(!core.render(src, { edit: false }).html.includes("data-mkd-"));
  const on = core.render(src, { edit: true }).html;
  assert.ok(on.includes('data-el="VStack" data-mkd-node="n1"'), on);
  assert.ok(on.includes('data-el="Text" data-mkd-node="n2"'), on);
  const [values, problems] = core.coerceFenceOptions({ edit: "true" });
  assert.deepEqual(values, {});
  assert.equal(problems.length, 1);
  assert.match(problems[0], /^unknown fence option 'edit'/);
});

test("edit mode: node, then derived, directly after data-el; literals and variables carry neither (C4-C7)", () => {
  const src = 'struct Pill: View {\n  var t: String\n  var body: some View { Text(t) }\n}\n'
    + 'let v = "var"\nVStack {\n  ForEach([1], id: \\.self) { _ in Pill(t: "p") }\n  "lit"\n  v\n  if true { Divider }\n}\n';
  const html = core.render(src, { edit: true }).html;
  const tags = [...html.matchAll(/data-el="([^"]*)"((?: data-mkd-node="[^"]*")?)((?: data-mkd-derived="[^"]*")?)/g)]
    .map((m) => [m[1], m[2].split('"')[1] ?? null, m[3].split('"')[1] ?? null]);
  // n1 Text (Pill's body), n2 VStack, n3 ForEach, n4 Pill, n5 `v`, n6 if, n7 Divider
  assert.deepEqual(tags, [
    ["VStack", "n2", null], ["Text", "n1", "n4"], ["Text", null, null], ["Text", null, null], ["Divider", "n7", "n6"],
  ]);
  assert.equal(html.split("data-mkd-").length - 1, 5);
});

test("C3: the evaluator's ordinals are the editing tree's, for every corpus case that parses", () => {
  const cases = (JSON.parse(readFileSync(join(CONF, "index.json"), "utf8")) as { cases: { name: string }[] }).cases;
  let compared = 0;
  for (const { name } of cases) {
    const source = readFileSync(join(CONF, `${name}.mockitdown`), "utf8");
    const { tree } = core.parseTree(source);
    if (tree === null) continue;
    const module = core.parse(source);
    const got = [...(viewNodeOrdinals(module) as Map<{ start?: number }, string>)].map(([n, o]) => `${o}@${n.start}`);
    const want = tree.nodes.map((n) => `${n.ordinal}@${n.first}`);
    assert.deepEqual(got.sort(), want.sort(), name);
    compared += 1;
  }
  assert.ok(compared > 600, `${compared} cases`);
});

test("C14: a declarations-only block's preview is not derived from the implicit call", () => {
  const html = core.render('struct Card2: View {\n  var body: some View { VStack { Text("a") } }\n}\n', { edit: true }).html;
  assert.ok(html.includes('data-el="VStack" data-mkd-node="n1" data-component="Card2"'), html);
  assert.ok(html.includes('data-el="Text" data-mkd-node="n2">'), html);
  assert.ok(!html.includes("data-mkd-derived"));
});

test("structViewNodes lists a struct's view nodes without numbering them", () => {
  const module = core.parse('struct P: View {\n  var body: some View { HStack { Text("a"); Spacer } }\n}\n');
  assert.equal((structViewNodes(module.structs[0]) as Set<unknown>).size, 3);
});
