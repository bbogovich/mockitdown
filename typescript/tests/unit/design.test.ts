// R-EDIT-005 (the design document module, `mockitdown/design`):
//   TC-1 (C1, C5, C6, C7, C10) round trip and key order, over the hand-written fixtures in
//        tests/fixtures/design/; the module imports no DOM global.
//   TC-2 (C2, C3, C4) refusals, over tests/fixtures/design/malformed/ and its expected.json
//        (paths and messages written by hand before the module existed).
//   TC-3 (C8, C9, C11) the pack of a mockup, mockupOptions, and no Markdown or file function.
// The module is imported through the package's own subpath export, as a host imports it.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import * as design from "mockitdown/design";
import { mockupOptions, mockupPack, newDesign, readDesign, writeDesign, type DesignDocument } from "mockitdown/design";
import { PKG } from "./helpers.js";

const FIX = join(PKG, "tests", "fixtures", "design");
const read = (f: string): string => readFileSync(join(FIX, f), "utf8");

function doc(text: string): DesignDocument {
  const r = readDesign(text);
  if (!("document" in r)) assert.fail(`refused: ${JSON.stringify(r.errors)}`);
  return r.document;
}

// --- TC-1 ------------------------------------------------------------------------------------------

test("every fixture document reads and writes back to the same text (TC-1, C6, C7)", () => {
  const files = readdirSync(FIX).filter((f) => f.endsWith(".mkdesign"));
  assert.deepEqual(files.sort(), ["mail.mkdesign", "minimal.mkdesign", "unicode.mkdesign"]);
  for (const f of files) {
    const text = read(f);
    assert.equal(writeDesign(doc(text)), text, f);
  }
});

test("unknown keys are kept with their values at every level (TC-1, C6)", () => {
  const d = doc(read("mail.mkdesign"));
  assert.deepEqual(d["x-tool"], { name: "MockItDown-Designer", build: 7, panels: [] });
  assert.equal(d.mockups[0].locked, true);
  assert.deepEqual(d.mockups[1].notes, { author: "UX", tags: ["draft", "v2"], reviewed: null });
  assert.equal(d.sections![0].color, "#e8f0fe");
  assert.equal(d.view!.grid, false);
  assert.deepEqual(d.defaults["x-theme"], { accent: "#0f6cbd" });
});

test("index-like unknown keys keep the place they were read in (TC-1, C5, C6)", () => {
  const text = read("unicode.mkdesign");
  const out = writeDesign(doc(text));
  assert.equal(out, text);
  assert.ok(out.indexOf('"9"') > out.indexOf('"code"') && out.indexOf('"zeta"') < out.indexOf('"alpha"'));
  assert.ok(out.lastIndexOf('"2"') > out.indexOf('"mockups"'));
});

test("a mockup's code reaches the document and the text verbatim (TC-1, C7)", () => {
  const d = doc(read("mail.mkdesign"));
  assert.equal(d.mockups[1].code, 'List {\r\n\tText("Ada")   \r\n\tText("Grace")\t\r\n}');
  d.mockups[0].code = "VStack {\r\n\t\tText(\"a\")  \n}\t";
  const again = doc(writeDesign(d));
  assert.equal(again.mockups[0].code, "VStack {\r\n\t\tText(\"a\")  \n}\t");
});

