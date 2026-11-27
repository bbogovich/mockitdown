// IT-15: the pack gallery (R-WEB-004) in a browser. pages/packs.html renders lazily; the tests use
// the page's `window.packGallery` hooks to select a pack and to render every mockup of it at once.
// The Examples tab: pack-specific examples, the tabs, example geometry and Show source (TC-5 to TC-8).
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { inspectMockups } from "./geometry.mjs";
import { CHUNKS, open, PATTERNS, PACKS, patternsFor, renderPack } from "./gallery-helpers.mjs";

// R-WEB-004 TC-5 (C14): pack-specific example applications. At #pack=swiftui the examples include an iPhone,
// an iPad and a Mac app, each mockup carrying its entry's device (and the other keys); the Mac app draws the
// menu bar with an open menu over its window; another pack shows none of them.
test("TC-5: swiftui shows its iPhone, iPad and Mac example apps; other packs do not (C14)", async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await open(page, "#pack=swiftui");
  const summary = await renderPack(page, "swiftui");
  expect(summary.errors).toEqual([]);
  expect(summary.empty).toEqual([]);
  await page.evaluate(() => window.packGallery.tab("examples"));
  const specific = PATTERNS.filter((p) => p.packs?.includes("swiftui"));
  expect(summary.patterns).toEqual(expect.arrayContaining(specific.map((p) => p.id)));
  const shown = await page.evaluate(() => [...document.querySelectorAll(".pattern")].map((s) => {
    const m = s.querySelector("mockitdown-mockup");
    const attrs = Object.fromEntries(["device", "chrome", "menubar", "app", "windowed"]
      .filter((k) => m.hasAttribute(k)).map((k) => [k, m.getAttribute(k)]));
    const r = m.shadowRoot;
    const box = (sel) => {
      const e = r.querySelector(sel);
      if (!e || getComputedStyle(e).display === "none") return null;
      const x = e.getBoundingClientRect();
      return { l: x.left, r: x.right, t: x.top, b: x.bottom, w: x.width, h: x.height };
    };
    const sel = r.querySelector('.mkd-table tr[aria-selected="true"] td');
    const zebra = r.querySelector('.mkd-table tbody tr:nth-child(even):not([aria-selected="true"]) td');
    const selected = sel ? { fg: getComputedStyle(sel).color, bg: getComputedStyle(sel).backgroundColor,
      zebra: zebra ? getComputedStyle(zebra).backgroundColor : null } : null;
    return { id: s.dataset.pattern, attrs, selected, device: r.querySelector(".mkd-frame")?.dataset.device ?? null,
      bar: box(".mkd-menubar"), menu: box(".mkd-menubar__dropdown"), window: box(".mkd-window"),
      tabbar: box(".mkd-tabs__bar"), sidebar: box("[data-col=\"sidebar\"]"), content: box("[data-col=\"content\"]") };
  }));
  const byId = Object.fromEntries(shown.map((s) => [s.id, s]));
  for (const p of specific) {
    const s = byId[p.id];
    for (const k of ["device", "chrome", "menubar", "app"]) if (p[k] !== undefined) expect(s.attrs[k], `${p.id} ${k}`).toBe(String(p[k]));
    if (p.windowed !== undefined) expect(s.attrs.windowed, `${p.id} windowed`).toBe(String(p.windowed));
    if (p.device !== undefined) expect(s.device, `${p.id} frame device`).toBe(p.device);
  }
  const devices = specific.map((p) => p.device);
  expect(devices).toEqual(expect.arrayContaining(["phone", "tablet", "desktop"]));
  const tablet = byId[specific.find((p) => p.device === "tablet").id];
  expect(tablet.sidebar).not.toBeNull();
  expect(tablet.content).not.toBeNull();
  expect(byId[specific.find((p) => p.device === "phone").id].tabbar).not.toBeNull();
  const mac = byId[specific.find((p) => p.device === "desktop" && p.menubar).id];
  expect(mac.bar).not.toBeNull();
  expect(mac.menu).not.toBeNull();
  expect(mac.menu.t).toBeGreaterThanOrEqual(mac.bar.b - 1);
  expect(mac.menu.b).toBeGreaterThan(mac.window.t);
  // R-PACK-014.C14: the selected table row (an even, zebra-striped one) is accent with white text
  if (mac.selected) {
    expect(mac.selected.fg).toBe("rgb(255, 255, 255)");
    expect(mac.selected.bg).not.toBe(mac.selected.zebra);
  }
  // another pack shows only the core patterns
  const other = await renderPack(page, "mui");
  expect(other.patterns).toEqual(patternsFor("mui").map((p) => p.id));
  for (const p of specific.filter((q) => !q.packs.includes("mui"))) expect(other.patterns).not.toContain(p.id);
  expect(other.errors).toEqual([]);
  expect(errors).toEqual([]);
});

