// IT-15: the pack gallery (R-WEB-004) in a browser. pages/packs.html renders lazily; the tests use
// the page's `window.packGallery` hooks to select a pack and to render every mockup of it at once.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const INDEX = JSON.parse(readFileSync(new URL("../../../shared/reference/index.json", import.meta.url), "utf8"));
const PACKS = INDEX.groups.flatMap((g) => g.packs);
const PATTERNS = JSON.parse(readFileSync(new URL("../../../shared/patterns/index.json", import.meta.url), "utf8")).patterns;

async function open(page, hash = "") {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`/pages/packs.html${hash}`);
  await page.waitForFunction(() => window.packGallery?.state === "ready");
  return errors;
}

/** Select `id` through the page and render all its mockups; the page's summary of them. */
function renderPack(page, id) {
  return page.evaluate(async (pack) => {
    await window.packGallery.select(pack);
    return window.packGallery.renderAll();
  }, id);
}

test("the side panel lists every pack in the Reference menu's groups and order (C1)", async ({ page }) => {
  const errors = await open(page);
  const groups = await page.$$eval("#packs .group", (els) => els.map((g) => ({
    title: g.querySelector("h2").textContent.trim(),
    packs: [...g.querySelectorAll("a[data-pack]")].map((a) => a.dataset.pack),
  })));
  expect(groups).toEqual(INDEX.groups.map((g) => ({ title: g.title, packs: g.packs })));
  await expect(page.locator("main")).toBeVisible();
  expect(errors).toEqual([]);
});

// TC-1 (C2, C3, V1): every pack, every element sample and every pattern, without an error.
const CHUNKS = 4;
for (let c = 0; c < CHUNKS; c++) {
  const chunk = PACKS.filter((_, i) => i % CHUNKS === c);
  test(`TC-1: packs ${chunk[0]}… render every element and pattern without an error (${c + 1}/${CHUNKS})`, async ({ page }) => {
    test.setTimeout(240_000);
    const errors = await open(page);
    for (const id of chunk) {
      const reference = JSON.parse(readFileSync(new URL(`../../../shared/reference/${id}.json`, import.meta.url), "utf8"));
      const summary = await renderPack(page, id);
      expect(summary.pack, id).toBe(id);
      expect(summary.elements, id).toEqual(reference.elements.map((e) => e.name));
      const expected = reference.elements.length + reference.elements.filter((e) => e.variants_sample).length + PATTERNS.length;
      expect(summary.mockups, id).toBe(expected);
      expect(summary.patterns, id).toEqual(PATTERNS.map((p) => p.id));
      expect(summary.empty, `${id}: mockups without rendered content`).toEqual([]);
      expect(summary.errors, `${id}: error diagnostics`).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test("an element card shows name, role, arguments, defaults, variants and doc (C2)", async ({ page }) => {
  await open(page, "#pack=tailwind");
  const card = page.locator('.element[data-name="Button"]');
  await expect(card.locator("h3")).toHaveText("Button");
  await expect(card.locator(".role")).toHaveText("button");
  await expect(card.locator(".params")).toContainText("label");
  await expect(card.locator(".defaults")).toContainText("variant");
  await expect(card.locator(".variants")).toContainText("outline");
  await expect(card.locator(".doc")).toContainText("variant:");
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator("mockitdown-mockup")).toHaveCount(2);
});

test("TC-3: packs.html#pack=carbon opens Carbon; selecting a pack updates the fragment (C5)", async ({ page }) => {
  const errors = await open(page, "#pack=carbon");
  await expect(page.locator("#pack-title")).toHaveText("Carbon");
  await expect(page.locator('a[data-pack="carbon"]')).toHaveAttribute("aria-current", "page");
  await page.locator('a[data-pack="mui"]').click();
  await expect(page).toHaveURL(/#pack=mui$/);
  await expect(page.locator("#pack-title")).toHaveText("Material UI");
  await page.reload();
  await page.waitForFunction(() => window.packGallery?.state === "ready");
  await expect(page.locator("#pack-title")).toHaveText("Material UI");
  await page.goBack();
  await expect(page.locator("#pack-title")).toHaveText("Carbon");
  expect(errors).toEqual([]);
});

test("light and dark appearance, and the element-name filter (C6)", async ({ page }) => {
  await open(page, "#pack=base");
  await page.locator("#appearance").selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-appearance", "dark");
  const first = page.locator(".element mockitdown-mockup").first();
  await expect(first).toHaveAttribute("appearance", "dark");
  const summary = await page.evaluate(() => window.packGallery.renderAll());
  expect(summary.errors).toEqual([]);
  const dark = await page.evaluate(() => [...document.querySelectorAll("mockitdown-mockup")].every((m) => m.getAttribute("appearance") === "dark"));
  expect(dark).toBe(true);

  await page.locator("#filter").fill("chart");
  const visible = await page.$$eval(".element", (els) => els.filter((e) => !e.hidden).map((e) => e.dataset.name));
  expect(visible.length).toBeGreaterThan(5);
  for (const name of visible) expect(name.toLowerCase()).toContain("chart");
  await expect(page.locator("#element-count")).toContainText(`${visible.length} of`);
  await page.locator("#filter").fill("");
  expect(await page.$$eval(".element", (els) => els.filter((e) => e.hidden).length)).toBe(0);
});

test("under 720 px the side panel collapses into a menu (C7)", async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 900 });
  await open(page, "#pack=base");
  const panel = page.locator("#packs");
  await expect(panel).toBeHidden();
  await page.locator("#menu").click();
  await expect(panel).toBeVisible();
  await page.locator('a[data-pack="android"]').click();
  await expect(panel).toBeHidden();
  await expect(page.locator("#pack-title")).toHaveText("Android · Jetpack Compose");
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(panel).toBeVisible();
  await expect(page.locator("#menu")).toBeHidden();
});

test("a missing or unknown #pack= selects the first pack of the side panel (C12)", async ({ page }) => {
  await open(page);
  await expect(page).toHaveURL(new RegExp(`#pack=${PACKS[0]}$`));
  await expect(page.locator(`a[data-pack="${PACKS[0]}"]`)).toHaveAttribute("aria-current", "page");
  await open(page, "#pack=no-such-pack");
  await expect(page).toHaveURL(new RegExp(`#pack=${PACKS[0]}$`));
});
