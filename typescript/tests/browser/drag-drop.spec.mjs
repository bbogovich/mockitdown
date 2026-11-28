// IT-58: drag and drop onto the outline and the view (R-TOOL-005) in the composite designer of
// pages/designer.html, which opens the hand-written fixtures/drag-sample.mkdesign: "Drop" (base) holds
// a VStack of Text("First"), Text("Second") and HStack #row of Button("Left") and Button("Right").
// The drags are real pointer drags (page.mouse); Playwright's CSS locators pierce open shadow roots.
//
// The code expected after each drop, the drop positions and the refusal sentences were written by
// hand from the fixture before the drag and drop existed (the inserted calls rewritten by hand from
// shared/reference/base.json's samples for R-TOOL-006, #31): the frame refusal is R-PACK-016.C6's own
// example, the subtree refusal the session's sentence for a move into one of its own descendants.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const HERE = dirname(fileURLToPath(import.meta.url));
const SAMPLE = readFileSync(join(HERE, "fixtures", "drag-sample.mkdesign"), "utf8");
const FRAME_IN_HSTACK = "A frame cannot be placed inside a horizontal stack";
const CODE = 'VStack {\n  Text("First")\n  Text("Second")\n  HStack {\n    Button("Left")\n    Button("Right")\n  }.id("row")\n}\n';
const AFTER_VIEW_DROP = 'VStack {\n  Text("First")\n  Text("Content")\n  Text("Second")\n  HStack {\n    Button("Left")\n    Button("Right")\n  }.id("row")\n}\n';
const AFTER_BEFORE = 'VStack {\n  Text("First")\n  Text("Second")\n  Text("Content")\n  HStack {\n    Button("Left")\n    Button("Right")\n  }.id("row")\n}\n';
const AFTER_INSIDE = 'VStack {\n  Text("First")\n  Text("Second")\n  Text("Content")\n  HStack {\n    Button("Left")\n    Button("Right")\n    Divider()\n  }.id("row")\n}\n';
const AFTER_AFTER = 'VStack {\n  Text("First")\n  Text("Second")\n  Text("Content")\n  HStack {\n    Button("Left")\n    Button("Right")\n    Divider()\n  }.id("row")\n  Text("Content")\n}\n';
const AFTER_MOVE = 'VStack {\n  Text("First")\n  HStack {\n    Button("Left")\n    Button("Right")\n  }.id("row")\n  Text("Second")\n}\n';

const D = "#designer";
const card = (name) => `${D} mockitdown-gallery .mkd-gallery__card[data-element="${name}"]`;
const row = (page, text) => page.locator(`${D} mockitdown-outline [role="treeitem"]`, { hasText: text });
const inView = (ordinal) => `${D} mockitdown-editor [data-mkd-node="${ordinal}"]`;
const shield = "[data-mkd-drag-shield]";
const reason = "[data-mkd-drag-ghost] [data-mkd-drag-reason]";

/** Open the designer page, then the fixture in its designer; record the code changes. */
async function open(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/designer.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  await page.evaluate(async (text) => {
    window.changes = [];
    document.addEventListener("mockitdown-change", (e) => {
      if (e.detail.kind === "code") window.changes.push(e.detail.code);
    });
    const d = document.querySelector("#designer");
    await d.open(text);
    await d.rendered;
  }, SAMPLE);
  return errors;
}

/** Clear the selection (the gallery then offers what the root accepts) and wait for the tools. */
async function settle(page, clear = true) {
  await page.evaluate(async (c) => {
    const d = document.querySelector("#designer");
    if (c) d.session.select([]);
    const r = d.shadowRoot;
    await Promise.all(["mockitdown-gallery", "mockitdown-outline", "mockitdown-editor"].map((t) => r.querySelector(t).rendered));
  }, clear);
}

const centre = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });

async function box(locator) {
  // An outline row is redrawn when the hovered node changes: scroll, then measure the current one.
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  return locator.boundingBox();
}

/** Press on `from`, move past the drag threshold, then to `to`; the pointer stays down. */
async function dragTo(page, from, to) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 8, from.y + 8, { steps: 2 });
  await page.mouse.move(to.x, to.y, { steps: 6 });
}

/** The position in a row's upper, middle or lower third. */
function third(b, which) {
  const f = which === "upper" ? 0.15 : which === "lower" ? 0.85 : 0.5;
  return { x: b.x + Math.min(40, b.width / 2), y: b.y + b.height * f };
}

const state = (page) => page.evaluate(() => {
  const s = document.querySelector("#designer").session;
  const tree = s.tree(s.active);
  const sel = s.selection.map((id) => tree.byId(id));
  return {
    code: s.code(s.active), changes: window.changes.length, ids: [...s.selection],
    selected: sel.map((n) => n.name), parent: sel[0]?.parent?.name ?? null,
    text: sel[0] ? tree.source.slice(sel[0].first, sel[0].span.end) : null,
  };
});