test("the writer puts known keys in M-EDIT-1 and M-EDIT-2 order, unknown keys after them in read order (TC-1, C5)", () => {
  const text = JSON.stringify({
    zz: 1, mockups: [{ code: "Text(\"a\")\n", extra: true, y: 2, name: "A", x: 1, options: { width: 300, pack: "mui" } }],
    view: { active: "A", y: 3, other: 1, zoom: 1, x: 2 },
    sections: [{ h: 4, w: 3, y: 2, x: 1, name: "S", tint: "red" }],
    imports: ["a.mockitdown"], name: "Order", defaults: { pack: "fluent" }, version: 1, format: "mockitdown-design", aa: 2,
  });
  const out = writeDesign(doc(text));
  assert.equal(out, [
    "{",
    '  "format": "mockitdown-design",',
    '  "version": 1,',
    '  "name": "Order",',
    '  "defaults": {',
    '    "pack": "fluent"',
    "  },",
    '  "imports": [',
    '    "a.mockitdown"',
    "  ],",
    '  "sections": [',
    "    {",
    '      "name": "S",',
    '      "x": 1,',
    '      "y": 2,',
    '      "w": 3,',
    '      "h": 4,',
    '      "tint": "red"',
    "    }",
    "  ],",
    '  "mockups": [',
    "    {",
    '      "name": "A",',
    '      "x": 1,',
    '      "y": 2,',
    '      "options": {',
    '        "width": 300,',
    '        "pack": "mui"',
    "      },",
    '      "code": "Text(\\"a\\")\\n",',
    '      "extra": true',
    "    }",
    "  ],",
    '  "view": {',
    '    "zoom": 1,',
    '    "x": 2,',
    '    "y": 3,',
    '    "active": "A",',
    '    "other": 1',
    "  },",
    '  "zz": 1,',
    '  "aa": 2',
    "}",
    "",
  ].join("\n"));
});

test("the text is indented by two spaces and ends with one line feed (TC-1, C5)", () => {
  const out = writeDesign(doc(read("mail.mkdesign")));
  assert.ok(out.endsWith("}\n") && !out.endsWith("\n\n"));
  for (const line of out.split("\n").slice(1, -2)) assert.match(line, /^( {2})+\S/);
  // The same layout as JSON.stringify(…, null, 2) for a document already in key order.
  assert.equal(out, JSON.stringify(JSON.parse(out), null, 2) + "\n");
});

test("newDesign gives format, version 1, the name, empty defaults and no mockups, in M-EDIT-1 order (TC-1, C10)", () => {
  const d = newDesign("Untitled");
  assert.deepEqual(d, { format: "mockitdown-design", version: 1, name: "Untitled", defaults: {}, mockups: [] });
  assert.equal(writeDesign(d), read("minimal.mkdesign"));
  assert.notEqual(newDesign("A").mockups, newDesign("B").mockups, "each document has its own lists");
});

test("the module and the core it imports use no DOM, network or file system (TC-1, C1, C11)", () => {
  // Statically: dist/design.js reaches only relative modules (no `node:` built-in, no package), none of
  // them a custom-element module.
  const seen = new Set<string>();
  const queue = [join(PKG, "dist", "design.js")];
  while (queue.length) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    assert.ok(!/[/\\]elements[/\\]/.test(file), `${file} is an element module`);
    const js = readFileSync(file, "utf8");
    for (const m of js.matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s+"([^"]+)"|\bimport\s*\(\s*"([^"]+)"/gm)) {
      const spec = m[1] ?? m[2];
      assert.ok(spec.startsWith("./") || spec.startsWith("../"), `${file} imports ${spec}`);
      queue.push(join(file, "..", spec));
    }
  }
  assert.ok(seen.size > 3);
  // At run time: with every browser and network global made to throw, a document reads, writes and is
  // edited through a session.
  const trapped = ["document", "window", "navigator", "customElements", "HTMLElement", "fetch", "XMLHttpRequest", "localStorage"];
  const saved = trapped.map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)] as const);
  for (const k of trapped) {
    Object.defineProperty(globalThis, k, { configurable: true, get: () => { throw new Error(`the design module used ${k}`); } });
  }
  try {
    const d = doc(read("mail.mkdesign"));
    const s = new design.DesignSession(d);
    assert.ok("edits" in s.apply({ op: "remove", nodes: ["n3"] }));
    assert.doesNotMatch(writeDesign(d), /Welcome back/, "n3 is the Text of Sign in");
    assert.equal(writeDesign(doc(read("unicode.mkdesign"))), read("unicode.mkdesign"));
  } finally {
    for (const [k, desc] of saved) {
      if (desc) Object.defineProperty(globalThis, k, desc);
      else delete (globalThis as Record<string, unknown>)[k];
    }
  }
});

// --- TC-2 ------------------------------------------------------------------------------------------

interface Expected {
  cases: { file: string; errors: { path: string; message: string }[] }[];
}

