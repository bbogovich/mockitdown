// R-WEB-004 TC-8 (unit part, C22): the snippet builder of the gallery's Show source block
// (pages/snippet.js), a pure function, for a core pattern and a pack-specific one. The snippet's script
// child, read as the mockup element reads it (R-WEB-002.C2), gives back the pattern file's text.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { REPO } from "./helpers.js";

type Entry = Record<string, unknown>;
const builder = await import(new URL("../../pages/snippet.js", import.meta.url).href) as {
  PATTERN_ATTRIBUTES: string[];
  patternAttributes(entry: Entry, pack: string): [string, string][];
  patternText(source: string): string;
  snippet(entry: Entry, source: string, pack: string): string;
};
const entry = await import("../../dist/mockitdown.js");

const PATTERNS = join(REPO, "shared", "patterns");
const index = JSON.parse(readFileSync(join(PATTERNS, "index.json"), "utf8")) as { patterns: Entry[] };
const byId = (id: string): Entry => index.patterns.find((p) => p.id === id)!;
const sourceOf = (p: Entry): string => readFileSync(join(PATTERNS, String(p.file)), "utf8");

/** The opening tag's attributes and the script child's text of a snippet. */
function parse(s: string): { attrs: [string, string][]; script: string } {
  const m = /^<mockitdown-mockup((?: [a-z-]+="[^"]*")*)>\n<script type="text\/mockitdown">([\s\S]*)<\/script>\n<\/mockitdown-mockup>$/.exec(s);
  if (!m) assert.fail(`snippet shape:\n${s}`);
  const attrs = [...m[1]!.matchAll(/ ([a-z-]+)="([^"]*)"/g)].map((a) => [a[1]!, a[2]!] as [string, string]);
  return { attrs, script: m[2]! };
}

test("a core pattern: pack only, the file's text unchanged without its trailing newline (C22)", () => {
  const p = byId("sign-in");
  const source = sourceOf(p);
  assert.ok(source.endsWith("\n"));
  const s = builder.snippet(p, source, "carbon");
  assert.equal(s, `<mockitdown-mockup pack="carbon">\n<script type="text/mockitdown">\n${source.slice(0, -1)}\n</script>\n</mockitdown-mockup>`);
  const { attrs, script } = parse(s);
  assert.deepEqual(attrs, [["pack", "carbon"]]);
  assert.equal(entry.scriptCode(script), source.slice(0, -1));
});

test("a desktop layout carries its device after pack (C14, C22)", () => {
  const p = byId("mail-client");
  assert.deepEqual(parse(builder.snippet(p, sourceOf(p), "swiftui")).attrs, [["pack", "swiftui"], ["device", "desktop"]]);
});

test("a pack-specific pattern: pack, device, menubar, app in C22 order; no gallery-only attribute", () => {
  const p = byId("swiftui-mac");
  const s = builder.snippet(p, sourceOf(p), "swiftui");
  const { attrs, script } = parse(s);
  assert.deepEqual(attrs, [["pack", "swiftui"], ["device", "desktop"], ["menubar", "Transaction"], ["app", "Ledger"]]);
  for (const k of ["caption", "label", "appearance", "packs", "file", "title", "id"]) {
    assert.ok(!attrs.some(([a]) => a === k), `no ${k}`);
  }
  assert.equal(entry.scriptCode(script), builder.patternText(sourceOf(p)));
});

test("the attribute order is pack, device, chrome, menubar, app, windowed whatever the entry's key order", () => {
  const p = { windowed: true, app: "A & B", menubar: 'Say "hi"', chrome: "browser", device: "tablet", id: "x", file: "x" };
  const { attrs } = parse(builder.snippet(p, "Text(\"a\")\n", "base"));
  assert.deepEqual(attrs.map(([k]) => k), ["pack", "device", "chrome", "menubar", "app", "windowed"]);
  assert.deepEqual(attrs.map(([, v]) => v), ["base", "tablet", "browser", "Say &quot;hi&quot;", "A &amp; B", "true"]);
  assert.deepEqual(builder.PATTERN_ATTRIBUTES, ["device", "chrome", "menubar", "app", "windowed"]);
});

test("patternText keeps indentation and inner line breaks and drops only the final newline", () => {
  assert.equal(builder.patternText("VStack {\n  Text(\"a\")\n\n}\n"), "VStack {\n  Text(\"a\")\n\n}");
  assert.equal(builder.patternText("A\r\n"), "A");
  assert.equal(builder.patternText("A"), "A");
  assert.equal(builder.patternText("A\n\n"), "A\n");
});

test("every pattern's snippet gives back its file text through the script child (C22)", () => {
  for (const p of index.patterns) {
    const source = sourceOf(p);
    const packs = Array.isArray(p.packs) ? p.packs as string[] : ["base"];
    for (const pack of packs) {
      const { script } = parse(builder.snippet(p, source, pack));
      assert.ok(!script.includes("</script"), `${p.id}: the text can be carried in a script element`);
      assert.equal(entry.scriptCode(script), builder.patternText(source), String(p.id));
    }
  }
});