// R-WEB-004 TC-6 (C16, C17, C18, C20): the Elements and Examples tabs. Elements is the default; a deep link
// opens Examples at its first example with no element card visible; selecting a pack keeps the tab, reloading
// restores it; the in-tab index scrolls to each example; packGallery.tab() resolves when the tab is shown.
test("TC-6: Elements and Examples tabs, kept in the fragment, with an in-tab index (C16–C18, C20)", async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await open(page, "#pack=mui");
  const tabs = page.locator('#main [role="tab"]');
  await expect(tabs).toHaveText([/^Elements\d*$/, /^Examples\d*$/]);
  await expect(page.locator('#main [role="tab"][aria-selected="true"]')).toHaveText(/^Elements/);
  await expect(page.locator("#tab-elements")).toBeVisible();
  await expect(page.locator("#tab-examples")).toBeHidden();
  await expect(page.locator("#filter")).toBeVisible();
  await expect(page.locator(".pack-head")).toBeVisible();
  await expect(page).toHaveURL(/#pack=mui&tab=elements$/);

  // a deep link: Examples, the first example in view, no element card visible (C16, C17)
  await page.goto("/pages/packs.html#pack=carbon&tab=examples");
  await page.reload();
  await page.waitForFunction(() => window.packGallery?.state === "ready");
  await expect(page.locator("#pack-title")).toHaveText("Carbon");
  await expect(page.locator('#main [role="tab"][aria-selected="true"]')).toHaveText(/^Examples/);
  await expect(page.locator("#tab-elements")).toBeHidden();
  await expect(page.locator("#filter")).toBeHidden();
  await expect(page.locator(".pattern").first()).toBeInViewport();
  expect(await page.$$eval(".element", (els) => els.filter((e) => e.checkVisibility()).length)).toBe(0);
  await expect(page.locator(".pattern mockitdown-mockup").first()).toBeAttached();

  // C20: the examples in index order, with an index linking to each
  const order = patternsFor("carbon").map((p) => p.id);
  expect(await page.$$eval(".pattern", (els) => els.map((e) => e.dataset.pattern))).toEqual(order);
  const links = page.locator("#example-index a[data-example]");
  expect(await links.evaluateAll((as) => as.map((a) => a.dataset.example))).toEqual(order);
  for (const id of [order[order.length - 1], order[5], order[1]]) {
    await links.locator(`xpath=self::*[@data-example="${id}"]`).click();
    await expect(page.locator(`.pattern[data-pattern="${id}"] h3`)).toBeInViewport();
    await expect(page).toHaveURL(/#pack=carbon&tab=examples$/);
  }

  // C17: selecting another pack keeps the tab; reloading restores it
  await page.locator('a[data-pack="fluent"]').click();
  await expect(page).toHaveURL(/#pack=fluent&tab=examples$/);
  await expect(page.locator("#pack-title")).toHaveText("Fluent (WinUI 3)");
  await expect(page.locator("#tab-examples")).toBeVisible();
  await page.reload();
  await page.waitForFunction(() => window.packGallery?.state === "ready");
  await expect(page.locator("#tab-examples")).toBeVisible();
  await expect(page.locator("#tab-elements")).toBeHidden();

  // clicking a tab switches it and updates the fragment
  await tabs.filter({ hasText: "Elements" }).click();
  await expect(page).toHaveURL(/#pack=fluent&tab=elements$/);
  await expect(page.locator("#tab-elements")).toBeVisible();
  await expect(page.locator(".element").first()).toBeInViewport();

  // C18: tab(name) resolves when the tab is shown; an unknown tab selects Elements
  const shown = await page.evaluate(async () => {
    await window.packGallery.tab("examples");
    const a = [!document.getElementById("tab-examples").hidden, location.hash];
    await window.packGallery.tab("nonsense");
    return [...a, !document.getElementById("tab-elements").hidden, location.hash];
  });
  expect(shown).toEqual([true, "#pack=fluent&tab=examples", true, "#pack=fluent&tab=elements"]);
  await page.goto("/pages/packs.html#pack=gtk&tab=bogus");
  await page.reload();
  await page.waitForFunction(() => window.packGallery?.state === "ready");
  await expect(page.locator("#tab-elements")).toBeVisible();
  await expect(page).toHaveURL(/#pack=gtk&tab=elements$/);

  // C18: renderAll() renders both tabs' mockups
  const summary = await page.evaluate(() => window.packGallery.renderAll());
  expect(summary.patterns).toEqual(patternsFor("gtk").map((p) => p.id));
  expect(summary.empty).toEqual([]);
  expect(summary.errors).toEqual([]);
  expect(await page.$$eval("#tab-examples mockitdown-mockup", (els) => els.length)).toBe(patternsFor("gtk").length);
  expect(errors).toEqual([]);
});

// R-WEB-004 TC-7 (C19) with TC-4's geometry: every core and pack-specific example, in the Examples tab at its
// device size, has no intersecting row children and its presentation surfaces whole, in every pack.
for (let c = 0; c < CHUNKS; c++) {
  const chunk = PACKS.filter((_, i) => i % CHUNKS === c);
  test(`TC-7: packs ${chunk[0]}… show every example without overlaps (${c + 1}/${CHUNKS})`, async ({ page }) => {
    test.setTimeout(300_000);
    const errors = await open(page, "#pack=base&tab=examples");
    const problems = [];
    for (const id of chunk) {
      const summary = await renderPack(page, id);
      expect(summary.errors, `${id}: error diagnostics`).toEqual([]);
      expect(summary.empty, `${id}: examples without content`).toEqual([]);
      await page.evaluate(() => window.packGallery.tab("examples"));
      expect(await page.locator("main .pattern mockitdown-mockup").count(), id).toBe(patternsFor(id).length);
      const found = await page.evaluate(inspectMockups, { selector: "main .pattern mockitdown-mockup" });
      problems.push(...found.map((p) => `${id}: ${p}`));
    }
    expect(problems, "geometry of the examples").toEqual([]);
    expect(errors).toEqual([]);
  });
}

// R-WEB-004 TC-8 (C21–C26): every example of the Examples tab has a Show source toggle whose block holds the
// snippet reproducing the example in the selected pack, with Copy; toggling never touches the mockup.
const SNIPPET_KEYS = ["device", "chrome", "menubar", "app", "windowed"];
const escapeAttr = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
/** The snippet of C22, built here from the index entry and the pattern file, independently of the page. */
function expectedSnippet(p, pack) {
  const text = readFileSync(new URL(`../../../shared/patterns/${p.file}`, import.meta.url), "utf8").replace(/\r?\n$/, "");
  const attrs = [["pack", pack], ...SNIPPET_KEYS.filter((k) => p[k] !== undefined && p[k] !== null).map((k) => [k, p[k]])];
  return `<mockitdown-mockup${attrs.map(([k, v]) => ` ${k}="${escapeAttr(v)}"`).join("")}>\n`
    + `<script type="text/mockitdown">\n${text}\n</script>\n</mockitdown-mockup>`;
}

for (const pack of ["base", "swiftui"]) {
  test(`TC-8: ${pack} — Show source on every example, with the reproducing snippet and Copy (C21–C26)`, async ({ page }) => {
    test.setTimeout(180_000);
    const errors = await open(page, `#pack=${pack}&tab=examples`);
    const summary = await page.evaluate(() => window.packGallery.renderAll());
    expect(summary.errors).toEqual([]);
    const ids = patternsFor(pack).map((p) => p.id);
    expect(summary.patterns).toEqual(ids);
    // Watch every example's mockup: a re-render replaces its shadow root's content (C25).
    await page.evaluate(() => {
      window.__mutations = {};
      for (const sec of document.querySelectorAll(".pattern")) {
        const m = sec.querySelector("mockitdown-mockup");
        m.__probe = sec.dataset.pattern;
        window.__mutations[sec.dataset.pattern] = 0;
        new MutationObserver((list) => { window.__mutations[sec.dataset.pattern] += list.length; })
          .observe(m.shadowRoot, { childList: true, subtree: true, attributes: true, characterData: true });
        new MutationObserver((list) => { window.__mutations[sec.dataset.pattern] += list.length; })
          .observe(m, { attributes: true });
      }
    });
    const box = (id) => page.evaluate((pid) => {
      const m = document.querySelector(`.pattern[data-pattern="${pid}"] mockitdown-mockup`);
      const r = m.getBoundingClientRect();
      return { probe: m.__probe, left: r.left + scrollX, top: r.top + scrollY, width: r.width, height: r.height };
    }, id);

    for (const p of patternsFor(pack)) {
      const section = page.locator(`.pattern[data-pattern="${p.id}"]`);
      const button = section.getByRole("button", { name: /^(Show|Hide) source$/ });
      // 1. one Show source button, collapsed, controlling a hidden block (C21)
      await expect(button).toHaveCount(1);
      await expect(button).toHaveText("Show source");
      await expect(button).toHaveAttribute("aria-expanded", "false");
      const controls = await button.getAttribute("aria-controls");
      expect(controls, p.id).toBeTruthy();
      const block = page.locator(`[id="${controls}"]`);
      await expect(block).toBeHidden();
      expect(await section.locator(`[id="${controls}"]`).count(), `${p.id}: the block is in its example`).toBe(1);

      // 2. showing it: Hide source, expanded, the snippet (C21, C22, C26)
      const before = await box(p.id);
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await expect(button).toHaveText("Hide source");
      await expect(block).toBeVisible();
      const expected = expectedSnippet(p, pack);
      expect(await block.locator("pre").textContent(), p.id).toBe(expected);
      expect(await page.evaluate((id) => window.packGallery.source(id), p.id), p.id).toBe(expected);
      for (const k of ["caption", "label", "appearance"]) expect(expected.includes(` ${k}=`)).toBe(false);
      // the block is below the mockup
      const blockTop = await block.evaluate((b) => b.getBoundingClientRect().top + scrollY);
      expect(blockTop, p.id).toBeGreaterThanOrEqual(before.top + before.height - 1);

      // 3. the same mockup, not re-rendered, not resized (C25)
      expect(await box(p.id), p.id).toEqual(before);
      expect(await page.evaluate((id) => window.__mutations[id], p.id), `${p.id}: mockup mutations`).toBe(0);

      // 6. hiding it again
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(button).toHaveText("Show source");
      await expect(block).toBeHidden();
      expect(await box(p.id), p.id).toEqual(before);
      expect(await page.evaluate((id) => window.__mutations[id], p.id), `${p.id}: mockup mutations`).toBe(0);
    }

    // 4. monospaced, line breaks kept, scrolls sideways, follows the appearance (C23)
    const last = patternsFor(pack).at(-1);
    const section = page.locator(`.pattern[data-pattern="${last.id}"]`);
    await section.getByRole("button", { name: "Show source" }).click();
    const pre = section.locator(".source pre");
    const style = () => pre.evaluate((el) => {
      const s = getComputedStyle(el);
      return { whiteSpace: s.whiteSpace, overflowX: s.overflowX, font: s.fontFamily, bg: s.backgroundColor, fg: s.color };
    });
    const light = await style();
    expect(light.whiteSpace).toBe("pre");
    expect(["auto", "scroll"]).toContain(light.overflowX);
    expect(light.font).toMatch(/mono/i);
    await page.selectOption("#appearance", "dark");
    const dark = await style();
    expect(dark.bg).not.toBe(light.bg);
    expect(dark.fg).not.toBe(light.fg);
    await page.selectOption("#appearance", "light");
    // a long line scrolls inside the block instead of widening the example
    const widths = await section.evaluate((sec) => {
      const p = sec.querySelector(".source pre");
      p.querySelector("code").textContent += "\n" + "x".repeat(2000);
      return { pre: p.clientWidth, scroll: p.scrollWidth, card: sec.clientWidth, page: document.documentElement.scrollWidth, view: innerWidth };
    });
    expect(widths.scroll).toBeGreaterThan(widths.pre);
    expect(widths.pre).toBeLessThanOrEqual(widths.card);
    expect(widths.page).toBeLessThanOrEqual(widths.view);
    await section.evaluate((sec, text) => { sec.querySelector(".source pre code").textContent = text; }, expectedSnippet(last, pack));

    // 5. Copy writes the snippet and announces Copied; without a clipboard it selects the text (C24)
    await page.evaluate(() => {
      window.__copied = null;
      Object.defineProperty(navigator, "clipboard", {
        configurable: true, value: { writeText: async (t) => { window.__copied = t; } },
      });
    });
    const copy = section.getByRole("button", { name: "Copy" });
    const status = section.locator('.source [role="status"]');
    await expect(status).toHaveAttribute("aria-live", "polite");
    await copy.click();
    await expect(status).toHaveText("Copied");
    expect(await page.evaluate(() => window.__copied)).toBe(expectedSnippet(last, pack));
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
      getSelection().removeAllRanges();
    });
    await copy.click();
    expect(await page.evaluate(() => getSelection().toString())).toBe(expectedSnippet(last, pack));

    // 7. source(id) of an example the pack does not show is null (C26)
    const other = PATTERNS.find((p) => p.packs && !p.packs.includes(pack)) ?? null;
    if (other) expect(await page.evaluate((id) => window.packGallery.source(id), other.id)).toBeNull();
    expect(await page.evaluate(() => window.packGallery.source("no-such-example"))).toBeNull();
    expect(errors).toEqual([]);
  });
}
