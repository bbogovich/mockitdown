// R-APP-002 TC-2 and R-APP-003 TC-2: appearance in a browser. Each test renders a mockup with the
// package's Node entry, puts it on a blank page with its stylesheet (no script on the page), and
// measures it in Chromium: an `auto` frame follows the page palette or the browser's colour scheme
// without a rebuild, and `appearance="both"` lays two equal frames side by side.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { loadSharedAssets, render, stylesheet } from "../../dist/node.js";

loadSharedAssets();
const BASE = JSON.parse(readFileSync(new URL("../../../shared/packs/base/pack.json", import.meta.url), "utf8"));
const LIGHT_BG = BASE.tokens.light.bg;
const DARK_BG = BASE.tokens.dark.bg;
const SOURCE = 'VStack { Text("Appearance"); Button("Continue") }';

/** A page holding one figure per appearance, in a column of `width` px, with `body` attributes. */
async function show(page, appearances, { body = "", width = 700, device = "fit" } = {}) {
  const figures = appearances.map((appearance) => {
    const r = render(SOURCE, { appearance, device });
    expect(r.diagnostics).toEqual([]);
    return `<div class="col" data-for="${appearance}">${r.html}</div>`;
  });
  const css = stylesheet(["base"]);
  await page.setContent(`<!doctype html><html><head><style>${css}</style>`
    + `<style>.col{width:${width}px}</style></head><body ${body}>${figures.join("")}</body></html>`);
  expect(await page.locator("script").count()).toBe(0);
}

/** The computed --mkd-bg of the frame(s) in the column for `appearance`. */
function bg(page, appearance) {
  return page.locator(`.col[data-for="${appearance}"] .mkd-frame`).first()
    .evaluate((el) => getComputedStyle(el).getPropertyValue("--mkd-bg").trim());
}

test("R-APP-002 TC-2: an auto frame follows the Material palette attribute (C3, C5, V1)", async ({ page }) => {
  await show(page, ["auto", "light", "dark"], { body: 'data-md-color-scheme="default"' });
  expect(await bg(page, "auto")).toBe(LIGHT_BG);
  expect(await bg(page, "light")).toBe(LIGHT_BG);
  expect(await bg(page, "dark")).toBe(DARK_BG);
  await page.evaluate(() => document.body.setAttribute("data-md-color-scheme", "slate"));
  expect(await bg(page, "auto")).toBe(DARK_BG);
  expect(await bg(page, "light")).toBe(LIGHT_BG);
  expect(await page.locator('.col[data-for="auto"] .mkd-frame').evaluate((el) => getComputedStyle(el).colorScheme))
    .toBe("dark");
  await page.evaluate(() => document.body.setAttribute("data-md-color-scheme", "default"));
  expect(await bg(page, "auto")).toBe(LIGHT_BG);
});

test("R-APP-002 TC-2: without a palette attribute an auto frame follows the browser (C4, C5)", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await show(page, ["auto", "light"]);
  expect(await bg(page, "auto")).toBe(LIGHT_BG);
  await page.emulateMedia({ colorScheme: "dark" });
  expect(await bg(page, "auto")).toBe(DARK_BG);
  expect(await bg(page, "light")).toBe(LIGHT_BG);
  // A palette attribute takes over from the browser preference.
  await page.evaluate(() => document.body.setAttribute("data-md-color-scheme", "default"));
  expect(await bg(page, "auto")).toBe(LIGHT_BG);
});

test("R-APP-003 TC-2: both appearances side by side, two frames of equal size (C2, V1)", async ({ page }) => {
  await show(page, ["both"], { device: "phone" });
  const frames = page.locator(".mkd-frame");
  await expect(frames).toHaveCount(2);
  const [a, b] = [await frames.nth(0).boundingBox(), await frames.nth(1).boundingBox()];
  const gap = await page.locator(".mkd-stage").evaluate((el) => parseFloat(getComputedStyle(el).columnGap));
  expect(Math.abs(a.width - b.width)).toBeLessThan(0.5);
  expect(Math.abs(a.height - b.height)).toBeLessThan(0.5);
  expect(Math.abs(a.y - b.y)).toBeLessThan(0.5);                // one row
  expect(b.x).toBeGreaterThanOrEqual(a.x + a.width);              // light left of dark
  expect(a.width).toBeLessThanOrEqual((700 - gap) / 2 + 0.5);     // each within half the column
  expect(a.width).toBeGreaterThan((700 - gap) / 2 - 2);           // and shrunk to it, not smaller
  await expect(page.locator(".mkd-cell__label")).toHaveText(["Light", "Dark"]);
});
