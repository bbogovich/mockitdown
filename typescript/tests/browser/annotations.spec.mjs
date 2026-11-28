// R-ANN-002 TC-2: the selection rectangle of `.dragSelect` in a browser. The mockup is rendered with
// the package's Node entry and put on a blank page with its stylesheet; Chromium measures that the
// rectangle surrounds the view, slightly beyond it on every side, with a border and a translucent tint.
import { expect, test } from "@playwright/test";
import { loadSharedAssets, render, stylesheet } from "../../dist/node.js";

loadSharedAssets();

test("R-ANN-002 TC-2: the selection rectangle extends slightly beyond the view (C2, V1)", async ({ page }) => {
  const r = render('VStack { List { Text("a"); Text("b") }.dragSelect().frame(width: 240) }.padding(24)',
    { device: "fit" });
  expect(r.diagnostics).toEqual([]);
  await page.setContent(`<!doctype html><html><head><style>${stylesheet(r.packs)}</style></head>`
    + `<body>${r.html}</body></html>`);
  const list = await page.locator(".mkd-screen .mkd-list").boundingBox();
  const mark = page.locator(".mkd-screen .mkd-deco__marquee").filter({ visible: true }).first();
  const box = await mark.boundingBox();
  for (const [outer, inner] of [[list.x, box.x], [box.x + box.width, list.x + list.width],
    [list.y, box.y], [box.y + box.height, list.y + list.height]]) {
    const beyond = outer - inner;
    expect(beyond).toBeGreaterThan(0);   // beyond the view …
    expect(beyond).toBeLessThan(16);     // … but only slightly
  }
  const style = await mark.evaluate((el) => {
    const s = getComputedStyle(el);
    return { border: parseFloat(s.borderTopWidth), bg: s.backgroundColor };
  });
  expect(style.border).toBeGreaterThan(0);
  expect(style.bg).toMatch(/^(rgba|color\(srgb).*(\/ 0\.\d+|, 0\.\d+)\)$/);  // a translucent tint
});
