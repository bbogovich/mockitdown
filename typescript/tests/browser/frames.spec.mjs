// IT-70: mockup frames on the canvas (R-TOOL-012) on pages/designer.html with a document of three phone
// mockups opened over the sample (THREE below): Sign in at (0, 0), Inbox at (485, 0), Message at
// (0, 1200), Inbox active.
//
// The expected values were worked out by hand before the code ran. A phone frame is 393 units wide
// (the phone device, R-TOOL-011.C1), so Inbox spans x 485 to 878 and Sign in 0 to 393:
//   - TC-2, grid: Message's label dragged by (+13, +21) px at 100 % puts it at (13, 1221); no edge lies
//     within 6 (its edges 13 and 406 against 0, 393, 485, 878; its top 1221 is far below the phones),
//     so it snaps to the grid: (round(13/8)·8, round(1221/8)·8) = (16, 1224).
//   - TC-2, edge: dragged by (+473, -3) it would be at (489, 1221); its left edge is 4 from Inbox's 485
//     (and its right edge 882 is 4 from 878), within 6, so x is 485 (the grid would give 488); y snaps
//     to the grid: 1224.
//   - TC-2, Alt: dragged by (+5, +3) with Alt held it moves freely: (490, 1227).
//   - Three undos give back (485, 1224), (16, 1224), (0, 1200).
//   - TC-2, new mockup: Inbox active; the frames overlapping it vertically are Sign in and Inbox (Message
//     is at y 1200, below both phones), the rightmost edge is Inbox's 878, so "Mockup 1" goes to
//     (878 + 80, 0) = (958, 0), and it is the only row of the Mockups list with the warning.
//   - TC-1: renaming Message to "Inbox" is refused with "A mockup named “Inbox” already exists", no
//     mockitdown-rename; to "inbox" it succeeds with one mockitdown-rename {from: "Message", to: "inbox"}.
// No expected value changed after the first run; TC-1's view was first set with y -60, which left
// Message's label below the viewport, and was moved to y 900 so that the label can be double-clicked.
import { expect, test } from "@playwright/test";

const D = "#designer";
const CODE = (t) => `VStack {\n  Text("${t}")\n}\n`;
const THREE = {
  format: "mockitdown-design",
  version: 1,
  name: "Three",
  defaults: { pack: "base", caption: false },
  mockups: [
    { name: "Sign in", x: 0, y: 0, options: { device: "phone" }, code: CODE("Welcome back") },
    { name: "Inbox", x: 485, y: 0, options: { device: "phone" }, code: CODE("Inbox") },
    { name: "Message", x: 0, y: 1200, options: { device: "phone" }, code: CODE("Message") },
  ],
  view: { zoom: 1, x: 0, y: 0, active: "Inbox" },
};

async function open(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/designer.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  await page.evaluate(async (doc) => {
    const d = document.querySelector("#designer");
    await d.open(doc);
    await d.rendered;
    window.renames = [];
    d.addEventListener("mockitdown-rename", (e) => window.renames.push(e.detail));
  }, THREE);
  return errors;
}

const label = (page, name) => page.locator(`${D} mockitdown-canvas [part="frame"][data-mockup="${name}"] > [part="label"]`);
const positions = (page) => page.evaluate(() => document.querySelector("#designer").session.document.mockups.map((m) => [m.name, m.x, m.y]));
const setView = (page, view) => page.evaluate((v) => {
  document.querySelector("#designer").canvas.view = v;
}, view);

/** Drag a label by (dx, dy) screen pixels in steps, optionally with Alt held. */
async function drag(page, name, dx, dy, alt = false) {
  const box = await label(page, name).boundingBox();
  const x = box.x + Math.min(10, box.width / 2);
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  if (alt) await page.keyboard.down("Alt");
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 4 });
  await page.mouse.move(x + dx, y + dy, { steps: 4 });
  await page.mouse.up();
  if (alt) await page.keyboard.up("Alt");
}

