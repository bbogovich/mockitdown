// IT-59: new elements take their sample's arguments and open their first text for editing (R-TOOL-006),
// in the composite designer of pages/designer.html, which opens the hand-written
// fixtures/new-element-sample.mkdesign: "Form" (base) holds a VStack with Text("Sign in").
// Playwright's CSS locators pierce open shadow roots.
//
// The code expected after each step was written by hand from the fixture and the base pack's samples
// in shared/reference/base.json (Button("Label"), List() { … }, Text("Content"), Toggle("Label"))
// before the insertion changed. Undo (R-TOOL-006.C3's undo step) comes with the history of R-EDIT-007;
// until then the test checks that the committed text is a change of its own, after the insertion's.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const HERE = dirname(fileURLToPath(import.meta.url));
const SAMPLE = readFileSync(join(HERE, "fixtures", "new-element-sample.mkdesign"), "utf8");
const code = (...lines) => `VStack {\n  Text("Sign in")\n${lines.map((l) => `  ${l}\n`).join("")}}\n`;

const D = "#designer";
const add = (name) => `${D} mockitdown-gallery .mkd-gallery__card[data-element="${name}"] .mkd-gallery__add`;
const FIELD = `${D} mockitdown-editor .mkd-editor__field`;

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

/** Select the VStack (n1) and wait for the gallery and the editor. */
async function selectStack(page) {
  await page.evaluate(async () => {
    const d = document.querySelector("#designer");
    d.session.select([d.session.nodeFor("Form", "n1")]);
    const r = d.shadowRoot;
    await Promise.all(["mockitdown-gallery", "mockitdown-editor"].map((t) => r.querySelector(t).rendered));
  });
}

const state = (page) => page.evaluate(() => {
  const s = document.querySelector("#designer").session;
  return { code: s.code("Form"), changes: [...window.changes] };
});

test("TC-1: Add inserts the sample's call, opens its first text selected, Enter commits it as a change of its own (C1, C2, C3, V1)", async ({ page }) => {
  const errors = await open(page);
  await selectStack(page);

  // C1, C2: Button("Label") is inserted and a focused field holding Label opens over it, its text selected.
  await page.locator(add("Button")).click();
  const field = page.locator(FIELD);
  await expect(field).toBeVisible();
  await expect(field).toHaveValue("Label");
  await expect(field).toBeFocused();
  expect(await field.evaluate((f) => [f.selectionStart, f.selectionEnd])).toEqual([0, 5]);
  expect((await state(page)).code).toBe(code('Button("Label")'));
  const f = await field.boundingBox();
  const b = await page.locator(`${D} mockitdown-editor [data-mkd-node="n3"]`).first().boundingBox();
  expect(Math.abs(f.x - b.x)).toBeLessThan(2);
  expect(Math.abs(f.y - b.y)).toBeLessThan(2);

  // C3, V1: typing Save and Enter gives Button("Save"), a second change after the insertion's.
  await page.keyboard.type("Save");
  await page.keyboard.press("Enter");
  await expect(field).toHaveCount(0);
  let s = await state(page);
  expect(s.code).toBe(code('Button("Save")'));
  expect(s.changes).toEqual([code('Button("Label")'), code('Button("Save")')]);
  expect(await page.evaluate(() => {
    const s = document.querySelector("#designer").session;
    return s.selection.map((id) => s.tree("Form").byId(id).name);
  })).toEqual(["Button"]);

  // C1: List is inserted without its sample's rows; it has no first text, so no field opens.
  await selectStack(page);
  await page.locator(add("List")).click();
  await page.evaluate(() => document.querySelector("#designer").shadowRoot.querySelector("mockitdown-editor").rendered);
  expect((await state(page)).code).toBe(code('Button("Save")', "List()"));
  await expect(field).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("TC-1: Esc keeps the sample's text and leaving the field commits it (C2, C3)", async ({ page }) => {
  const errors = await open(page);
  await selectStack(page);

  // C3: Esc closes the field; Text("Content") stays, and no change follows the insertion's.
  await page.locator(add("Text")).click();
  const field = page.locator(FIELD);
  await expect(field).toHaveValue("Content");
  await page.keyboard.type("Ignored");
  await page.keyboard.press("Escape");
  await expect(field).toHaveCount(0);
  let s = await state(page);
  expect(s.code).toBe(code('Text("Content")'));
  expect(s.changes).toHaveLength(1);

  // C3: leaving the field (a click into the gallery's search) commits its text.
  await selectStack(page);
  await page.locator(add("Toggle")).click();
  await expect(field).toHaveValue("Label");
  await page.keyboard.type("Wi-Fi");
  await page.locator(`${D} mockitdown-gallery input[type="search"]`).click();
  await expect(field).toHaveCount(0);
  s = await state(page);
  expect(s.code).toBe(code('Text("Content")', 'Toggle("Wi-Fi")'));
  expect(s.changes).toHaveLength(3);
  expect(errors).toEqual([]);
});

test("TC-1: an insertion while the field is open commits it first; a field whose node is gone closes (C5)", async ({ page }) => {
  const errors = await open(page);
  await selectStack(page);
  const field = page.locator(FIELD);

  // C5: a host inserts while the field holds typed text: the text is committed, then the field opens anew.
  await page.locator(add("Text")).click();
  await expect(field).toHaveValue("Content");
  await page.keyboard.type("Hello");
  await page.evaluate(() => {
    const s = document.querySelector("#designer").session;
    s.insert('Button("Go")', s.nodeFor("Form", "n1"));
  });
  await expect(field).toHaveValue("Go");
  let s = await state(page);
  expect(s.code).toBe(code('Text("Hello")', 'Button("Go")'));
  expect(s.changes).toHaveLength(3);

  // C5: the code replaced as text without the button: the field closes and commits nothing.
  await page.evaluate((c) => document.querySelector("#designer").session.setCode("Form", c), code('Text("Hello")'));
  await expect(field).toHaveCount(0);
  s = await state(page);
  expect(s.code).toBe(code('Text("Hello")'));
  expect(s.changes).toHaveLength(4);
  expect(errors).toEqual([]);
});