test("each malformed fixture is refused with the expected paths and messages (TC-2, C2, C3, C4)", () => {
  const expected = JSON.parse(read("malformed/expected.json")) as Expected;
  const files = readdirSync(join(FIX, "malformed")).filter((f) => f.endsWith(".mkdesign")).sort();
  assert.deepEqual(expected.cases.map((c) => c.file).sort(), files, "every malformed fixture has its expectation");
  for (const c of expected.cases) {
    const r = readDesign(read(join("malformed", c.file)));
    if (!("errors" in r)) assert.fail(`${c.file} was accepted`);
    assert.deepEqual(r.errors, c.errors, c.file);
  }
});

test("a refused document gives no document, and a valid one no errors (TC-2, C2)", () => {
  const bad = readDesign("{}") as unknown as Record<string, unknown>;
  assert.equal(bad.document, undefined);
  assert.deepEqual(Object.keys(bad), ["errors"]);
  const good = readDesign(read("minimal.mkdesign")) as unknown as Record<string, unknown>;
  assert.deepEqual(Object.keys(good), ["document"]);
});

test("format and version refusals name the key and the value found (TC-2, C3)", () => {
  const base = JSON.parse(read("minimal.mkdesign")) as Record<string, unknown>;
  for (const [key, value, message] of [
    ["format", "Mockitdown-Design", 'format must be "mockitdown-design", found "Mockitdown-Design"'],
    ["version", "1", 'version must be 1, found "1"'],
    ["version", 1.5, "version must be 1, found 1.5"],
  ] as const) {
    const r = readDesign(JSON.stringify({ ...base, [key]: value }));
    if (!("errors" in r)) assert.fail(`${key} accepted`);
    assert.deepEqual(r.errors, [{ path: key, message }]);
  }
});

// --- TC-3 ------------------------------------------------------------------------------------------

test("a mockup's pack: its options.pack, else defaults.pack, else base (TC-3, C8)", () => {
  const d = newDesign("Packs");
  d.defaults = { pack: "fluent", appearance: "dark" };
  d.mockups.push({ name: "Plain", x: 0, y: 0, code: "Text(\"a\")\n" });
  d.mockups.push({ name: "Material", x: 0, y: 0, options: { pack: "mui", width: 320 }, code: "Text(\"b\")\n" });
  assert.equal(mockupPack(d, "Plain"), "fluent");
  assert.equal(mockupPack(d, "Material"), "mui");
  d.defaults = {};
  assert.equal(mockupPack(d, "Plain"), "base");
  assert.equal(mockupPack(d, "Material"), "mui");
  assert.equal(mockupPack(d, "Nowhere"), null);
});

test("mockupOptions merges the defaults under the mockup's own options, with the pack (TC-3, C9)", () => {
  const d = newDesign("Options");
  d.defaults = { pack: "fluent", appearance: "light", device: "phone" };
  d.mockups.push({ name: "Plain", x: 0, y: 0, code: "" });
  d.mockups.push({ name: "Dark", x: 0, y: 0, options: { appearance: "dark", pack: "mui" }, code: "" });
  assert.deepEqual(mockupOptions(d, "Plain"), { pack: "fluent", appearance: "light", device: "phone" });
  assert.deepEqual(mockupOptions(d, "Dark"), { pack: "mui", appearance: "dark", device: "phone" });
  d.defaults = { appearance: "both" };
  assert.deepEqual(mockupOptions(d, "Plain"), { appearance: "both", pack: "base" });
  assert.equal(mockupOptions(d, "Nowhere"), null);
  // The result is a new object: changing it changes neither the defaults nor the options.
  const o = mockupOptions(d, "Dark")!;
  o.appearance = "auto";
  assert.equal(d.mockups[1].options!.appearance, "dark");
});

test("the module exports no Markdown, HTML or file function (TC-3, C11)", () => {
  const names = Object.keys(design).filter((k) => typeof (design as Record<string, unknown>)[k] === "function");
  for (const n of names) assert.doesNotMatch(n, /markdown|html|file|folder|load|save|export|import/i, n);
  for (const n of ["readDesign", "writeDesign", "newDesign", "mockupOptions", "mockupPack", "DesignSession"]) assert.ok(names.includes(n), n);
});