test("TC-1: a double-click renames; a taken name is refused beside the label; the rename undoes (C3-C7)", async ({ page }) => {
  const errors = await open(page);
  await setView(page, { zoom: 0.5, x: -40, y: 900 });
  const message = label(page, "Message");
  await expect(message).toHaveText("Message");
  await message.dblclick();
  const field = page.locator(`${D} mockitdown-canvas [part="rename-field"]`);
  await expect(field).toBeVisible();
  await expect(field).toHaveValue("Message");
  await field.fill("Inbox");
  await field.press("Enter");
  const refusal = page.locator(`${D} mockitdown-canvas [part="rename-error"]`);
  await expect(refusal).toHaveText("A mockup named “Inbox” already exists");
  await expect(field).toBeVisible();
  expect((await positions(page)).map((p) => p[0])).toEqual(["Sign in", "Inbox", "Message"]);
  expect(await page.evaluate(() => window.renames)).toEqual([]);

  // Case-sensitive: "inbox" is free.
  await field.fill("inbox");
  await expect(refusal).toBeHidden();
  await field.press("Enter");
  await expect(field).toBeHidden();
  expect((await positions(page)).map((p) => p[0])).toEqual(["Sign in", "Inbox", "inbox"]);
  expect(await page.evaluate(() => window.renames)).toEqual([{ from: "Message", to: "inbox" }]);
  await expect(label(page, "inbox")).toHaveText("inbox");

  // One undo step (C7): Cmd/Ctrl+Z from the canvas gives the old name back.
  await page.locator(`${D} mockitdown-canvas`).focus();
  await page.keyboard.press("ControlOrMeta+z");
  expect((await positions(page)).map((p) => p[0])).toEqual(["Sign in", "Inbox", "Message"]);
  await expect(label(page, "Message")).toHaveText("Message");

  // Esc cancels a rename.
  await label(page, "Message").dblclick();
  await field.fill("Other");
  await field.press("Escape");
  await expect(field).toBeHidden();
  expect((await positions(page)).map((p) => p[0])).toEqual(["Sign in", "Inbox", "Message"]);
  expect(errors).toEqual([]);
});

test("TC-2: dragging a label moves the frame, snapped to the grid and to edges, free with Alt; a new mockup's place and warning (C1, C2, C8, C9)", async ({ page }) => {
  const errors = await open(page);
  const widths = await page.evaluate(() => document.querySelector("#designer").canvas.frames.map((f) => [f.name, f.w]));
  expect(widths).toEqual([["Sign in", 393], ["Inbox", 393], ["Message", 393]]);

  await setView(page, { zoom: 1, x: -60, y: 1100 });
  await drag(page, "Message", 13, 21);
  expect(await positions(page)).toEqual([["Sign in", 0, 0], ["Inbox", 485, 0], ["Message", 16, 1224]]);
  await setView(page, { zoom: 1, x: -60, y: 1100 });
  await drag(page, "Message", 473, -3);
  expect(await positions(page)).toEqual([["Sign in", 0, 0], ["Inbox", 485, 0], ["Message", 485, 1224]]);
  await drag(page, "Message", 5, 3, true);
  expect(await positions(page)).toEqual([["Sign in", 0, 0], ["Inbox", 485, 0], ["Message", 490, 1227]]);
  // The frame is drawn where the mockup is.
  const at = await page.evaluate(() => {
    const f = document.querySelector("#designer").canvas.shadowRoot.querySelector('[part="frame"][data-mockup="Message"]');
    return [f.style.left, f.style.top];
  });
  expect(at).toEqual(["490px", "1227px"]);

  // Each move is one undo step; a press and release without moving is none.
  const before = await page.evaluate(() => document.querySelector("#designer").session.canUndo);
  await label(page, "Message").click();
  expect(await positions(page)).toEqual([["Sign in", 0, 0], ["Inbox", 485, 0], ["Message", 490, 1227]]);
  expect(before).toBe(true);
  await page.locator(`${D} mockitdown-canvas`).focus();
  await page.keyboard.press("ControlOrMeta+z");
  expect((await positions(page))[2]).toEqual(["Message", 485, 1224]);
  await page.keyboard.press("ControlOrMeta+z");
  expect((await positions(page))[2]).toEqual(["Message", 16, 1224]);
  await page.keyboard.press("ControlOrMeta+z");
  expect((await positions(page))[2]).toEqual(["Message", 0, 1200]);

  // C8, C9: a new mockup.
  await page.evaluate(() => {
    const s = document.querySelector("#designer").session;
    s.setActive("Inbox");
    s.newMockup();
  });
  expect(await positions(page)).toEqual([["Sign in", 0, 0], ["Inbox", 485, 0], ["Message", 0, 1200], ["Mockup 1", 958, 0]]);
  await page.locator(`${D} mockitdown-outline [role="tab"]`, { hasText: "Mockups" }).click();
  const rows = page.locator(`${D} mockitdown-outline [part="mockup"]`);
  await expect(rows).toHaveText(["Sign in", "Inbox", "Message", "Mockup 1"]);
  expect(await rows.evaluateAll((els) => els.map((el) => el.hasAttribute("data-default-name")))).toEqual([false, false, false, true]);
  const warning = page.locator(`${D} mockitdown-outline [part="mockup"][data-default-name] [part="name-warning"]`);
  await expect(warning).toBeVisible();
  await expect(warning).toHaveAttribute("title", /SpecItOut tools import mockups by name/);
  expect(errors).toEqual([]);
});
