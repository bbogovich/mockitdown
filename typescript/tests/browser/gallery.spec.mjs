// IT-15: the pack gallery (R-WEB-004) in a browser. pages/packs.html renders lazily; the tests use
// the page's `window.packGallery` hooks to select a pack and to render every mockup of it at once.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { inspectMockups, mountMockups } from "./geometry.mjs";

const INDEX = JSON.parse(readFileSync(new URL("../../../shared/reference/index.json", import.meta.url), "utf8"));
const PACKS = INDEX.groups.flatMap((g) => g.packs);
const REFERENCES = Object.fromEntries(PACKS.map((id) => [id,
  JSON.parse(readFileSync(new URL(`../../../shared/reference/${id}.json`, import.meta.url), "utf8"))]));
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

const PRESENTING = ["Alert", "Dialog", "Sheet", "Popover", "Toast", "Tooltip", "ConfirmationDialog"];

// R-DEV-008 TC-1 (C1–C3, C6) and TC-2 (C4, C5): each presenting element alone at fit, in every pack.
test("R-DEV-008 TC-1/TC-2: presentations alone at fit are drawn whole in every pack", async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await open(page);
  const mockups = PACKS.flatMap((id) => REFERENCES[id].elements
    .filter((e) => PRESENTING.includes(e.name) && ["dialog", "toast", "tooltip"].includes(e.role))
    .map((e) => ({
      code: e.role === "toast" ? `${e.name}("Message")` : `${e.name}("Title") { Text("Content"); Button("Action") }`,
      label: `${id} ${e.name}`, attrs: { pack: id, device: "fit", caption: "false" },
    })));
  expect(mockups.length).toBeGreaterThan(PACKS.length * 4);
  await page.evaluate(mountMockups, { id: "alone", width: 900, mockups });
  expect(await page.evaluate(inspectMockups, { selector: "#alone mockitdown-mockup" })).toEqual([]);
  // A tooltip without content still shows an anchor (a placeholder button).
  await page.evaluate(mountMockups, { id: "alone", width: 900, mockups: PACKS.map((id) => (
    { code: 'Tooltip("Copied")', label: `${id} Tooltip alone`, attrs: { pack: id, device: "fit", caption: "false" } })) });
  expect(await page.evaluate(inspectMockups, { selector: "#alone mockitdown-mockup" })).toEqual([]);
  expect(errors).toEqual([]);
});

// R-DEV-008.V1: eight captioned toggles at fit in a 300-pixel host keep their natural width; the host scrolls.
test("R-DEV-008 V1: a fit row of eight toggles in a 300 px host keeps its width and scrolls", async ({ page }) => {
  const errors = await open(page);
  const code = `HStack(alignment: .top, spacing: 16) {\n${Array.from({ length: 8 }, (_, i) =>
    `  VStack(alignment: .leading, spacing: 4) { Toggle("Label"); Text("variant ${i + 1}").font(.caption) }`).join("\n")}\n}`;
  await page.evaluate(mountMockups, { id: "narrow", width: 300,
    mockups: PACKS.map((id) => ({ code, label: `${id} toggles`, attrs: { pack: id, device: "fit", caption: "false" } })) });
  const rows = await page.$$eval("#narrow mockitdown-mockup", (els) => els.map((m) => {
    const frame = m.shadowRoot.querySelector(".mkd-frame");
    const cell = frame.closest(".mkd-cell");
    return { label: m.dataset.label, width: frame.getBoundingClientRect().width, scroll: frame.scrollWidth,
      client: frame.clientWidth, cellScrolls: cell.scrollWidth > cell.clientWidth };
  }));
  for (const r of rows) {
    expect(r.scroll, `${r.label}: frame keeps its content width`).toBeLessThanOrEqual(r.client + 1);
    expect(r.width, `${r.label}: frame wider than the host`).toBeGreaterThan(300);
    expect(r.cellScrolls, `${r.label}: the host scrolls`).toBe(true);
  }
  expect(await page.evaluate(inspectMockups, { selector: "#narrow mockitdown-mockup", presentations: false, fit: false })).toEqual([]);
  expect(errors).toEqual([]);
});

// R-REND-013 TC-2 (C4): a long message wraps inside its bubble, the bubble at most 75% of its container.
test("R-REND-013 TC-2: MessageBubble with a 40-word text wraps inside the bubble in every pack", async ({ page }) => {
  const errors = await open(page);
  const words = Array.from({ length: 40 }, (_, i) => ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur"][i % 6]).join(" ");
  const mockups = PACKS.flatMap((id) => [
    { code: `MessageBubble("${words}")`, label: `${id} fit`, attrs: { pack: id, device: "fit", caption: "false" } },
    { code: 'MessageBubble("Text")', label: `${id} fit, one word`, attrs: { pack: id, device: "fit", caption: "false" } },
    { code: `MessageBubble("${words}")`, label: `${id} phone`, attrs: { pack: id, device: "phone", width: "320", height: "400", caption: "false" } },
  ]);
  await page.evaluate(mountMockups, { id: "bubbles", width: 900, mockups });
  const problems = await page.$$eval("#bubbles mockitdown-mockup", (els) => els.flatMap((m) => {
    const out = [];
    const message = m.shadowRoot.querySelector(".mkd-message");
    const bubble = message?.querySelector(".mkd-message__bubble");
    if (!bubble) return [`${m.dataset.label}: no bubble`];
    const b = bubble.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(bubble);
    for (const line of range.getClientRects()) {
      if (line.left < b.left - 1 || line.right > b.right + 1 || line.top < b.top - 1 || line.bottom > b.bottom + 1) {
        out.push(`${m.dataset.label}: a line of text (${Math.round(line.left)}–${Math.round(line.right)}) leaves the bubble (${Math.round(b.left)}–${Math.round(b.right)})`);
        break;
      }
    }
    const container = message.getBoundingClientRect().width;
    if (b.width > container * 0.75 + 1) out.push(`${m.dataset.label}: bubble ${Math.round(b.width)} px is wider than 75% of ${Math.round(container)} px`);
    return out;
  }));
  expect(problems).toEqual([]);
  expect(errors).toEqual([]);
});
