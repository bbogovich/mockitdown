// R-REND-008 TC-2: an unknown element is a visibly labelled placeholder that keeps the layout around
// it. The mockup is rendered with the package's Node entry and measured in Chromium on a blank page
// holding only its stylesheet (no script).
import { expect, test } from "@playwright/test";
import { loadSharedAssets, render, stylesheet } from "../../dist/node.js";

loadSharedAssets();

async function show(page, source, packs = ["base"]) {
  const r = render(source, { device: "fit", pack: packs[packs.length - 1] });
  await page.setContent(`<!doctype html><html><head><style>${stylesheet(packs)}</style></head>`
    + `<body style="margin:0">${r.html}</body></html>`);
  expect(await page.locator("script").count()).toBe(0);
  return r;
}

for (const pack of ["base", "fluent", "swiftui"]) {
  test(`R-REND-008 TC-2: an unknown element is a labelled placeholder in the layout (${pack}) (C3, V1)`, async ({ page }) => {
    const r = await show(page, 'HStack(spacing: 8) { Text("a"); Foo { Text("b") }; Text("c") }', pack === "base" ? ["base"] : ["base", pack]);
    expect(r.diagnostics.map((d) => d.code)).toEqual(["unknown"]);
    const unknown = page.locator(".mkd-unknown");
    const style = await unknown.evaluate((el) => {
      const s = getComputedStyle(el);
      return { border: s.borderTopStyle, width: parseFloat(s.borderTopWidth), display: s.display };
    });
    expect(style.border).toBe("dashed");                    // visibly marked …
    expect(style.width).toBeGreaterThan(0);
    const name = page.locator(".mkd-unknown__name");
    await expect(name).toHaveText("Foo");                   // … and labelled with its name
    await expect(name).toBeVisible();
    await expect(page.locator(".mkd-unknown .mkd-text")).toHaveText("b");   // its children inside it
    // The siblings keep their places: a, the placeholder and c side by side, in order, not overlapping.
    const boxes = [];
    for (const loc of [page.locator(".mkd-hstack > .mkd-text").first(), unknown, page.locator(".mkd-hstack > .mkd-text").last()]) {
      boxes.push(await loc.boundingBox());
    }
    expect(boxes[0].x + boxes[0].width).toBeLessThanOrEqual(boxes[1].x + 0.5);
    expect(boxes[1].x + boxes[1].width).toBeLessThanOrEqual(boxes[2].x + 0.5);
    const inner = await page.locator(".mkd-unknown .mkd-text").boundingBox();
    expect(inner.x).toBeGreaterThanOrEqual(boxes[1].x);
    expect(inner.x + inner.width).toBeLessThanOrEqual(boxes[1].x + boxes[1].width + 0.5);
  });
}
