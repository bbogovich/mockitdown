// IT-55: the composite designer `mockitdown-designer` (R-TOOL-003) and the DOM events of the design
// tools (R-EDIT-006.C7, C8, C11) in a browser, on pages/designer.html, which opens
// pages/designer-sample.mkdesign: "Sign in" (mui, phone) and "Inbox" (base, fit; the view's active
// mockup), whose code nests Button("Open").id("open") after Text("Quarterly report") in a Card in a
// List under a VStack, with a comment, a let and a ForEach. Playwright's CSS locators pierce open
// shadow roots.
//
// The expected document after deleting the button (fixtures/designer-deleted.mkdesign), the removed
// line and the selection after the delete (the button's previous sibling, as R-TOOL-003.C11 says when
// there is no next one) were written by hand from the sample before the designer existed.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const HERE = dirname(fileURLToPath(import.meta.url));
const SAMPLE = readFileSync(join(HERE, "..", "..", "pages", "designer-sample.mkdesign"), "utf8");
const DELETED = readFileSync(join(HERE, "fixtures", "designer-deleted.mkdesign"), "utf8");
const BUTTON_LINE = '      Button("Open") {}.id("open")\n';

const D = "#designer";
const EDITOR = `${D} mockitdown-editor`;
const BUTTON = `${EDITOR} .mkd-editor__view [data-el="Button"]`;
const EVENTS = ["mockitdown-select", "mockitdown-change", "mockitdown-insert", "mockitdown-rename", "mockitdown-diagnostics"];

async function open(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/designer.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  return errors;
}

/** Record every design event that reaches `document`, with its target's tag. */
function listen(page) {
  return page.evaluate((types) => {
    window.seen = [];
    for (const type of types) {
      document.addEventListener(type, (e) => window.seen.push({ type, target: e.target.localName, detail: JSON.parse(JSON.stringify(e.detail)) }));
    }
  }, EVENTS);
}

const seen = (page, type) => page.evaluate((t) => window.seen.filter((e) => !t || e.type === t), type);

/** The element names of the selected nodes, and the source text of the first. */
function selected(page) {
  return page.evaluate(() => {
    const s = document.querySelector("#designer").session;
    const tree = s.tree(s.active);
    const nodes = s.selection.map((id) => tree.byId(id));
    return { names: nodes.map((n) => n.name), text: nodes[0] ? tree.source.slice(nodes[0].first, nodes[0].span.end) : null };
  });
}

/** The designer's written document. */
const written = (page) => page.evaluate(async () => (await import("/dist/design.js")).writeDesign(document.querySelector("#designer").toJSON()));

