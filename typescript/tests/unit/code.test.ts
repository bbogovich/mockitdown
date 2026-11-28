// IT-66 (unit part): the code view's colouring and its module graph (R-TOOL-008 TC-2 for C8; the
// ranges of C2). The module graph is read from the compiled dist/elements/code.js; the expected
// ranges below were counted by hand from the sources before highlight() ran.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, it } from "node:test";
import { PKG, setup } from "./helpers.js";

const core = setup();
const { highlight } = core;
const DIST = join(PKG, "dist");

const ranges = (source: string) => highlight(source).map((h) => [h.start, h.end, h.kind]);

describe("highlight (R-TOOL-008.C2)", () => {
  it("colours names, modifiers, members, strings, comments and punctuation", () => {
    const src = 'VStack {\n  // hi\n  Text("a").font(.title)\n}\n';
    assert.deepEqual(ranges(src), [
      [0, 6, "name"], [7, 8, "punct"],
      [11, 16, "comment"],
      [19, 23, "name"], [23, 24, "punct"], [24, 27, "string"], [27, 28, "punct"],
      [28, 29, "punct"], [29, 33, "modifier"], [33, 34, "punct"], [34, 35, "punct"], [35, 40, "member"], [40, 41, "punct"],
      [42, 43, "punct"],
    ]);
  });

  it("colours keywords, identifiers and numbers; a chain continued on the next line is a modifier", () => {
    assert.deepEqual(ranges("let x = 12\nText(x)\n  .padding()"), [
      [0, 3, "keyword"], [4, 5, "ident"], [6, 7, "punct"], [8, 10, "number"],
      [11, 15, "name"], [15, 16, "punct"], [16, 17, "ident"], [17, 18, "punct"],
      [21, 22, "punct"], [22, 29, "modifier"], [29, 30, "punct"], [30, 31, "punct"],
    ]);
  });

  it("never throws: an unterminated string takes the rest of its line, a block comment the rest of the source", () => {
    assert.deepEqual(ranges('Text("abc\nDivider'), [[0, 4, "name"], [4, 5, "punct"], [5, 9, "error"], [10, 17, "name"]]);
    assert.deepEqual(ranges("Spacer /* open\nText"), [[0, 6, "name"], [7, 19, "comment"]]);
    assert.deepEqual(ranges("a ~ b"), [[0, 1, "ident"], [2, 3, "error"], [4, 5, "ident"]]);
  });
});

/** The relative imports of a compiled module, resolved to paths under dist/. */
function importsOf(file: string): string[] {
  const text = readFileSync(file, "utf8");
  const out: string[] = [];
  for (const m of text.matchAll(/(?:^|\n)\s*(?:import|export)\s[^;]*?from\s*"([^"]+)"|(?:^|\n)\s*import\s*"([^"]+)"|import\(\s*"([^"]+)"\s*\)/g)) {
    const spec = m[1] ?? m[2] ?? m[3];
    assert.ok(spec.startsWith("."), `${relative(DIST, file)} imports the package ${spec}`);
    out.push(resolve(dirname(file), spec));
  }
  return out;
}

describe("the module graph of mockitdown-code (R-TOOL-008 TC-2, C8)", () => {
  it("imports only the core lexer, which reaches nothing of the design tools", () => {
    const entry = join(DIST, "elements", "code.js");
    assert.deepEqual(importsOf(entry).map((f) => relative(DIST, f)), ["core/syntax/lexer.js"]);
    const seen = new Set<string>();
    const queue = [entry];
    while (queue.length) {
      const f = queue.pop()!;
      if (seen.has(f)) continue;
      seen.add(f);
      queue.push(...importsOf(f));
    }
    const graph = [...seen].map((f) => relative(DIST, f)).sort();
    assert.deepEqual(graph, ["core/diagnostics.js", "core/pyformat.js", "core/syntax/lexer.js", "core/values.js", "elements/code.js"]);
  });
});

describe("indentUnit lives in the lexer (R-EDIT-002.C11)", () => {
  it("is the same function as the edit API's", () => {
    assert.equal(core.indentUnit('VStack {\n  Text("a")\n}\n'), "  ");
  });
});
