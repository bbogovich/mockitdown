// R-WEB-004 TC-2 (C3, C4, C8): the core design patterns of shared/patterns/ are written in the core
// vocabulary and render in every shipped pack — listed in the gallery or hidden — without an error
// diagnostic. TC-5 (C14): a pack-specific pattern (`packs`) renders in each of its packs with the entry's
// device, chrome, menubar, app and windowed, without any diagnostic; swiftui has an iPhone, an iPad and a
// Mac app, the Mac app with the menu bar and an open menu.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { REPO, setup } from "./helpers.js";

const core = setup();
const PATTERNS = join(REPO, "shared", "patterns");

interface PatternEntry {
  id: string; title: string; file: string;
  packs?: string[]; device?: string; chrome?: string; menubar?: string; app?: string; windowed?: boolean;
}
const KEYS = new Set(["id", "title", "file", "packs", "device", "chrome", "menubar", "app", "windowed"]);

const index = JSON.parse(readFileSync(join(PATTERNS, "index.json"), "utf8")) as { patterns: PatternEntry[] };
const patterns = index.patterns.map((p) => ({ ...p, source: readFileSync(join(PATTERNS, p.file), "utf8") }));
const corePatterns = patterns.filter((p) => !p.packs);
const specific = patterns.filter((p) => p.packs);

/** The render options the gallery passes to the mockup element for `p` in `pack`. */
function options(p: PatternEntry, pack: string): Record<string, unknown> {
  const o: Record<string, unknown> = { pack };
  for (const k of ["device", "chrome", "menubar", "app"] as const) if (p[k] !== undefined) o[k] = p[k];
  if (p.windowed !== undefined) o.windowed = Boolean(p.windowed);
  return o;
}

test("the pattern index names at least the six required patterns (C3)", () => {
  const ids = corePatterns.map((p) => p.id);
  for (const id of ["sign-in", "list-detail", "settings", "dashboard", "data-table", "wizard"]) {
    assert.ok(ids.includes(id), `pattern ${id} is missing`);
  }
  const all = patterns.map((p) => p.id);
  assert.equal(new Set(all).size, all.length, "pattern ids are unique");
  for (const p of patterns) {
    assert.ok(p.title.trim(), `pattern ${p.id} has a title`);
    for (const k of Object.keys(p)) if (k !== "source") assert.ok(KEYS.has(k), `${p.id}: unknown key ${k}`);
  }
});

test("each core pattern uses only the core vocabulary: it renders in base without any diagnostic (C4)", () => {
  for (const p of corePatterns) {
    assert.ok(!/^\s*import\b/m.test(p.source), `${p.id} imports nothing (the gallery chooses the pack)`);
    assert.deepEqual(core.check(p.source, { pack: "base" }).map(String), [], p.id);
  }
});

test("TC-2: each core pattern renders in every shipped pack without an error diagnostic (C4)", () => {
  const packs = core.registry.ids();
  const listed = (JSON.parse(readFileSync(join(REPO, "shared", "reference", "index.json"), "utf8")) as
    { groups: { packs: string[] }[] }).groups.flatMap((g) => g.packs);
  for (const id of listed) assert.ok(packs.includes(id), `listed pack ${id} is shipped`);
  const failures: string[] = [];
  for (const p of corePatterns) {
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

test("TC-5: each pack-specific pattern renders in its packs with its options without a diagnostic (C14)", () => {
  const packs = core.registry.ids();
  const failures: string[] = [];
  for (const p of specific) {
    assert.ok(p.packs!.length > 0, `${p.id} names at least one pack`);
    for (const pack of p.packs!) {
      assert.ok(packs.includes(pack), `${p.id}: pack ${pack} is shipped`);
      for (const appearance of ["light", "dark"]) {
        const result = core.render(p.source, { ...options(p, pack), appearance });
        for (const d of result.diagnostics) failures.push(`${p.id} in ${pack} (${appearance}): ${d}`);
        if (!result.html.includes("mkd-figure")) failures.push(`${p.id} in ${pack}: no figure`);
      }
    }
  }
  assert.deepEqual(failures, []);
});

test("TC-5: swiftui shows an iPhone, an iPad and a Mac app with the menu bar (C14)", () => {
  const swift = specific.filter((p) => p.packs!.includes("swiftui"));
  const devices = new Set(swift.map((p) => p.device));
  for (const d of ["phone", "tablet", "desktop"]) assert.ok(devices.has(d), `a swiftui ${d} example`);
  const phone = swift.find((p) => p.device === "phone")!;
  assert.match(phone.source, /TabView/);
  assert.match(phone.source, /NavigationStack/);
  const tablet = swift.find((p) => p.device === "tablet")!;
  assert.match(tablet.source, /NavigationSplitView/);
  assert.match(tablet.source, /\bcontent:/);
  const mac = swift.find((p) => p.device === "desktop" && p.menubar)!;
  assert.ok(mac, "a desktop swiftui example with menubar");
  for (const s of ["NavigationSplitView", ".toolbar", ".commands", "CommandMenu", "CommandGroup"]) {
    assert.ok(mac.source.includes(s), `the Mac app uses ${s}`);
  }
  const html = core.render(mac.source, options(mac, "swiftui")).html;
  assert.ok(html.includes("mkd-menubar__dropdown"), "the Mac app shows an open menu");
});
