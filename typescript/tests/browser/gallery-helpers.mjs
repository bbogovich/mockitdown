// IT-15: the pack gallery (R-WEB-004) in a browser. pages/packs.html renders lazily; the tests use
// the page's `window.packGallery` hooks to select a pack and to render every mockup of it at once.
// Shared by the gallery-*.spec.mjs files: the pack index, the references and patterns, and the page helpers.
import { readFileSync } from "node:fs";

export const INDEX = JSON.parse(readFileSync(new URL("../../../shared/reference/index.json", import.meta.url), "utf8"));
export const PACKS = INDEX.groups.flatMap((g) => g.packs);
export const REFERENCES = Object.fromEntries(PACKS.map((id) => [id,
  JSON.parse(readFileSync(new URL(`../../../shared/reference/${id}.json`, import.meta.url), "utf8"))]));
export const PATTERNS = JSON.parse(readFileSync(new URL("../../../shared/patterns/index.json", import.meta.url), "utf8")).patterns;
/** The patterns the gallery shows for `pack`: the core ones and those naming it in `packs` (C14). */
export const patternsFor = (pack) => PATTERNS.filter((p) => !p.packs || p.packs.includes(pack));

export async function open(page, hash = "") {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`/pages/packs.html${hash}`);
  await page.waitForFunction(() => window.packGallery?.state === "ready");
  return errors;
}

/** Select `id` through the page and render all its mockups; the page's summary of them. */
export function renderPack(page, id) {
  return page.evaluate(async (pack) => {
    await window.packGallery.select(pack);
    return window.packGallery.renderAll();
  }, id);
}

/** The browser tests that cover every pack split the packs into this many parallel chunks. */
export const CHUNKS = 4;
