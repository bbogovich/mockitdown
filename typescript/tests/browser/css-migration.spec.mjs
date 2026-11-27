// R-PACK-018 TC-3 (C10): moving pack rules into `base` or into a stylesheet partial must not change how
// any pack looks. Not part of `npm test`; run by an issue that moves rules, once before and once after:
//
//   npm run build
//   MIGRATION_PACKS=lisa,mac-classic MIGRATION_BASELINE=1 npx playwright test -c playwright.migration.config.mjs
//   … change the stylesheets, npm run build …
//   MIGRATION_PACKS=lisa,mac-classic npx playwright test -c playwright.migration.config.mjs
//
// MIGRATION_PACKS names every pack whose pack.css changes. A pack the gallery lists is captured as the
// gallery shows it (#pack=<id>&tab=elements and &tab=examples, after renderAll()); a pack the gallery does
// not list (an easter egg) is captured on the same page from its conformance sample and one card per
// element. Each capture is a full-page screenshot at 1280 × 800 in light and in dark appearance, compared
// pixel by pixel (maxDiffPixels: 0) with the baseline in migration-baseline/.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { mountMockups } from "./geometry.mjs";
import { open, PACKS } from "./gallery-helpers.mjs";

const NAMED = (process.env.MIGRATION_PACKS || "").split(",").map((s) => s.trim()).filter(Boolean);
if (!NAMED.length) throw new Error("MIGRATION_PACKS must name the packs whose pack.css changes");

const shared = (path) => new URL(`../../../shared/${path}`, import.meta.url);

/** The mockups that stand for a pack the gallery does not list. */
function hiddenMockups(id) {
  const pack = JSON.parse(readFileSync(shared(`packs/${id}/pack.json`), "utf8"));
  let sample = "";
  try { sample = readFileSync(shared(`conformance/pack-${id}.mockitdown`), "utf8"); } catch { /* none */ }
  const attrs = { pack: id, caption: "false" };
  const cards = Object.keys(pack.elements).sort().map((name) => (
    { code: `${name}("Sample")`, label: `${id} ${name}`, attrs: { ...attrs, device: "fit" } }));
  return sample ? [{ code: sample, label: `${id} sample`, attrs }, ...cards] : cards;
}

test.use({ viewport: { width: 1280, height: 800 } });

for (const id of NAMED) {
  for (const appearance of ["light", "dark"]) {
    if (PACKS.includes(id)) {
      for (const tab of ["elements", "examples"]) {
        test(`${id} ${tab} ${appearance}`, async ({ page }) => {
          test.setTimeout(300_000);
          await page.addInitScript((a) => localStorage.setItem("mockitdown.gallery.appearance", a), appearance);
          const errors = await open(page, `#pack=${id}&tab=${tab}`);
          await page.evaluate(() => window.packGallery.renderAll());
          await expect(page.locator("html")).toHaveAttribute("data-appearance", appearance);
          await expect(page).toHaveScreenshot(`${id}-${tab}-${appearance}.png`, { fullPage: true, maxDiffPixels: 0 });
          expect(errors).toEqual([]);
        });
      }
    } else {
      test(`${id} (not listed) ${appearance}`, async ({ page }) => {
        test.setTimeout(300_000);
        const errors = await open(page);
        // the gallery's own page would cover them
        await page.evaluate(() => { for (const el of document.body.children) el.style.display = "none"; });
        const mockups = hiddenMockups(id).map((m) => ({ ...m, attrs: { ...m.attrs, appearance } }));
        await page.evaluate(mountMockups, { id: "migration", width: 1280, mockups });
        await expect(page.locator("#migration")).toHaveScreenshot(`${id}-${appearance}.png`, { maxDiffPixels: 0 });
        expect(errors).toEqual([]);
      });
    }
  }
}
