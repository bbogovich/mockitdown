// IT-15: the pack gallery (R-WEB-004) in a browser. pages/packs.html renders lazily; the tests use
// the page's `window.packGallery` hooks to select a pack and to render every mockup of it at once.
// The side panel, the element cards, the fragment, appearance and filter, the narrow layout; TC-1 and TC-4 over every pack.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { inspectMockups, mountMockups } from "./geometry.mjs";
import { CHUNKS, INDEX, open, PACKS, patternsFor, REFERENCES, renderPack } from "./gallery-helpers.mjs";

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
      const expected = reference.elements.length + reference.elements.filter((e) => e.variants_sample).length + patternsFor(id).length;
      expect(summary.mockups, id).toBe(expected);
      expect(summary.patterns, id).toEqual(patternsFor(id).map((p) => p.id));
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
  await expect(page).toHaveURL(/#pack=mui&tab=elements$/);
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

// R-WEB-004 TC-11 step 1 (C7): the boundary itself — 720 CSS pixels is wide, 719 narrow.
test("TC-11: at 720 px the side panel is shown, at 719 px it is behind the menu button (C7)", async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });
  const errors = await open(page, "#pack=base");
  const panel = page.locator("#packs");
  const menu = page.locator("#menu");
  await expect(panel).toBeVisible();
  await expect(menu).toBeHidden();
  await page.setViewportSize({ width: 719, height: 900 });
  await expect(panel).toBeHidden();
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(panel).toBeVisible();
  await page.setViewportSize({ width: 720, height: 900 });
  await expect(panel).toBeVisible();
  await expect(menu).toBeHidden();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  expect(errors).toEqual([]);
});

test("a missing or unknown #pack= selects the first pack of the side panel (C12)", async ({ page }) => {
  await open(page);
  await expect(page).toHaveURL(new RegExp(`#pack=${PACKS[0]}&tab=elements$`));
  await expect(page.locator(`a[data-pack="${PACKS[0]}"]`)).toHaveAttribute("aria-current", "page");
  await open(page, "#pack=no-such-pack");
  await expect(page).toHaveURL(new RegExp(`#pack=${PACKS[0]}&tab=elements$`));
});

// R-WEB-004 TC-11 step 4 (C32, C12): a hidden pack opens by its address, renders cleanly, and is never listed.
test("TC-11: #pack=lcars opens a hidden pack the side panel does not list (C32)", async ({ page }) => {
  test.setTimeout(240_000);
  const hidden = INDEX.hidden;
  expect(hidden).toEqual(["hologram", "lcars", "phosphor"]);
  const lcars = JSON.parse(readFileSync(new URL("../../../shared/reference/lcars.json", import.meta.url), "utf8"));
  const errors = await open(page, "#pack=lcars");
  await expect(page).toHaveURL(/#pack=lcars&tab=elements$/);
  await expect(page.locator("#pack-title")).toHaveText(lcars.name);
  await expect(page.locator(".pack-head .facts")).toContainText("lcars");
  await expect(page.locator("#tabbtn-elements")).toBeVisible();
  await expect(page.locator("#tabbtn-examples")).toBeVisible();
  expect(await page.$$eval("#tab-elements article.element", (els) => els.map((e) => e.dataset.name)))
    .toEqual(lcars.elements.map((e) => e.name));
  for (const id of hidden) await expect(page.locator(`#packs a[data-pack="${id}"]`)).toHaveCount(0);
  await expect(page.locator("#packs [aria-current]")).toHaveCount(0);
  for (const id of ["phosphor", "hologram"]) {
    const summary = await renderPack(page, id);
    expect(summary.pack, id).toBe(id);
    expect(summary.patterns, id).toEqual(patternsFor(id).map((p) => p.id));
    expect(summary.empty, `${id}: mockups without rendered content`).toEqual([]);
    expect(summary.errors, `${id}: error diagnostics`).toEqual([]);
    await expect(page.locator("#packs [aria-current]")).toHaveCount(0);
  }
  await open(page, "#pack=nope");
  await expect(page).toHaveURL(new RegExp(`#pack=${PACKS[0]}&tab=elements$`));
  expect(errors).toEqual([]);
});

// TC-4 (C13, C15) and R-REND-013 TC-1: after renderAll(), every element card's sample and variants are
// seen whole — fit frames as wide as their content, wide cards scrolling, no intersecting row children
// or variant cells, presentation surfaces at full size — and the rows hold again inside a 320-point
// phone frame.
for (let c = 0; c < CHUNKS; c++) {
  const chunk = PACKS.filter((_, i) => i % CHUNKS === c);
  test(`TC-4: packs ${chunk[0]}… show every element sample and variant whole (${c + 1}/${CHUNKS})`, async ({ page }) => {
    test.setTimeout(300_000);
    const errors = await open(page);
    for (const id of chunk) {
      await renderPack(page, id);
      expect(await page.locator("main .element mockitdown-mockup").count(), id).toBeGreaterThan(REFERENCES[id].elements.length - 1);
      const problems = await page.evaluate(inspectMockups, { selector: "main .element mockitdown-mockup" });
      expect(problems, `${id}: geometry at fit`).toEqual([]);
      const mockups = REFERENCES[id].elements.flatMap((e) => [
        { code: e.sample, label: `${id} ${e.name} (phone)`, attrs: { pack: id, device: "phone", width: "320", height: "640", caption: "false" } },
        ...(e.variants_sample ? [{ code: e.variants_sample, label: `${id} ${e.name} variants (phone)`,
          attrs: { pack: id, device: "phone", width: "320", height: "640", caption: "false" } }] : []),
      ]);
      expect(await page.evaluate(mountMockups, { id: "phone-check", width: 400, mockups })).toBe(mockups.length);
      const phone = await page.evaluate(inspectMockups, { selector: "#phone-check mockitdown-mockup", presentations: false, fit: false });
      expect(phone, `${id}: rows inside a 320-point phone frame`).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}