test("TC-1: a card dropped on the gap between a VStack's children inserts it there, selected, in one change; Esc cancels (C1, C3, C5, C6, V1)", async ({ page }) => {
  const errors = await open(page);
  await settle(page);
  const first = await box(page.locator(inView("n2")));
  const second = await box(page.locator(inView("n3")));
  const stack = await box(page.locator(inView("n1")));
  const gap = { x: first.x + first.width / 2, y: (first.y + first.height + second.y) / 2 };
  await dragTo(page, centre(await box(page.locator(card("Text")))), gap);

  // C3: the VStack is outlined and a horizontal bar marks the gap between its first and second child.
  const target = page.locator(`${D} mockitdown-editor .mkd-editor__drop`);
  await expect(target).toHaveCount(1);
  await expect(target).toHaveAttribute("data-refused", "false");
  const t = await target.boundingBox();
  expect(Math.abs(t.y - stack.y)).toBeLessThan(2);
  expect(Math.abs(t.height - stack.height)).toBeLessThan(2);
  const bar = page.locator(`${D} mockitdown-editor .mkd-editor__bar`);
  await expect(bar).toHaveAttribute("data-orientation", "horizontal");
  const b = await bar.boundingBox();
  expect(b.width).toBeGreaterThan(b.height);
  expect(b.y + b.height / 2).toBeGreaterThanOrEqual(first.y + first.height - 3);
  expect(b.y + b.height / 2).toBeLessThanOrEqual(second.y + 3);
  await expect(page.locator(shield)).toHaveCSS("cursor", "grabbing");
  await page.mouse.up();

  // C5, C6, V1: Text("Content") (its sample's call, R-TOOL-006.C1) is the stack's second child, selected, after exactly one change.
  await settle(page, false);
  let s = await state(page);
  expect(s.code).toBe(AFTER_VIEW_DROP);
  expect(s.selected).toEqual(["Text"]);
  expect(s.parent).toBe("VStack");
  expect(s.text).toBe('Text("Content")');
  expect(s.changes).toBe(1);
  await expect(page.locator(shield)).toHaveCount(0);
  await expect(page.locator(`${D} mockitdown-editor .mkd-editor__bar`)).toHaveCount(0);

  // C3: over the HStack the bar runs vertically, between its buttons; C6: Esc cancels the drag.
  await settle(page);
  const left = await box(page.locator(`${D} mockitdown-editor [data-mkd-node="n6"]`));
  const right = await box(page.locator(`${D} mockitdown-editor [data-mkd-node="n7"]`));
  await dragTo(page, centre(await box(page.locator(card("Text")))), { x: (left.x + left.width + right.x) / 2, y: left.y + left.height / 2 });
  await expect(page.locator(`${D} mockitdown-editor .mkd-editor__bar`)).toHaveAttribute("data-orientation", "vertical");
  await page.keyboard.press("Escape");
  await expect(page.locator(shield)).toHaveCount(0);
  await expect(page.locator(`${D} mockitdown-editor .mkd-editor__bar`)).toHaveCount(0);
  await page.mouse.up();
  s = await state(page);
  expect(s.code).toBe(AFTER_VIEW_DROP);
  expect(s.changes).toBe(1);
  expect(errors).toEqual([]);
});

test("TC-2: a card dropped in the upper, middle and lower third of an outline row goes before, inside and after it (C1, C2, C5)", async ({ page }) => {
  const errors = await open(page);
  const drops = [["Text", "upper", "before", AFTER_BEFORE], ["Divider", "middle", "inside", AFTER_INSIDE], ["Text", "lower", "after", AFTER_AFTER]];
  for (const [name, which, zone, expected] of drops) {
    await settle(page);
    const hstack = await box(row(page, "HStack"));
    await dragTo(page, centre(await box(page.locator(card(name)))), third(hstack, which));
    await expect(row(page, "HStack")).toHaveAttribute("data-drop", zone);
    await page.mouse.up();
    await settle(page, false);
    const s = await state(page);
    expect(s.code).toBe(expected);
    expect(s.selected).toEqual([name]);
    await expect(page.locator(`${D} mockitdown-outline [data-drop]`)).toHaveCount(0);
  }
  expect((await state(page)).changes).toBe(3);
  expect(errors).toEqual([]);
});

test("TC-2: refused positions show not-allowed and the reason and drop nothing; a row dragged after its sibling moves, its id kept (C1, C2, C4, C5)", async ({ page }) => {
  const errors = await open(page);
  await settle(page);

  // C4: a frame over the HStack's middle third: refused by the role rules.
  await dragTo(page, centre(await box(page.locator(card("NavigationSplitView")))), third(await box(row(page, "HStack")), "middle"));
  await expect(row(page, "HStack")).toHaveAttribute("data-drop", "inside refused");
  await expect(page.locator(shield)).toHaveCSS("cursor", "not-allowed");
  await expect(page.locator(reason)).toHaveText(FRAME_IN_HSTACK);
  await page.mouse.up();
  expect((await state(page)).code).toBe(CODE);

  // C4: the HStack row dragged onto its own child's row.
  await row(page, "HStack").locator(".mkd-outline__twisty").click();
  await expect(row(page, "Left")).toHaveCount(1);
  await dragTo(page, centre(await box(row(page, "HStack"))), third(await box(row(page, "Left")), "middle"));
  await expect(row(page, "Left")).toHaveAttribute("data-drop", "inside refused");
  await expect(page.locator(shield)).toHaveCSS("cursor", "not-allowed");
  await expect(page.locator(reason)).toHaveText("Cannot move HStack into one of its own descendants");
  await page.mouse.up();
  let s = await state(page);
  expect(s.code).toBe(CODE);
  expect(s.changes).toBe(0);

  // C1, C5: the Second row dropped in the HStack row's lower third moves after it, its node id kept.
  await settle(page);
  const id = await page.evaluate(() => document.querySelector("#designer").session.nodeFor("Drop", "n3"));
  await dragTo(page, centre(await box(row(page, "Second"))), third(await box(row(page, "HStack")), "lower"));
  await expect(row(page, "HStack")).toHaveAttribute("data-drop", "after");
  await page.mouse.up();
  await settle(page, false);
  s = await state(page);
  expect(s.code).toBe(AFTER_MOVE);
  expect(s.ids).toEqual([id]);
  expect(s.text).toBe('Text("Second")');
  expect(s.changes).toBe(1);
  expect(errors).toEqual([]);
});
