// IT-72: sections and the canvas round trip (R-TOOL-014) on pages/designer.html with a document of
// three phone mockups and one section opened over the sample (DOC below): Sign in at (0, 0), Inbox at
// (485, 0), Message at (0, 1200), Inbox active; the section Flow {-40, -40, 600 × 2000}.
//
// The expected values were worked out by hand before the code ran. A phone frame is 393 units wide
// (R-TOOL-011.C1) and taller than 784 (the phone device is 852 high), so Flow (x -40..560, y -40..1960)
// holds Sign in (0..393 × 0..852) wholly, Inbox (485..878) only partly and Message (1200..2052) only
// partly:
//   - TC-2, new section: newSection("Onboarding") with Inbox active encloses Inbox's frame with 40 units:
//     {445, -40, 473 × (Inbox's height + 80)}, its label at its top left corner.
//   - TC-2, move: at 100 % with the view at (-100, -100), Flow's label dragged by (+13, +21) px puts
//     Flow at (-27, -19), snapped to the grid (-24, -16), a move of (16, 24): Sign in goes to (16, 24),
//     Inbox and Message stay. Dragged again by (+5, +3) with Alt held: Flow (-19, -13), Sign in (21, 27).
//     Two undos give back Flow (-40, -40) and Sign in (0, 0).
//   - TC-2, resize: Flow's top right corner dragged by (+37, -13) px: right 597 → 600, top -53 → -56, so
//     {-40, -56, 640 × 2016}; one undo gives back {-40, -40, 600 × 2000}.
//   - TC-2, rename: a double-click on Flow's label, "Main flow" and Enter rename it; an empty name is
//     refused with "A section's name must not be empty"; one undo gives back "Flow".
//   - TC-1: Message's label dragged by (+13, +21) at 100 % with the view at (-40, 900) goes to (16, 1224)
//     (as in IT-70), renamed "Reply"; at 50 % with the view at (-40, -40) a click on Sign in's frame
//     makes it active; Cmd/Ctrl+plus steps 50 % to 75 %; a wheel of (120, 80) px pans 160 and 106.67
//     units. The written document holds those positions and names, the section unchanged, and the view
//     {zoom 0.75, x, y of the canvas, active "Sign in"}; a fresh designer opening it shows the same view
//     and active mockup and writes the same text; the sample opened and written back is the sample.
//   - TC-3, current section: at 100 % with the view at (-100, -100), a click on Flow's label gives
//     Flow's section part `data-current`, which Preview mode removes and Design mode shows again.
//   - TC-3, New Section and Delete Section, on DOC without its section (BARE): designer.run("newSection")
//     adds "Section 1" around Inbox and opens the inline field over its label; "Checkout" and Enter name
//     it. A second run opens the field holding "Section 2"; Esc keeps that name, and it is current.
//     designer.run("deleteSection") removes it and its rectangle: one section (Checkout) left, the frames
//     at (0, 0), (485, 0), (0, 1200), no section current. BARE with a section added and deleted writes back
//     as it was opened (F-20.AC8).
import { expect, test } from "@playwright/test";

const D = "#designer";
const CODE = (t) => `VStack {\n  Text("${t}")\n}\n`;
const DOC = {
  format: "mockitdown-design",
  version: 1,
  name: "Three",
  defaults: { pack: "base", caption: false },
  sections: [{ name: "Flow", x: -40, y: -40, w: 600, h: 2000 }],
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
  }, DOC);
  return errors;
}

const canvas = (page) => page.locator(`${D} mockitdown-canvas`);
const section = (page, k) => page.locator(`${D} mockitdown-canvas [part="section"][data-section="${k}"]`);
const sectionLabel = (page, k) => section(page, k).locator(`[part="section-label"]`);
const frameLabel = (page, name) => page.locator(`${D} mockitdown-canvas [part="frame"][data-mockup="${name}"] > [part="label"]`);
const sections = (page) => page.evaluate(() => document.querySelector("#designer").session.document.sections.map((s) => ({ ...s })));
const positions = (page) => page.evaluate(() => document.querySelector("#designer").session.document.mockups.map((m) => [m.name, m.x, m.y]));
const setView = (page, view) => page.evaluate((v) => {
  document.querySelector("#designer").canvas.view = v;
}, view);
const undo = async (page) => {
  await canvas(page).focus();
  await page.keyboard.press("ControlOrMeta+z");
};

