// R-WEB-001 TC-1 (C8, V1) and R-REPO-004.C5, C7: the conformance corpus against dist/.
//
// Every case is run the way the corpus was generated (R-REPO-004.C9): no source path, no asset or
// pack paths, one import search path "." resolved against shared/conformance/ (its component files
// are registered under "components/…"). For every case:
//
//   evaluates  the source parses (or fails with the expected syntax error) and the evaluation stage
//              reproduces <name>.diag.json: the pack lineage and every diagnostic that arises before
//              rendering, in order (severity, code, message, line, col, source).
//   renders    render() returns exactly <name>.html minus its final line feed, and all of
//              <name>.diag.json (R-WEB-001.C8).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { CONF, setup } from "./helpers.js";

const core = setup();
core.registerComponentFiles(join(CONF, "components"), "components");

interface Expected {
  packs: string[];
  diagnostics: { severity: string; code: string; message: string; line: number; col: number; source: string }[];
}

/** Diagnostic codes only the renderer reports (assets, icons, device, chrome, appearance, roles). */
const RENDER_STAGE = new Set(["appearance", "asset", "chart", "chrome", "device", "icon", "role"]);

const cases = (JSON.parse(readFileSync(join(CONF, "index.json"), "utf8")) as { cases: { name: string; area: string }[] }).cases;
const render = core.render;

function load(name: string): { source: string; options: Record<string, unknown>; expected: Expected; html: string } {
  const read = (ext: string): string => readFileSync(join(CONF, name + ext), "utf8");
  return {
    source: read(".mockitdown"),
    options: { ...(JSON.parse(read(".json")) as Record<string, unknown>), import_paths: ["."] },
    expected: JSON.parse(read(".diag.json")) as Expected,
    html: read(".html"),
  };
}

const areas = [...new Set(cases.map((c) => c.area))];

it("the corpus is not empty and every case names its area", () => {
  assert.ok(cases.length >= 500, `${cases.length} cases`);
  for (const c of cases) assert.equal(c.area, c.name.split("-")[0]);
});

for (const area of areas) {
  describe(`conformance: ${area}`, () => {
    for (const c of cases.filter((x) => x.area === area)) {
      it(`${c.name} evaluates`, () => {
        const { source, options, expected } = load(c.name);
        assert.ok(source.startsWith("//"), "line 1 is a // comment (R-REPO-004.C12)");
        const syntax = expected.diagnostics.find((d) => d.code === "syntax");
        if (syntax) {
          assert.throws(() => core.parse(source), core.MockitdownSyntaxError);
        } else {
          core.parse(source);
        }
        const { screen, diagnostics } = core.evaluate(source, options);
        const packs = screen ? screen.pack.lineage().map((p) => p.id) : [];
        assert.deepEqual(packs, expected.packs, "pack lineage");
        const got = diagnostics.items.map((d) => d.toJSON());
        const want = expected.diagnostics.filter((d) => !RENDER_STAGE.has(d.code));
        assert.deepEqual(got, want, "evaluation-stage diagnostics");
      });
      it(`${c.name} renders`, () => {
        const { source, options, expected, html } = load(c.name);
        const result = render(source, options);
        assert.equal(result.html + "\n", html, "HTML (R-WEB-001.C8)");
        assert.deepEqual({ packs: result.packs, diagnostics: result.diagnostics.map((d) => d.toJSON()) }, expected,
          "<name>.diag.json (R-REPO-004.C7)");
      });
    }
  });
}
