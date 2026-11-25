// R-WEB-005 browser smoke test: the index lists the test pages, and the core render page loads the
// package's shared assets the way a browser host does (manifest, packs, page.css, icons, vocabulary
// via loadAssetsFromUrl), renders a mockup through the core and styles it with the pack stylesheet.
import { expect, test } from "@playwright/test";

test("the index links the core render page", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href="pages/core.html"]')).toHaveText("Core render");
});

test("the core renders a mockup into the page", async ({ page }) => {
  const failed = [];
  page.on("requestfailed", (r) => failed.push(r.url()));
  page.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/pages/core.html");
  await expect(page.locator("#status")).toHaveAttribute("data-state", "rendered");

  const manifest = await page.evaluate(() => window.mockitdownManifest);
  expect(manifest.packs).toContain("swiftui");
  const result = await page.evaluate(() => window.mockitdownResult);
  expect(result.packs).toEqual(["base", "swiftui"]);
  expect(result.diagnostics).toEqual([]);

  const figure = page.locator("#mockup .mkd-figure");
  await expect(figure).toHaveCount(1);
  await expect(figure).toHaveAttribute("data-pack", "swiftui");
  await expect(page.locator("#mockup")).toContainText("Inbox");
  await expect(page.locator("#mockup")).toContainText("Mail");
  // The pack stylesheet applies: a styled frame has a size, and the figure is a block.
  expect(await figure.evaluate((el) => getComputedStyle(el).display)).toBe("block");
  const box = await page.locator("#mockup .mkd-frame").boundingBox();
  expect(box && box.width > 100 && box.height > 100).toBeTruthy();
  // Icons from icons.json render as inline SVG.
  expect(await page.locator("#mockup svg.mkd-icon").count()).toBeGreaterThan(0);

  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});

test("editing the source re-renders with diagnostics", async ({ page }) => {
  await page.goto("/pages/core.html");
  await expect(page.locator("#status")).toHaveAttribute("data-state", "rendered");
  await page.locator("#source").fill('import MUI\nButton("Save"');
  await page.locator("#render").click();
  await expect(page.locator("#status")).toHaveAttribute("data-state", "error");
  const result = await page.evaluate(() => window.mockitdownResult);
  expect(result.diagnostics[0].severity).toBe("error");
  await page.locator("#source").fill('import MUI\nButton("Save") {}');
  await page.locator("#render").click();
  await expect(page.locator("#status")).toHaveAttribute("data-state", "rendered");
  await expect(page.locator("#mockup .mkd-figure")).toHaveAttribute("data-pack", "mui");
});
