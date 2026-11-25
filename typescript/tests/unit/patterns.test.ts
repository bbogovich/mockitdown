// R-WEB-004 TC-2 (C3, C4): the design patterns of shared/patterns/ are written in the core vocabulary
// and render in every shipped pack — listed in the gallery or hidden — without an error diagnostic.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { REPO, setup } from "./helpers.js";

const core = setup();
const PATTERNS = join(REPO, "shared", "patterns");

interface PatternEntry { id: string; title: string; file: string }

const index = JSON.parse(readFileSync(join(PATTERNS, "index.json"), "utf8")) as { patterns: PatternEntry[] };
const patterns = index.patterns.map((p) => ({ ...p, source: readFileSync(join(PATTERNS, p.file), "utf8") }));

test("the pattern index names at least the six required patterns (C3)", () => {
  const ids = patterns.map((p) => p.id);
  for (const id of ["sign-in", "list-detail", "settings", "dashboard", "data-table", "wizard"]) {
    assert.ok(ids.includes(id), `pattern ${id} is missing`);
  }
  assert.equal(new Set(ids).size, ids.length, "pattern ids are unique");
  for (const p of patterns) assert.ok(p.title.trim(), `pattern ${p.id} has a title`);
});

test("each pattern uses only the core vocabulary: it renders in base without any diagnostic (C4)", () => {
  for (const p of patterns) {
    assert.ok(!/^\s*import\b/m.test(p.source), `${p.id} imports nothing (the gallery chooses the pack)`);
    assert.deepEqual(core.check(p.source, { pack: "base" }).map(String), [], p.id);
  }
});

test("TC-2: each pattern renders in every shipped pack without an error diagnostic (C4)", () => {
  const packs = core.registry.ids();
  const listed = (JSON.parse(readFileSync(join(REPO, "shared", "reference", "index.json"), "utf8")) as
    { groups: { packs: string[] }[] }).groups.flatMap((g) => g.packs);
  for (const id of listed) assert.ok(packs.includes(id), `listed pack ${id} is shipped`);
  const failures: string[] = [];
  for (const p of patterns) {
    for (const pack of packs) {
      for (const appearance of ["light", "dark"]) {
        const result = core.render(p.source, { pack, appearance });
        for (const d of result.errors) failures.push(`${p.id} in ${pack} (${appearance}): ${d}`);
        if (!result.html.includes("mkd-figure")) failures.push(`${p.id} in ${pack}: no figure`);
      }
    }
  }
  assert.deepEqual(failures, []);
});
