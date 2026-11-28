// IT-60 · R-EVAL-004 TC-1 (C7 to C10; F-12.C6, AC4, AC5): labelled arguments nothing reads are warned,
// alike in both variants. The conformance case diag-unknown-label (hand-written diag.json) runs in
// conformance.test.ts; python/tests/test_unknown_labels.py holds the same examples. Expected messages and
// columns are written by hand from C9 and the sources below.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { PKG, REPO, setup } from "./helpers.js";

const core = setup();

function warnings(src: string, options: Record<string, unknown> = {}): [string, number, number][] {
  return core.render(src, options).diagnostics.filter((d) => d.code === "argument").map((d) => [d.message, d.location.line, d.location.col]);
}

test("TC-1: a misspelt label warns and the element still renders (C9, F-12.AC4)", () => {
  const r = core.render('Text("Hi", colour: .red)');
  assert.deepEqual(r.diagnostics.map((d) => [d.severity, d.code, d.message, d.location.line, d.location.col]),
    [["warning", "argument", "'colour' is not understood by Text in pack 'base'", 1, 12]]);
  assert.ok(r.html.includes(">Hi<"));
});

test("TC-1: understood labels do not warn (C7)", () => {
  for (const src of [
    'Toggle("Wi-Fi", isOn: true)',
    'Rectangle(shape: "capsule")',
    'Link("Docs", destination: "https://x.example")',
    'Button("Go", action: { doIt() })',
    'Section("A", footer: { Text("f") }) { Text("x") }',
    'Card(cover: Image("photo.png"))',
    'let on = true\nToggle("Wi-Fi", unheard: $on)',
  ]) assert.deepEqual(warnings(src), [], src);
  assert.deepEqual(warnings('Button("Save", type: "primary")', { pack: "antd" }), []);
  assert.deepEqual(warnings('Input("Name", allowClear: true)', { pack: "antd" }), []);
});

test("TC-1: warnings follow the arguments in order; struct arguments are not element labels (C9)", () => {
  assert.deepEqual(warnings('VStack(spacng: 4) { Text("a", colr: .red, size: 3, wieght: 1) }'), [
    ["'spacng' is not understood by VStack in pack 'base'", 1, 8],
    ["'colr' is not understood by Text in pack 'base'", 1, 31],
    ["'wieght' is not understood by Text in pack 'base'", 1, 52],
  ]);
  assert.deepEqual(warnings('struct Card2: View { var title: String\n var body: some View { Text(title) } }\nCard2(title: "x")'), []);
});

test("TC-1: the role table's reads are the shared file's, the common labels included (C8)", () => {
  const table = JSON.parse(readFileSync(join(REPO, "shared/language/roles.json"), "utf8")) as
    { reads: string[]; roles: Record<string, { reads: string[] }> };
  assert.deepEqual(JSON.parse(readFileSync(join(PKG, "dist/shared/roles.json"), "utf8")), table);
  for (const [role, rule] of Object.entries(table.roles)) {
    assert.deepEqual([...(core.roleReads(role) ?? [])].sort(), [...new Set([...table.reads, ...rule.reads])].sort(), role);
  }
  assert.equal(core.roleReads("no-such-role"), null);
});

test("TC-1: the reference samples render without the warning (C10, F-12.AC5)", () => {
  const found: string[] = [];
  const dir = join(REPO, "shared/reference");
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".json")).sort()) {
    const data = JSON.parse(readFileSync(join(dir, f), "utf8")) as { id?: string; elements?: { name: string; sample?: string; variants_sample?: string | null }[] };
    for (const e of data.elements ?? []) {
      for (const src of [e.sample, e.variants_sample]) {
        if (src) found.push(...warnings(src, { pack: data.id, device: "fit" }).map((w) => `${data.id} ${e.name}: ${w[0]}`));
      }
    }
  }
  assert.deepEqual(found, []);
});