/** Press at (x, y), move by (dx, dy) in steps, release; Alt held while moving when asked. */
async function dragFrom(page, x, y, dx, dy, alt = false) {
  await page.mouse.move(x, y);
  await page.mouse.down();
  if (alt) await page.keyboard.down("Alt");
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 4 });
  await page.mouse.move(x + dx, y + dy, { steps: 4 });
  await page.mouse.up();
  if (alt) await page.keyboard.up("Alt");
}

async function dragLabel(page, locator, dx, dy, alt = false) {
  const box = await locator.boundingBox();
  await dragFrom(page, box.x + Math.min(10, box.width / 2), box.y + box.height / 2, dx, dy, alt);
}

test("TC-2: newSection, drawn behind the frames with its label at the top left; moving, resizing and renaming, one undo step each (C1-C3)", async ({ page }) => {
  const errors = await open(page);
  const frames = await page.evaluate(() => Object.fromEntries(document.querySelector("#designer").canvas.frames.map((f) => [f.name, f])));
  expect(frames["Inbox"].w).toBe(393);
  expect(frames["Message"].h).toBeGreaterThan(784);

  // C1: the sections' layer comes before the frames in the world, so it is drawn behind them.
  const first = await page.evaluate(() => document.querySelector("#designer").canvas.shadowRoot.querySelector('[part="world"]').firstElementChild.getAttribute("part"));
  expect(first).toBe("sections");
  await expect(sectionLabel(page, 0)).toHaveText("Flow");

  // C2: a new section encloses the active frame with 40 units.
  await setView(page, { zoom: 1, x: -100, y: -100 });
  const made = await page.evaluate(() => document.querySelector("#designer").session.newSection("Onboarding"));
  expect(made).toEqual({ section: 1 });
  expect((await sections(page))[1]).toEqual({ name: "Onboarding", x: 445, y: -40, w: 473, h: frames["Inbox"].h + 80 });
  await expect(sectionLabel(page, 1)).toHaveText("Onboarding");
  const box = await section(page, 1).boundingBox();
  const lbox = await sectionLabel(page, 1).boundingBox();
  expect(Math.abs(lbox.x - box.x)).toBeLessThanOrEqual(1.5);
  expect(Math.abs(lbox.y - box.y)).toBeLessThanOrEqual(1.5);
  expect(box.width).toBeCloseTo(473, 0);
  await undo(page);
  expect((await sections(page)).map((s) => s.name)).toEqual(["Flow"]);
  await expect(section(page, 1)).toHaveCount(0);

  // C3: dragging the label moves the section and the frames wholly inside it, snapped to the grid.
  await dragLabel(page, sectionLabel(page, 0), 13, 21);
  expect((await sections(page))[0]).toEqual({ name: "Flow", x: -24, y: -16, w: 600, h: 2000 });
  expect(await positions(page)).toEqual([["Sign in", 16, 24], ["Inbox", 485, 0], ["Message", 0, 1200]]);
  await dragLabel(page, sectionLabel(page, 0), 5, 3, true);
  expect((await sections(page))[0]).toEqual({ name: "Flow", x: -19, y: -13, w: 600, h: 2000 });
  expect(await positions(page)).toEqual([["Sign in", 21, 27], ["Inbox", 485, 0], ["Message", 0, 1200]]);
  await undo(page);
  await undo(page);
  expect((await sections(page))[0]).toEqual({ name: "Flow", x: -40, y: -40, w: 600, h: 2000 });
  expect(await positions(page)).toEqual([["Sign in", 0, 0], ["Inbox", 485, 0], ["Message", 0, 1200]]);

  // C3: dragging an edge resizes it: the top right corner by (+37, -13).
  const corner = await section(page, 0).locator(`[part="section-handle"][data-edge="ne"]`).boundingBox();
  await dragFrom(page, corner.x + corner.width / 2, corner.y + corner.height / 2, 37, -13);
  expect((await sections(page))[0]).toEqual({ name: "Flow", x: -40, y: -56, w: 640, h: 2016 });
  expect(await positions(page)).toEqual([["Sign in", 0, 0], ["Inbox", 485, 0], ["Message", 0, 1200]]);
  await undo(page);
  expect((await sections(page))[0]).toEqual({ name: "Flow", x: -40, y: -40, w: 600, h: 2000 });

  // C3: a double-click on the label renames it; an empty name is refused beside the field.
  const lb = await sectionLabel(page, 0).boundingBox();
  await page.mouse.dblclick(lb.x + 10, lb.y + lb.height / 2);
  const field = section(page, 0).locator(`[part="rename-field"]`);
  await expect(field).toBeVisible();
  await expect(field).toHaveValue("Flow");
  await field.fill("");
  await field.press("Enter");
  await expect(section(page, 0).locator(`[part="rename-error"]`)).toHaveText("A section's name must not be empty");
  await field.fill("Main flow");
  await field.press("Enter");
  await expect(field).toBeHidden();
  await expect(sectionLabel(page, 0)).toHaveText("Main flow");
  expect((await sections(page))[0].name).toBe("Main flow");
  await undo(page);
  await expect(sectionLabel(page, 0)).toHaveText("Flow");
  expect(errors).toEqual([]);
});

