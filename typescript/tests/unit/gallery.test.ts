// R-WEB-004 TC-9 (C28, C29): the published gallery's layout, assembled by scripts/assemble-gallery.mjs
// as the Pages workflow does — the development server's URL layout as static files.
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { PKG, REPO } from "./helpers.js";

let out: string;
let scratch: string;

before(async () => {
  const mod = (await import(new URL("../../scripts/assemble-gallery.mjs", import.meta.url).href)) as {
    assembleGallery(out: string): string[];
  };
  scratch = mkdtempSync(join(tmpdir(), "mkd-gallery-"));
  out = join(scratch, "gallery");
  mod.assembleGallery(out);
});
after(() => rmSync(scratch, { recursive: true, force: true }));

test("C28: pages/, dist/ and shared/reference, shared/patterns hold the served files", () => {
  for (const f of ["pages/index.html", "pages/index.js", "pages/index.css", "pages/packs.html", "pages/packs.js", "pages/snippet.js", "dist/mockitdown.js",
    "dist/shared/manifest.json", "shared/reference/index.json", "shared/patterns/index.json"]) {
    assert.ok(existsSync(join(out, f)), f);
  }
  assert.deepEqual(readdirSync(join(out, "pages")).sort(), readdirSync(join(PKG, "pages")).sort());
  assert.deepEqual(readdirSync(join(out, "shared")).sort(), ["patterns", "reference"]);
  assert.deepEqual(readdirSync(join(out, "shared", "patterns")).sort(),
    readdirSync(join(REPO, "shared", "patterns")).sort());
});

test("C29: index.html redirects to pages/index.html, the home page (R-WEB-006), with a meta refresh and a link", () => {
  const html = readFileSync(join(out, "index.html"), "utf8");
  assert.match(html, /<meta http-equiv="refresh" content="0; url=pages\/index\.html">/);
  assert.match(html, /<a href="pages\/index\.html">/);
});
