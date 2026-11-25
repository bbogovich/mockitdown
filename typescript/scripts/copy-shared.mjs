#!/usr/bin/env node
// Copy the shared assets the package publishes from the repository's shared/ into dist/shared/
// (R-WEB-001.C2), and the repository LICENSE beside package.json. The TypeScript counterpart of
// python/tools/sync_shared.py: shared/ is the only place these files are written (R-REPO-002).
//
//   node scripts/copy-shared.mjs           copy (run by `npm run build`)
//   node scripts/copy-shared.mjs --check   exit 1 and list what differs
//
// dist/shared/ layout (the same names as in the Python package):
//   page.css  icons.json  vocabulary.json  packs/<id>/pack.json  packs/<id>/pack.css
//   manifest.json   {"packs": [ids, sorted], "files": [every copied path]} for loaders

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = join(PKG, "..", "shared");
const OUT = join(PKG, "dist", "shared");

const FIXED = { "css/page.css": "page.css", "icons/icons.json": "icons.json", "language/vocabulary.json": "vocabulary.json" };
const PACK_FILES = ["pack.json", "pack.css"];

function pairs() {
  const out = [[join(PKG, "..", "LICENSE"), join(PKG, "LICENSE")]];
  for (const [src, dst] of Object.entries(FIXED)) out.push([join(SHARED, src), join(OUT, dst)]);
  for (const id of packIds()) {
    for (const name of PACK_FILES) {
      const src = join(SHARED, "packs", id, name);
      if (existsSync(src)) out.push([src, join(OUT, "packs", id, name)]);
    }
  }
  return out;
}

function packIds() {
  return readdirSync(join(SHARED, "packs"))
    .filter((d) => existsSync(join(SHARED, "packs", d, "pack.json")))
    .sort();
}

function manifest() {
  const files = pairs().filter(([, d]) => d.startsWith(OUT)).map(([, d]) => d.slice(OUT.length + 1).split("\\").join("/"));
  return JSON.stringify({ packs: packIds(), files }, null, 2) + "\n";
}

function same(a, b) {
  return existsSync(b) && readFileSync(a).equals(readFileSync(b));
}

if (!existsSync(SHARED) || !statSync(SHARED).isDirectory()) {
  console.error(`no shared/ at ${SHARED}`);
  process.exit(2);
}

if (process.argv.includes("--check")) {
  const bad = pairs().filter(([s, d]) => !same(s, d)).map(([, d]) => d);
  const m = join(OUT, "manifest.json");
  if (!existsSync(m) || readFileSync(m, "utf8") !== manifest()) bad.push(m);
  for (const p of bad) console.log(`differs or missing: ${p}`);
  process.exit(bad.length ? 1 : 0);
}

// Remove packs that left shared/, then copy what differs.
if (existsSync(join(OUT, "packs"))) {
  const keep = new Set(packIds());
  for (const d of readdirSync(join(OUT, "packs"))) if (!keep.has(d)) rmSync(join(OUT, "packs", d), { recursive: true });
}
let n = 0;
for (const [src, dst] of pairs()) {
  if (!same(src, dst)) {
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
    n++;
  }
}
writeFileSync(join(OUT, "manifest.json"), manifest());
console.log(`copied ${n} file(s) from shared/ into dist/shared/ (${packIds().length} packs)`);
