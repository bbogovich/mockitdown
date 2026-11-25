// The evaluator: values, structs, ForEach, imports through registerComponents and a resolver.
import assert from "node:assert/strict";
import { test } from "node:test";
import { setup } from "./helpers.js";

const core = setup();

function text(src: string, options = {}): { text: unknown[]; diags: string[] } {
  const { screen, diagnostics } = core.evaluate(src, options);
  const out: unknown[] = [];
  for (const v of core.walk(screen ? screen.views : [])) if (v.name === "Text") out.push(v.attrs.get("content"));
  return { text: out, diags: diagnostics.items.map((d) => `${d.severity} [${d.code}] ${d.location.line}:${d.location.col} ${d.message}`) };
}

test("arithmetic keeps Python's int/float rules", () => {
  assert.deepEqual(text('Text("\\(7 / 2) \\(7.0 / 2) \\(-7 / 2) \\(0.1 + 0.2) \\(2.0 * 3)")').text,
    ["3 3.5 -4 0.3 6"]);
  assert.deepEqual(text('Text("\\(1 / 0)")').diags, ["error [value] 1:11 cannot apply '/' to these values"]);
});

test("collections, tuples, dicts, ranges and string methods", () => {
  const r = text('let t = (1, "a")\nlet d = ["k": 2]\nText("\\(t) \\(t.1) \\(d) \\(d.k) \\(0...2) \\("ab".uppercased()) '
    + '\\([1, 2].contains(2)) \\(["x", "y"].joined(separator: "-"))")');
  assert.deepEqual(r.text, ["(1, 'a') a {'k': 2} 2 [0, 1, 2] AB true x-y"]);
  assert.deepEqual(r.diags, []);
});

test("let, if/else and ForEach over lists, counts and dicts", () => {
  assert.deepEqual(text('let n = 3\nif n > 2 { Text("many") } else { Text("few") }').text, ["many"]);
  assert.deepEqual(text('ForEach(["a", "b"]) { s in Text(s) }').text, ["a", "b"]);
  assert.deepEqual(text('ForEach(2) { i in Text("\\(i)") }').text, ["0", "1"]);
  assert.deepEqual(text('ForEach(["k": 1]) { k, v in Text("\\(k)=\\(v)") }').text, ["k=1"]);
});

test("structs: properties, defaults, trailing view content, preview of a declarations-only block", () => {
  const src = "struct Card: View {\n  var title: String\n  var note: String = \"n\"\n  @ViewBuilder var content: Content\n"
    + "  var body: some View { VStack { Text(title); Text(note); content } }\n}\n";
  assert.deepEqual(text(src + 'Card(title: "T") { Text("inner") }').text, ["T", "n", "inner"]);
  assert.deepEqual(text(src).text, ["title", "n"]);
  assert.deepEqual(text(src + "Card()").diags, ["error [argument] 7:5 missing argument 'title' for struct Card",
    "error [argument] 7:5 missing argument 'content' for struct Card"]);
});

test("pack selection by import, by @Screen and by option, with diagnostics", () => {
  assert.equal(core.evaluate("import FluentUI\nText(\"x\")").screen!.pack.id, "fluent");
  assert.equal(core.evaluate('@Screen(pack: "mui")\nText("x")').screen!.pack.id, "mui");
  assert.equal(core.evaluate("import FluentUI\nText(\"x\")", { pack: "carbon" }).screen!.pack.id, "carbon");
  assert.equal(core.evaluate('Text("x")', { default_pack: "bootstrap" }).screen!.pack.id, "bootstrap");
  assert.deepEqual(text("import SwiftUI\nimport FluentUI\nimport Nope\nText(\"x\")").diags, [
    "warning [pack] 2:1 import FluentUI selects pack 'fluent', but 'swiftui' is already selected; the first import wins",
    "warning [pack] 3:1 import Nope names no known pack",
  ]);
  const r = core.evaluate('Text("x")', { pack: "no-such" });
  assert.equal(r.screen!.pack.id, "base");
  assert.match(r.diagnostics.items[0].message, /^unknown pack 'no-such'; known packs: android, /);
});

test("unknown elements, names and modifiers are reported and evaluation completes", () => {
  assert.deepEqual(text('VStack { Text("kept"); Frobnicate() }\nText("a").wobble()\nText(missing)').diags, [
    "error [unknown] 1:34 'Frobnicate' is not an element of pack 'base' and no struct of that name is declared or imported",
    "warning [modifier] 2:11 unknown modifier .wobble() is ignored",
    "error [unknown] 3:6 unknown name 'missing'",
  ]);
});

test("imports resolve against registered components, as written and with .mockitdown (R-WEB-001.C6)", () => {
  core.registerComponents("lib/badge.mockitdown", 'struct Tag: View {\n  var t: String\n  var body: some View { Text(t) }\n}');
  core.registerComponents("lib/row.mockitdown", 'import "badge"\nstruct Row: View {\n  var body: some View { Tag(t: "in row") }\n}');
  assert.deepEqual(text('import "lib/badge"\nTag(t: "x")').text, ["x"]);
  assert.deepEqual(text('import "lib/badge.mockitdown"\nTag(t: "y")').text, ["y"]);
  assert.deepEqual(text('import "lib/row"\nRow()').text, ["in row"]);
  assert.deepEqual(text('import "badge"\nTag(t: "z")', { import_paths: ["lib"] }).text, ["z"]);
  assert.deepEqual(text('import "nope"\nText("x")', { import_paths: ["."] }).diags,
    ["error [import] 1:1 cannot find import 'nope' (searched .)"]);
  assert.deepEqual(text('import "nope"\nText("x")').diags,
    ["error [import] 1:1 cannot find import 'nope' (searched (no import paths))"]);
});

test("an import resolver supplies files the registry does not hold", () => {
  const asked: string[] = [];
  const import_resolver = (p: string): string | null => {
    asked.push(p);
    return p === "remote/card.mockitdown" ? 'struct RC: View {\n  var body: some View { Text("remote") }\n}' : null;
  };
  assert.deepEqual(text('import "card"\nRC()', { import_paths: ["remote"], import_resolver }).text, ["remote"]);
  assert.deepEqual(asked, ["remote/card", "remote/card.mockitdown"]);
});

test("a syntax error in an imported file is reported with the file as its source", () => {
  core.registerComponents("broken.mockitdown", "struct B: View {");
  const { diagnostics } = core.evaluate('import "broken"\nText("x")');
  const d = diagnostics.items[0];
  assert.equal(d.code, "syntax");
  assert.equal(d.location.source, "broken.mockitdown");
});
