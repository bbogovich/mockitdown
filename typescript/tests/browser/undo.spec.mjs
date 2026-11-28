// IT-62 (browser part): undo and redo in the composite designer (R-EDIT-007.C10, TC-2) on
// pages/designer.html, which opens pages/designer-sample.mkdesign. The expected documents are the
// sample itself and fixtures/designer-deleted.mkdesign (the sample with the "Open" button's line
// removed, written by hand for IT-55), so an undo must give back the sample byte for byte.
// The inspector's part of TC-2 (typing a word in an inspector field, then one undo) waits for the
// inspector (R-TOOL-007); here a delete is the change undone.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const HERE = dirname(fileURLToPath(import.meta.url));
const SAMPLE = readFileSync(join(HERE, "..", "..", "pages", "designer-sample.mkdesign"), "utf8");
const DELETED = readFileSync(join(HERE, "fixtures", "designer-deleted.mkdesign"), "utf8");

const D = "#designer";
const BUTTON = `${D} mockitdown-editor .mkd-editor__view [data-el="Button"]`;
const UNDO = `${D} [part="undo"]`;
const REDO = `${D} [part="redo"]`;

async function open(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/designer.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  return errors;
}

const written = (page) => page.evaluate(async () => (await import("/dist/design.js")).writeDesign(document.querySelector("#designer").toJSON()));
const selectedNames = (page) => page.evaluate(() => {
  const s = document.querySelector("#designer").session;
  const tree = s.tree(s.active);
  return s.selection.map((id) => tree.byId(id).name);
});
const changes = (page) => page.evaluate(() => window.changes.length);

test("TC-2: Undo and Redo in the toolbar follow canUndo and canRedo; the keys undo and redo one step (C8, C10)", async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => {
    window.changes = [];
    document.addEventListener("mockitdown-change", (e) => window.changes.push(e.detail));
  });
  // A fresh document: nothing to undo or redo.
  await expect(page.locator(UNDO)).toHaveText("Undo");
  await expect(page.locator(REDO)).toHaveText("Redo");
  await expect(page.locator(UNDO)).toBeDisabled();
  await expect(page.locator(REDO)).toBeDisabled();

  await page.click(BUTTON);
  await page.keyboard.press("Delete");
  await expect.poll(() => changes(page)).toBe(1);
  expect(await written(page)).toBe(DELETED);
  await expect(page.locator(UNDO)).toBeEnabled();
  await expect(page.locator(REDO)).toBeDisabled();

  // Cmd/Ctrl+Z with the focus in the view: one change, the sample back, the button selected again.
  await page.keyboard.press("ControlOrMeta+z");
  await expect.poll(() => changes(page)).toBe(2);
  expect(await written(page)).toBe(SAMPLE);
  expect(await selectedNames(page)).toEqual(["Button"]);
  await expect(page.locator(BUTTON)).toHaveCount(1);
  await expect(page.locator(UNDO)).toBeDisabled();
  await expect(page.locator(REDO)).toBeEnabled();

  // Shift+Cmd/Ctrl+Z redoes it, and the delete's selection (the previous sibling) comes back.
  await page.keyboard.press("Shift+ControlOrMeta+z");
  await expect.poll(() => changes(page)).toBe(3);
  expect(await written(page)).toBe(DELETED);
  expect(await selectedNames(page)).toEqual(["Text"]);

  // The toolbar's buttons do the same.
  await page.click(UNDO);
  await expect.poll(() => changes(page)).toBe(4);
  expect(await written(page)).toBe(SAMPLE);
  await page.click(REDO);
  await expect.poll(() => changes(page)).toBe(5);
  expect(await written(page)).toBe(DELETED);

  // Ctrl+Y redoes too.
  await page.locator(`${D} mockitdown-outline [role="tree"]`).focus();
  await page.keyboard.press("ControlOrMeta+z");
  await expect.poll(() => changes(page)).toBe(6);
  await page.keyboard.press("Control+y");
  await expect.poll(() => changes(page)).toBe(7);
  expect(await written(page)).toBe(DELETED);

  // In a text field the keys are the field's: no undo of the document.
  await page.locator(`${D} mockitdown-gallery [part="search"]`).focus();
  await page.keyboard.press("ControlOrMeta+z");
  await page.waitForTimeout(100);
  expect(await changes(page)).toBe(7);
  expect(await written(page)).toBe(DELETED);

  // A newly opened document has a history of its own: nothing to undo.
  await page.evaluate(() => document.querySelector("#designer").open(window.mockitdownSample));
  await expect(page.locator(UNDO)).toBeDisabled();
  await expect(page.locator(REDO)).toBeDisabled();
  expect(errors).toEqual([]);
});