test("TC-1: open, select, delete, toJSON — one change, the next selection, the document round trip (C1, C5-C7, C11, C13, C14, V1)", async ({ page }) => {
  const errors = await open(page);
  // C1, C14: the designer owns the session its outline and editor share; the sample's view.active is open.
  const shape = await page.evaluate(() => {
    const d = document.querySelector("#designer");
    const parts = [...d.shadowRoot.querySelectorAll("mockitdown-editor, mockitdown-outline")];
    return {
      defined: customElements.get("mockitdown-designer") === d.constructor,
      session: d.session?.constructor?.name,
      active: d.session.active,
      mockups: d.session.document.mockups.map((m) => m.name),
      parts: parts.map((p) => p.localName),
      shared: parts.every((p) => p.session === d.session),
      text: window.mockitdownSample,
    };
  });
  expect(shape).toEqual({
    defined: true, session: "DesignSession", active: "Inbox", mockups: ["Sign in", "Inbox"],
    parts: ["mockitdown-outline", "mockitdown-editor"], shared: true, text: SAMPLE,
  });
  // C7: nothing edited yet, so the document writes back as it was read.
  expect(await written(page)).toBe(SAMPLE);

  await listen(page);
  await page.click(BUTTON);
  expect((await selected(page)).names).toEqual(["Button"]);
  await page.keyboard.press("Delete");

  // C11, C13, V1: exactly one change, from the designer, whose one edit removes the button's line.
  await expect.poll(async () => (await seen(page, "mockitdown-change")).length).toBe(1);
  const [change] = await seen(page, "mockitdown-change");
  expect(change.target).toBe("mockitdown-designer");
  expect(change.detail.kind).toBe("code");
  expect(change.detail.mockup).toBe("Inbox");
  const inbox = JSON.parse(SAMPLE).mockups[1].code;
  expect(change.detail.edits).toHaveLength(1);
  const [e] = change.detail.edits;
  expect(inbox.slice(e.start, e.end)).toBe(BUTTON_LINE);
  expect(e.text).toBe("");
  // C11: no next sibling in the card, so its previous sibling is selected — one select for the delete.
  expect(await selected(page)).toEqual({ names: ["Text"], text: 'Text("Quarterly report")' });
  const selects = await seen(page, "mockitdown-select");
  expect(selects.map((s) => s.target)).toEqual(["mockitdown-designer", "mockitdown-designer"]);
  // C7: the document with only the button's line removed, unknown keys and key order kept.
  expect(await written(page)).toBe(DELETED);
  await expect(page.locator(BUTTON)).toHaveCount(0);

  // Backspace in the outline deletes too (C11): the Text row is current there after the selection.
  await page.locator(`${D} mockitdown-outline [role="tree"]`).focus();
  await page.keyboard.press("Backspace");
  await expect.poll(async () => (await seen(page, "mockitdown-change")).length).toBe(2);
  expect((await selected(page)).names).toEqual(["Card"], "the card's only child deleted: the card");
  expect((await seen(page)).every((x) => x.target === "mockitdown-designer")).toBe(true);

  // C5: a document that is not valid is refused with readDesign's errors, and the current one is kept.
  const before = await written(page);
  const refused = await page.evaluate(async () => {
    const d = document.querySelector("#designer");
    try {
      await d.open({ ...JSON.parse(window.mockitdownSample), version: 2 });
      return null;
    } catch (err) {
      return { name: err.name, errors: err.errors };
    }
  });
  expect(refused).toEqual({ name: "DesignOpenError", errors: [{ path: "version", message: "version must be 1, found 2" }] });
  expect(await written(page)).toBe(before);

  // C5, C6: an object opens as its text does; `document` returns toJSON() and, set, opens a document.
  const reopened = await page.evaluate(async () => {
    const d = document.querySelector("#designer");
    const same = d.document === d.toJSON();
    const doc = JSON.parse(window.mockitdownSample);
    delete doc.view;
    await d.open(doc);
    const first = d.session.active;
    d.document = window.mockitdownSample;
    return { same, first, active: d.session.active, shared: d.shadowRoot.querySelector("mockitdown-editor").session === d.session };
  });
  expect(reopened).toEqual({ same: true, first: "Sign in", active: "Inbox", shared: true });
  expect(await written(page)).toBe(SAMPLE);
  await expect(page.locator(BUTTON)).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("TC-2: layout, slots, toolbar, status bar and modes (C2-C4, C8-C10, C12)", async ({ page }) => {
  const errors = await open(page);
  const box = async (sel) => (await page.locator(`${D} ${sel}`).first().boundingBox());

  // C2: toolbar on top, a 240 px left column (outline above gallery), the view, a 260 px right panel, the status bar.
  const [toolbar, left, outline, gallery, view, right, status] = await Promise.all(
    [".mkd-designer__toolbar", ".mkd-designer__left", ".mkd-designer__outline", ".mkd-designer__gallery",
      ".mkd-designer__center", ".mkd-designer__right", ".mkd-designer__status"].map(box));
  expect(Math.round(left.width)).toBe(240);
  expect(Math.round(right.width)).toBe(260);
  expect(toolbar.y + toolbar.height).toBeLessThanOrEqual(left.y + 0.5);
  expect(outline.y + outline.height).toBeLessThanOrEqual(gallery.y + 0.5);
  expect(left.x + left.width).toBeLessThanOrEqual(view.x + 0.5);
  expect(view.x + view.width).toBeLessThanOrEqual(right.x + 0.5);
  expect(status.y).toBeGreaterThanOrEqual(view.y + view.height - 0.5);
  expect(await page.evaluate(() => document.querySelector("#designer").layout)).toEqual({
    left: { size: 240, collapsed: false }, right: { size: 260, collapsed: false },
  });

  // C3: dragging the left panel's inner edge resizes it, and `layout` says so; a host can set it.
  const edge = await box(".mkd-designer__resizer--left");
  await page.mouse.move(edge.x + edge.width / 2, edge.y + 40);
  await page.mouse.down();
  await page.mouse.move(edge.x + edge.width / 2 + 60, edge.y + 40, { steps: 4 });
  await page.mouse.up();
  expect(Math.round((await box(".mkd-designer__left")).width)).toBe(300);
  expect((await page.evaluate(() => document.querySelector("#designer").layout)).left).toEqual({ size: 300, collapsed: false });
  await page.evaluate(() => { document.querySelector("#designer").layout = { right: { collapsed: true } }; });
  await expect(page.locator(`${D} .mkd-designer__right`)).toBeHidden();
  expect(await page.evaluate(() => document.querySelector("#designer").layout)).toEqual({
    left: { size: 300, collapsed: false }, right: { size: 260, collapsed: true },
  });
  // The toolbar's panel toggle shows it again.
  await page.click(`${D} .mkd-designer__toggle[data-panel="right"]`);
  await expect(page.locator(`${D} .mkd-designer__right`)).toBeVisible();

  // C10: the mode switch, and the active mockup's pack and device.
  await expect(page.locator(`${D} .mkd-designer__modes [role="radio"]`)).toHaveText(["Design", "Preview", "Code"]);
  await expect(page.locator(`${D} .mkd-designer__pack`)).toHaveText("base");
  await expect(page.locator(`${D} .mkd-designer__device`)).toHaveText("fit");

  // C12: the diagnostic count and the breadcrumb, whose crumbs select their nodes.
  await expect(page.locator(`${D} .mkd-designer__diagnostics`)).toHaveText("0 diagnostics");
  await page.click(BUTTON);
  await expect(page.locator(`${D} .mkd-designer__crumb`)).toHaveText(["VStack", "List", "Card", "Button"]);
  await page.click(`${D} .mkd-designer__crumb >> text=List`);
  expect((await selected(page)).names).toEqual(["List"]);
  await expect(page.locator(`${D} .mkd-designer__crumb`)).toHaveText(["VStack", "List"]);
  await page.evaluate(() => {
    const d = document.querySelector("#designer");
    d.session.setCode("Inbox", d.session.code("Inbox") + "Text(\"x\").frobnicate()\n");
  });
  await expect(page.locator(`${D} .mkd-designer__diagnostics`)).toHaveText("1 diagnostic");

  // C4: an element in a slot replaces that panel and is given the designer's session.
  const slotted = await page.evaluate(async () => {
    customElements.define("my-inspector", class extends HTMLElement {
      set session(s) { this.given = s; this.textContent = "custom inspector"; }
      get session() { return this.given; }
    });
    const d = document.querySelector("#designer");
    const mine = document.createElement("my-inspector");
    mine.slot = "inspector";
    d.append(mine);
    const outline = document.createElement("mockitdown-outline");
    outline.slot = "outline";
    d.append(outline);
    await new Promise((r) => setTimeout(r, 50));
    await outline.rendered;
    const slot = (name) => d.shadowRoot.querySelector(`slot[name="${name}"]`).assignedElements();
    return {
      given: mine.given === d.session,
      inspector: slot("inspector").map((e) => e.localName),
      outlineJoined: outline.session === d.session,
      outline: slot("outline").map((e) => e.localName),
      rows: outline.rows.length > 0,
    };
  });
  expect(slotted).toEqual({ given: true, inspector: ["my-inspector"], outlineJoined: true, outline: ["mockitdown-outline"], rows: true });
  const rightBox = await box(".mkd-designer__right");
  const mineBox = await page.locator("my-inspector").boundingBox();
  expect(mineBox.x).toBeGreaterThanOrEqual(rightBox.x - 0.5);
  expect(mineBox.x + mineBox.width).toBeLessThanOrEqual(rightBox.x + rightBox.width + 0.5);

  // C8: an unknown mode reads as design; the property reflects the attribute.
  expect(await page.evaluate(() => {
    const d = document.querySelector("#designer");
    d.setAttribute("mode", "wild");
    const wild = d.mode;
    d.removeAttribute("mode");
    return [wild, d.mode];
  })).toEqual(["design", "design"]);

  // C9: Preview hides the side panels and shows every mockup read-only through mockitdown-mockup with
  // the mockup's options, rendered as a mockitdown-mockup alone renders the same code.
  await page.click(`${D} .mkd-designer__modes [role="radio"] >> text=Preview`);
  expect(await page.evaluate(() => [document.querySelector("#designer").mode, document.querySelector("#designer").getAttribute("mode")]))
    .toEqual(["preview", "preview"]);
  await expect(page.locator(`${D} .mkd-designer__left`)).toBeHidden();
  await expect(page.locator(`${D} .mkd-designer__right`)).toBeHidden();
  await expect(page.locator(`${D} mockitdown-editor`)).toBeHidden();
  await expect(page.locator(`${D} .mkd-designer__preview-list button`)).toHaveText(["Sign in", "Inbox"]);
  const same = await page.evaluate(async () => {
    const d = document.querySelector("#designer");
    // R-TOOL-011.C9: the previews are the canvas's read-only frames.
    const previews = [...d.canvas.shadowRoot.querySelectorAll("[part=frame] mockitdown-mockup")];
    await Promise.all(previews.map((p) => p.rendered));
    const out = [];
    for (const p of previews) {
      const alone = document.createElement("mockitdown-mockup");
      for (const a of p.getAttributeNames()) alone.setAttribute(a, p.getAttribute(a));
      alone.code = p.code;
      document.body.append(alone);
      await alone.rendered;
      out.push({ attrs: Object.fromEntries(p.getAttributeNames().map((a) => [a, p.getAttribute(a)])), same: alone.shadowRoot.innerHTML === p.shadowRoot.innerHTML, edit: p.shadowRoot.innerHTML.includes("data-mkd-node") });
      alone.remove();
    }
    return out;
  });
  expect(same).toEqual([
    { attrs: { pack: "mui", caption: "false", device: "phone" }, same: true, edit: false },
    { attrs: { pack: "base", caption: "false", device: "fit" }, same: true, edit: false },
  ]);
  // The appearance toggle: light, dark and both.
  await expect(page.locator(`${D} .mkd-designer__appearance button`)).toHaveText(["Light", "Dark", "Both"]);
  await page.click(`${D} .mkd-designer__appearance button >> text=Dark`);
  expect(await page.evaluate(() => [...document.querySelector("#designer").canvas.shadowRoot.querySelectorAll("[part=frame] mockitdown-mockup")]
    .map((p) => p.getAttribute("appearance")))).toEqual(["dark", "dark"]);

  // Code mode shows the active mockup's code, with the outline still there; Design brings the view back.
  await page.click(`${D} .mkd-designer__modes [role="radio"] >> text=Code`);
  await expect(page.locator(`${D} .mkd-designer__code`)).toContainText('Text("Quarterly report")');
  await expect(page.locator(`${D} .mkd-designer__left`)).toBeVisible();
  await page.click(`${D} .mkd-designer__modes [role="radio"] >> text=Design`);
  await expect(page.locator(`${D} mockitdown-editor`)).toBeVisible();
  expect(errors).toEqual([]);
});

test("R-EDIT-006 TC-2: DOM events — once per action, from the designer; an outside outline with the session joins it (C7, C8, C11)", async ({ page }) => {
  const errors = await open(page);
  await listen(page);
  const ids = await page.evaluate(() => {
    const s = document.querySelector("#designer").session;
    const tree = s.tree(s.active);
    const of = (name) => tree.nodes.find((n) => n.name === name).id;
    return { list: of("List"), card: of("Card") };
  });

  // A selection made in the designer's outline: one mockitdown-select, from the designer, with the detail.
  await page.click(`${D} mockitdown-outline [role="treeitem"] >> text=List`);
  await expect.poll(async () => (await seen(page)).length).toBe(1);
  expect(await seen(page)).toEqual([{ type: "mockitdown-select", target: "mockitdown-designer", detail: { mockup: "Inbox", nodes: [ids.list] } }]);

  // An insert: one change and one insert (then nothing else of these kinds).
  await page.evaluate((list) => {
    document.querySelector("#designer").session.apply({ op: "insert", parent: list, index: "end", code: 'Text("Archive")' });
  }, ids.list);
  const afterInsert = await seen(page);
  expect(afterInsert.map((e) => [e.type, e.target])).toEqual([
    ["mockitdown-select", "mockitdown-designer"],
    ["mockitdown-change", "mockitdown-designer"],
    ["mockitdown-insert", "mockitdown-designer"],
  ]);
  expect(afterInsert[1].detail.kind).toBe("code");
  expect(afterInsert[1].detail.edits).toHaveLength(1);
  expect(afterInsert[1].detail.edits[0].text).toContain('Text("Archive")');
  expect(afterInsert[2].detail).toMatchObject({ mockup: "Inbox", element: "Text" });

  // An outline outside the designer, given the designer's session, joins it: a selection made in it
  // reaches the host once, from the designer, and the outline dispatches nothing itself (C8).
  await page.evaluate(async () => {
    window.seen = [];
    const outside = document.createElement("mockitdown-outline");
    outside.id = "outside";
    outside.style.height = "12rem";
    document.body.prepend(outside);
    outside.session = document.querySelector("#designer").session;
    await outside.rendered;
  });
  await page.click('#outside [role="treeitem"] >> text=VStack');
  await expect.poll(async () => (await seen(page)).length).toBe(1);
  const [outsideSelect] = await seen(page);
  expect(outsideSelect.type).toBe("mockitdown-select");
  expect(outsideSelect.target).toBe("mockitdown-designer");
  expect(await page.evaluate(() => document.querySelector("#outside").session === document.querySelector("#designer").session)).toBe(true);
  expect(errors).toEqual([]);
});