test("TC-1: the canvas's view, active mockup, frames and sections survive toJSON and open; the sample round-trips unchanged (C4, C5, V1)", async ({ page }) => {
  const errors = await open(page);
  // Move and rename a frame.
  await setView(page, { zoom: 1, x: -40, y: 900 });
  await dragLabel(page, frameLabel(page, "Message"), 13, 21);
  expect(await positions(page)).toEqual([["Sign in", 0, 0], ["Inbox", 485, 0], ["Message", 16, 1224]]);
  await frameLabel(page, "Message").dblclick();
  const field = page.locator(`${D} mockitdown-canvas [part="frame"] [part="rename-field"]`);
  await field.fill("Reply");
  await field.press("Enter");
  await expect(field).toBeHidden();
  // Activate one.
  await setView(page, { zoom: 0.5, x: -40, y: -40 });
  const vp = await canvas(page).boundingBox();
  await page.mouse.click(vp.x + (100 + 40) * 0.5, vp.y + (300 + 40) * 0.5);
  await expect.poll(() => page.evaluate(() => document.querySelector("#designer").session.active)).toBe("Sign in");
  // Zoom and pan.
  await canvas(page).focus();
  await page.keyboard.press("Control+Equal");
  const zoomed = await page.evaluate(() => document.querySelector("#designer").canvas.view);
  expect(zoomed.zoom).toBe(0.75);
  await page.mouse.move(vp.x + vp.width / 2, vp.y + vp.height / 2);
  await page.mouse.wheel(120, 80);
  await expect.poll(() => page.evaluate(() => document.querySelector("#designer").canvas.view.x)).toBeCloseTo(zoomed.x + 160, 6);
  const view = await page.evaluate(() => document.querySelector("#designer").canvas.view);
  expect(view.y).toBeCloseTo(zoomed.y + 80 / 0.75, 6);

  const result = await page.evaluate(async () => {
    const { writeDesign } = await import("/dist/design.js");
    const text = writeDesign(document.querySelector("#designer").toJSON());
    const fresh = document.createElement("mockitdown-designer");
    fresh.style.cssText = "display:block;width:1000px;height:700px";
    document.body.append(fresh);
    await fresh.open(text);
    await fresh.rendered;
    const reread = { view: fresh.canvas.view, active: fresh.session.active, text: writeDesign(fresh.toJSON()), sections: fresh.canvas.shadowRoot.querySelectorAll('[part="section"]').length };
    fresh.remove();
    return { text, reread };
  });
  const written = JSON.parse(result.text);
  expect(written).toEqual({
    ...DOC,
    mockups: [
      { name: "Sign in", x: 0, y: 0, options: { device: "phone" }, code: CODE("Welcome back") },
      { name: "Inbox", x: 485, y: 0, options: { device: "phone" }, code: CODE("Inbox") },
      { name: "Reply", x: 16, y: 1224, options: { device: "phone" }, code: CODE("Message") },
    ],
    view: { zoom: 0.75, x: view.x, y: view.y, active: "Sign in" },
  });
  expect(result.reread.view).toEqual(view);
  expect(result.reread.active).toBe("Sign in");
  expect(result.reread.sections).toBe(1);
  expect(result.reread.text).toBe(result.text);

  // C5: the sample opened and written back without an edit is the sample.
  const sample = await page.evaluate(async () => {
    const { writeDesign } = await import("/dist/design.js");
    const text = await (await fetch("/pages/designer-sample.mkdesign")).text();
    const fresh = document.createElement("mockitdown-designer");
    document.body.append(fresh);
    await fresh.open(text);
    await fresh.rendered;
    const out = writeDesign(fresh.toJSON());
    const labels = [...fresh.canvas.shadowRoot.querySelectorAll('[part="section-label"]')].map((l) => l.textContent);
    fresh.remove();
    return { same: out === text, labels };
  });
  expect(sample).toEqual({ same: true, labels: ["Main"] });
  expect(errors).toEqual([]);
});

