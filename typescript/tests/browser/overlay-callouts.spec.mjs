// R-ANN-001 TC-1 and R-ANN-003 TC-1 (IT-74): marks on overlay layers and on views inside a dialog,
// measured in Chromium. Each mockup is rendered with the package's Node entry and put on a blank page
// with its stylesheet; the visible callout badge's centre must lie within 4 px of the marked element's
// top-left corner (the default `.topLeading` alignment), in a fit frame and in a phone frame.
// R-ANN-003 TC-1 measures twice: with CSS anchor positioning, and with the fallback layer forced by
// turning the stylesheet's `@supports` branch off.
import { expect, test } from "@playwright/test";
import { loadSharedAssets, render, stylesheet } from "../../dist/node.js";

loadSharedAssets();

const TOL = 4;

/** Put `source` on the page (device `device`); `fallback` disables the anchor-positioning branch. */
async function show(page, source, { device = "fit", fallback = false } = {}) {
  const r = render(source, { device });
  expect(r.diagnostics).toEqual([]);
  let css = stylesheet(r.packs);
  if (fallback) {
    expect(css).toContain("@supports (anchor-name: --mkd-test)");
    css = css.replaceAll("@supports (anchor-name: --mkd-test)", "@supports (not-a-property: none)");
  }
  await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body>${r.html}</body></html>`);
}

/** The offset of the visible badge numbered `n` from the top-left corner of `target`. */
async function measure(page, n, target) {
  const badge = page.locator(".mkd-screen .mkd-callout__badge", { hasText: new RegExp(`^${n}$`) })
    .filter({ visible: true });
  await expect(badge).toHaveCount(1);
  const b = await badge.boundingBox();
  const t = await page.locator(target).first().boundingBox();
  expect(t, `${target} is laid out`).not.toBeNull();
  return { dx: b.x + b.width / 2 - t.x, dy: b.y + b.height / 2 - t.y };
}

function expectAtCorner({ dx, dy }, what) {
  expect(Math.abs(dx), `${what}: horizontal offset ${dx}`).toBeLessThanOrEqual(TOL);
  expect(Math.abs(dy), `${what}: vertical offset ${dy}`).toBeLessThanOrEqual(TOL);
}

const OVERLAYS = [
  ["a Dialog", 'VStack { Text("Behind"); Dialog("Rename") { TextField("Name"); Button("OK") }.callout(1) }',
    1, ".mkd-screen .mkd-dialog"],
  ["a Toast", 'VStack { Text("Saved list"); Toast("Saved").callout(2) }', 2, ".mkd-screen .mkd-toast"],
  ["a floating action button", 'VStack { Text("List"); FloatingActionButton("plus").callout(3) }', 3,
    ".mkd-screen .mkd-fab"],
  ["a Toast presented through .overlay",
    'Color(.blue).frame(width: 240, height: 120).overlay { Toast("Copied").callout(4) }', 4,
    ".mkd-screen .mkd-toast"],
];

const DIALOGS = [
  ["a Dialog", 'VStack { Text("Behind"); Dialog("Delete?") { Text("This cannot be undone.")\n'
    + '  Button("Delete").callout(1) } }'],
  ["an alert presented through .alert", 'VStack { Text("Behind") }\n'
    + '.alert("Delete?", isPresented: true) { Button("Cancel"); Button("Delete").callout(1) }'],
];

for (const device of ["fit", "phone"]) {
  for (const [what, source, n, target] of OVERLAYS) {
    test(`R-ANN-001 TC-1: the callout on ${what} sits at its corner (C6, ${device})`, async ({ page }) => {
      await show(page, source, { device });
      expectAtCorner(await measure(page, n, target), what);
    });
  }

  for (const fallback of [false, true]) {
    const how = fallback ? "fallback layer" : "anchor positioning";
    for (const [what, source] of DIALOGS) {
      test(`R-ANN-003 TC-1: a callout inside ${what} sits at its button (C6, ${device}, ${how})`, async ({ page }) => {
        await show(page, source, { device, fallback });
        expectAtCorner(await measure(page, 1, ".mkd-dialog .mkd-button[data-deco]"), `${what}, ${how}, ${device}`);
      });
    }
  }
}
