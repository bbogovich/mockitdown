// IT-63 (browser part): mockitdown-inspector in the composite designer of pages/designer.html
// (R-TOOL-007 TC-1, TC-2, the Mockup tab of C10, and R-EDIT-007.TC-2's inspector step, C5).
// TC-1 runs on the page's own sample (pages/designer-sample.mkdesign), whose "Sign in" mockup renders in
// mui, where Button declares the variants text, outlined and contained; TC-2 opens the hand-written
// fixtures/inspector-sample.mkdesign ("Controls", base). Every expected code below was written by hand
// from those two documents before the inspector ran. Playwright's CSS locators pierce open shadow roots.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE = readFileSync(join(HERE, "fixtures", "inspector-sample.mkdesign"), "utf8");
const SIGN_IN = 'VStack {\n  Text("Welcome back")\n  Button("Sign in")\n}\n';
const BUTTON_LINE = 'Button("Save", systemImage: "star", color: .red, role: "cancel", loading: true, elevation: 2, bogus: 1)';
const CONTROLS = `${BUTTON_LINE}\n  .frame(width: 80)\n  .padding(.horizontal, 8)\n  .id("save")\nBreadcrumb(items: ["Home", "Docs"])\nText("Other").id("taken")\n`;

const D = "#designer";
const I = `${D} mockitdown-inspector`;
const BUTTON = `${D} mockitdown-editor .mkd-editor__view [data-el="Button"]`;
const UNDO = `${D} [part="undo"]`;
const field = (key) => `${I} [part="field"][data-key="${key}"]`;

async function open(page, text = null) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/designer.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  await page.evaluate(async (doc) => {
    window.changes = [];
    document.addEventListener("mockitdown-change", (e) => window.changes.push(e.detail));
    const d = document.querySelector("#designer");
    if (doc) await d.open(doc);
    await d.rendered;
  }, text);
  return errors;
}

const code = (page, name) => page.evaluate((n) => document.querySelector("#designer").session.code(n), name);
const select = (page, mockup, ordinals) => page.evaluate(async ([m, os]) => {
  const d = document.querySelector("#designer");
  if (d.session.active !== m) d.session.setActive(m);
  d.session.select(os.map((o) => d.session.nodeFor(m, o)));
  await d.rendered;
}, [mockup, ordinals]);

test("TC-1: the variant choice lists the declared variants; a choice changes code and rendering, undo restores both (C1, C4, C8, V1)", async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(async () => {
    const d = document.querySelector("#designer");
    d.session.setActive("Sign in");
    await d.rendered;
  });
  await page.click(BUTTON);
  // C1: the four groups.
  await expect(page.locator(`${I} [part="group"]`)).toHaveCount(4);
  expect(await page.locator(`${I} [part="group"]`).evaluateAll((gs) => gs.map((g) => g.dataset.group))).toEqual(["arguments", "state", "modifiers", "identity"]);
  // C4: exactly the variants mui's Button declares, after the unset choice.
  const variant = page.locator(`${field("state:variant")} select`);
  expect(await variant.locator("option").evaluateAll((os) => os.map((o) => o.value))).toEqual(["", "text", "outlined", "contained"]);

  const before = await page.evaluate(() => window.changes.length);
  await variant.selectOption("outlined");
  // C8: applied after the debounce, well within 500 ms; the view re-renders with the new variant.
  await expect.poll(() => code(page, "Sign in"), { timeout: 500 }).toBe('VStack {\n  Text("Welcome back")\n  Button("Sign in").variant("outlined")\n}\n');
  await expect(page.locator(BUTTON)).toHaveAttribute("data-variant", "outlined", { timeout: 500 });
  expect(await page.evaluate(() => window.changes.length)).toBe(before + 1);

  // F-19.AC4: undo restores the code and the rendering.
  await page.click(UNDO);
  expect(await code(page, "Sign in")).toBe(SIGN_IN);
  await expect(page.locator(BUTTON)).toHaveAttribute("data-variant", "text");
  await expect(variant).toHaveValue("");

  // R-EDIT-007.C5: typing a word in the label field is one undo step (undo kept the button selected).
  const label = page.locator(`${field("position:0")} input`);
  await label.click();
  await label.press("End");
  await label.pressSequentially(" now", { delay: 40 });
  await expect.poll(() => code(page, "Sign in")).toBe('VStack {\n  Text("Welcome back")\n  Button("Sign in now")\n}\n');
  await expect(label).toBeFocused();
  await page.click(UNDO);
  expect(await code(page, "Sign in")).toBe(SIGN_IN);
  expect(await page.evaluate(() => document.querySelector("#designer").session.canUndo)).toBe(false);
  expect(errors).toEqual([]);
});

