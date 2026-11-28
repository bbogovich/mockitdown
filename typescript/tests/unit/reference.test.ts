// R-WEB-001 TC-5 (C13, C17): the reference data in the package. `npm run build` copies
// shared/reference/index.json and every shared/reference/<pack>.json into dist/shared/reference/,
// lists them under `reference` in dist/shared/manifest.json and not under `files`, and
// `loadAssetsFromUrl` (which loads what `files` lists) fetches none of them. `copy-shared.mjs --check`
// (run below as `npm test` runs it) fails when a reference copy differs.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { PKG, REPO } from "./helpers.js";

const MANIFEST = join(PKG, "dist/shared/manifest.json");
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8")) as { packs: string[]; files: string[]; reference?: string[] };

test("the manifest lists reference/index.json and one reference/<pack>.json per pack under `reference` (C13, C17)", () => {
  // The expected list is built from shared/reference/ itself, not from the script's code.
  const expected = readdirSync(join(REPO, "shared/reference")).filter((f) => f.endsWith(".json")).sort().map((f) => `reference/${f}`);
  assert.ok(expected.includes("reference/index.json"));
  assert.ok(Array.isArray(manifest.reference), "manifest.reference is a list");
  assert.deepEqual([...manifest.reference!].sort(), expected);
  for (const id of manifest.packs) assert.ok(manifest.reference!.includes(`reference/${id}.json`), id);
  assert.deepEqual(manifest.files.filter((f) => f.startsWith("reference/")), [], "no reference file under `files`");
  for (const f of manifest.reference!) {
    assert.equal(readFileSync(join(PKG, "dist/shared", f), "utf8"), readFileSync(join(REPO, "shared", f), "utf8"), `dist/shared/${f}`);
  }
});

test("copy-shared.mjs --check fails when a reference copy differs (TC-5)", () => {
  const run = (): number => spawnSync("node", [join(PKG, "scripts/copy-shared.mjs"), "--check"], { cwd: PKG, encoding: "utf8" }).status ?? -1;
  assert.equal(run(), 0);
  const copy = join(PKG, "dist/shared/reference/base.json");
  const original = readFileSync(copy, "utf8");
  try {
    writeFileSync(copy, original + " ");
    assert.equal(run(), 1);
  } finally {
    writeFileSync(copy, original);
  }
  assert.equal(run(), 0);
});

test("loadAssetsFromUrl requests no reference file (C17)", async () => {
  const { loadAssetsFromUrl } = await import("../../dist/mockitdown.js");
  const base = new URL("../../dist/shared/", import.meta.url);
  const requested: string[] = [];
  const fetch = async (url: string): Promise<{ ok: boolean; status: number; text(): Promise<string> }> => {
    requested.push(url);
    const path = new URL(url).pathname.slice(base.pathname.length);
    return { ok: true, status: 200, text: async () => readFileSync(join(PKG, "dist/shared", decodeURIComponent(path)), "utf8") };
  };
  const loaded = await loadAssetsFromUrl(base.href, { fetch });
  assert.ok(loaded.packs.includes("base"));
  assert.ok(requested.some((u) => u.endsWith("/packs/base/pack.json")));
  assert.deepEqual(requested.filter((u) => u.includes("/reference/")), []);
});