const BARE = (() => {
  const d = { ...DOC };
  delete d.sections;
  return d;
})();

test("TC-3: a click on a section's label makes it the current section, which Preview mode hides (C11)", async ({ page }) => {
  const errors = await open(page);
  await expect(section(page, 0)).not.toHaveAttribute("data-current");
  await setView(page, { zoom: 1, x: -100, y: -100 });
  const box = await sectionLabel(page, 0).boundingBox();
  await page.mouse.click(box.x + Math.min(10, box.width / 2), box.y + box.height / 2);
  await expect(section(page, 0)).toHaveAttribute("data-current", "");
  expect(await page.evaluate(() => document.querySelector("#designer").session.currentSection)).toBe(0);
  await page.evaluate(() => { document.querySelector("#designer").mode = "preview"; });
  await expect(section(page, 0)).not.toHaveAttribute("data-current");
  await page.evaluate(() => { document.querySelector("#designer").mode = "design"; });
  await expect(section(page, 0)).toHaveAttribute("data-current", "");
  expect(errors).toEqual([]);
});

test("TC-3: New Section names its section in the inline field, Delete Section removes the current one (C12, C14)", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/designer.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  await page.evaluate(async (doc) => {
    const d = document.querySelector("#designer");
    await d.open(doc);
    await d.rendered;
  }, BARE);
  const run = (name, args) => page.evaluate(([n, a]) => document.querySelector("#designer").run(n, a), [name, args]);
  expect(await run("newSection")).toEqual({ section: 0 });
  const field0 = sectionLabel(page, 0).locator(`[part="rename-field"]`);
  await expect(field0).toBeFocused();
  await expect(field0).toHaveValue("Section 1");
  await field0.fill("Checkout");
  await field0.press("Enter");
  await expect(field0).toBeHidden();
  await expect(sectionLabel(page, 0)).toHaveText("Checkout");
  expect(await run("newSection")).toEqual({ section: 1 });
  const field1 = sectionLabel(page, 1).locator(`[part="rename-field"]`);
  await expect(field1).toHaveValue("Section 2");
  await field1.press("Escape");
  await expect(field1).toBeHidden();
  await expect(sectionLabel(page, 1)).toHaveText("Section 2");
  await expect(section(page, 1)).toHaveAttribute("data-current", "");
  expect((await sections(page)).map((s) => s.name)).toEqual(["Checkout", "Section 2"]);

  expect(await run("deleteSection")).toEqual({ section: 1 });
  await expect(page.locator(`${D} mockitdown-canvas [part="section"]`)).toHaveCount(1);
  await expect(page.locator(`${D} mockitdown-canvas [part="section"][data-current]`)).toHaveCount(0);
  expect((await sections(page)).map((s) => s.name)).toEqual(["Checkout"]);
  expect(await positions(page)).toEqual([["Sign in", 0, 0], ["Inbox", 485, 0], ["Message", 0, 1200]]);
  expect(await page.evaluate(() => document.querySelector("#designer").session.currentSection)).toBe(null);

  // F-20.AC8: a section added and then deleted leaves the document as it was opened.
  const same = await page.evaluate(async (doc) => {
    const { writeDesign } = await import("/dist/design.js");
    const d = document.querySelector("#designer");
    await d.open(doc);
    await d.rendered;
    const before = writeDesign(d.toJSON());
    d.session.newSection("Flow");
    d.session.deleteSection();
    return writeDesign(d.toJSON()) === before;
  }, BARE);
  expect(same).toBe(true);
  expect(errors).toEqual([]);
});