test("TC-2: typed controls, Add lists, an invalid width, an unknown label, a duplicate id, two selected (C2, C3, C5, C6, C7, C9, C12)", async ({ page }) => {
  const errors = await open(page, FIXTURE);
  await select(page, "Controls", ["n1"]);
  // C3: the control of each type.
  const controls = await page.locator(`${I} [part="field"]`).evaluateAll((fs) => Object.fromEntries(fs.map((f) => [f.dataset.key, f.dataset.control])));
  expect(controls).toMatchObject({
    "position:0": "text", "argument:systemImage": "icon", "argument:color": "color", "argument:role": "choice",
    "argument:loading": "switch", "argument:elevation": "number", "argument:bogus": "code",
    "state:selected": "switch", "modifier:frame:0:width": "number", "modifier:padding:0:#0": "choice", id: "text", refs: "list", comment: "comment",
  });
  await expect(page.locator(`${field("argument:systemImage")} input`)).toHaveAttribute("list", "mkd-icons");
  await expect(page.locator(`${field("argument:loading")} input[role="switch"]`)).toBeChecked();
  await expect(page.locator(`${field("argument:role")} select`)).toHaveValue("cancel");
  // C2, C5: Add argument offers unused labels only; Add modifier omits the chain's modifiers.
  const adds = await page.locator(`${I} [part="add-argument"] option`).evaluateAll((os) => os.map((o) => o.value));
  expect(adds).toContain("badge");
  for (const l of ["label", "systemImage", "color", "role", "bogus"]) expect(adds).not.toContain(l);
  const mods = await page.locator(`${I} [part="add-modifier"] option`).evaluateAll((os) => os.map((o) => o.value));
  expect(mods).toContain("bold");
  for (const m of ["frame", "padding", "id"]) expect(mods).not.toContain(m);

  // C9: a negative width is shown invalid with its message, and the code is unchanged.
  const width = page.locator(`${field("modifier:frame:0:width")} input`);
  await width.fill("-10");
  await expect(width).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator(`${field("modifier:frame:0:width")} [part="error"]`)).toHaveText("Must be at least 0");
  await expect(width).toHaveValue("-10");
  expect(await code(page, "Controls")).toBe(CONTROLS);

  // C7: the unknown label is noted and can be removed.
  await expect(page.locator(`${field("argument:bogus")} [part="note"]`)).toHaveText("not understood by this pack");
  await page.locator(`${field("argument:bogus")} [part="remove"]`).click();
  await expect.poll(async () => (await code(page, "Controls")).split("\n")[0])
    .toBe('Button("Save", systemImage: "star", color: .red, role: "cancel", loading: true, elevation: 2)');

  // C6: a duplicate identifier is refused.
  const id = page.locator(`${field("id")} input`);
  await id.fill("taken");
  await id.press("Enter");
  await expect(id).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator(`${field("id")} [part="error"]`)).toHaveText('The identifier "taken" is already used by n3');
  expect((await code(page, "Controls")).split("\n")[3]).toBe('  .id("save")');

  // C12: two selected nodes show their number and no fields.
  await select(page, "Controls", ["n2", "n3"]);
  await expect(page.locator(`${I} [part="count"]`)).toHaveText("2 selected");
  await expect(page.locator(`${I} [part="field"]`)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("C10: with nothing selected the Mockup tab edits the mockup's options, each edit one undo step", async ({ page }) => {
  const errors = await open(page, FIXTURE);
  await select(page, "Controls", []);
  await expect(page.locator(`${I} [part="tab"]`)).toHaveText("Mockup");
  await expect(page.locator(`${field("option:name")} output`)).toHaveText("Controls");
  await page.locator(`${field("option:device")} select`).selectOption("tablet");
  await expect.poll(() => page.evaluate(() => document.querySelector("#designer").session.mockup("Controls").options))
    .toEqual({ device: "tablet" });
  expect(await page.evaluate(() => window.changes.map((c) => c.kind))).toEqual(["options"]);
  const height = page.locator(`${field("option:height")} input`);
  await height.fill("0");
  await expect(height).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator(`${field("option:height")} [part="error"]`)).toHaveText("Must be at least 1");
  await page.click(UNDO);
  expect(await page.evaluate(() => document.querySelector("#designer").session.mockup("Controls").options)).toEqual({ device: "fit" });
  expect(errors).toEqual([]);
});
