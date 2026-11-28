// IT-26 (R-WEB-004 TC-9, R-PACK-012 TC-1 step 5): the published site, as the Pages workflow
// assembles it, served by a plain static file server. GALLERY_URL names the served `/gallery/`;
// the documentation site is at its parent and the example site at `demos/` beside it.
// Run by .github/workflows/pages.yml through playwright.published.config.mjs; nothing is deployed
// when it fails.
import { expect, test } from "@playwright/test";

const GALLERY = new URL(process.env.GALLERY_URL ?? "http://127.0.0.1:8174/gallery/");
const SITE = new URL("../", GALLERY);
const TABS = ["Demo", "Gallery", "Definition", "Specification", "Implementation", "Reference"];

/** Record every request of `page`: those outside /gallery/ and those that fail (C30). */
function watch(page) {
  const seen = { outside: [], failed: [], errors: [] };
  page.on("request", (r) => {
    const url = r.url();
    if (!url.startsWith("data:") && !url.startsWith(GALLERY.href)) seen.outside.push(url);
  });
  page.on("requestfailed", (r) => seen.failed.push(`${r.failure()?.errorText ?? "failed"} ${r.url()}`));
  page.on("response", (r) => { if (r.status() >= 400) seen.failed.push(`${r.status()} ${r.url()}`); });
  page.on("pageerror", (e) => seen.errors.push(String(e)));
  return seen;
}

test("TC-9 steps 1-3: /gallery/ opens the home page, its gallery link the gallery; base and swiftui render; every request is under /gallery/", async ({ page }) => {
  test.setTimeout(240_000);
  const seen = watch(page);
  await page.goto(GALLERY.href);
  await page.waitForURL(new URL("pages/index.html", GALLERY).href);
  await page.locator('main a[href="packs.html"]').first().click();
  await page.waitForURL(new URL("pages/packs.html", GALLERY).href + "**");
  await page.waitForFunction(() => window.packGallery?.state === "ready");
  for (const pack of ["base", "swiftui"]) {
    const summary = await page.evaluate(async (id) => {
      await window.packGallery.select(id);
      return window.packGallery.renderAll();
    }, pack);
    expect(summary.pack).toBe(pack);
    expect(summary.mockups, `${pack}: mockups`).toBeGreaterThan(0);
    expect(summary.patterns.length, `${pack}: patterns`).toBeGreaterThan(0);
    expect(summary.empty, `${pack}: mockups without rendered content`).toEqual([]);
    expect(summary.errors, `${pack}: error diagnostics`).toEqual([]);
  }
  expect(seen.failed, "failed requests").toEqual([]);
  expect(seen.outside, "requests outside /gallery/").toEqual([]);
  expect(seen.errors, "page errors").toEqual([]);
});

test("TC-9 step 4: the assembled gallery holds the pages, the package and the shared files (C28)", async ({ request }) => {
  for (const path of ["pages/index.html", "pages/index.js", "pages/index.css", "pages/packs.html", "dist/mockitdown.js", "dist/shared/manifest.json",
    "shared/reference/index.json", "shared/patterns/index.json"]) {
    const r = await request.get(new URL(path, GALLERY).href);
    expect(r.status(), path).toBe(200);
  }
});

test("TC-9 step 5: both sites show the six header tabs, and Gallery links to /gallery/ (R-PACK-012.C6)", async ({ page }) => {
  // The documentation site is mounted at / (its first page is /definition/); the example site at /demos/.
  for (const path of ["definition/", "demos/"]) {
    await page.goto(new URL(path, SITE).href);
    const tabs = page.locator(".md-tabs__link");
    await expect(tabs, path).toHaveText(TABS);
    const href = await tabs.nth(1).getAttribute("href");
    expect(new URL(href, page.url()).pathname, `${path}: Gallery tab`).toMatch(/\/gallery\/$/);
  }
});
