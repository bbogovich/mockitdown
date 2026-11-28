// IT-57: the gallery element `mockitdown-gallery` (R-TOOL-004) inside the composite designer on
// pages/designer.html, which opens the hand-written fixtures/gallery-sample.mkdesign: "Toolbar" (base,
// the active mockup) declares `struct Badge` and nests HStack #actions holding Button("Cancel") in a
// VStack; "Cards" is in the vuetify pack. Playwright's CSS locators pierce open shadow roots.
//
// The expected code after each Add, the refusal sentence for frames inside a horizontal stack
// (R-PACK-016.C6's own example) and the element names below were written by hand from the fixture and
// the reference data before the gallery existed; the own/inherited split is read from
// shared/reference/vuetify.json, the data the gallery is meant to follow.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const HERE = dirname(fileURLToPath(import.meta.url));
const SAMPLE = readFileSync(join(HERE, "fixtures", "gallery-sample.mkdesign"), "utf8");
const VUETIFY = JSON.parse(readFileSync(join(HERE, "..", "..", "..", "shared", "reference", "vuetify.json"), "utf8"));
const FRAME_IN_HSTACK = "A frame cannot be placed inside a horizontal stack";
const AFTER_ADD = 'struct Badge: View {\n  var body: some View {\n    Text("New")\n  }\n}\n\nVStack {\n  Text("Settings")\n  HStack {\n    Button("Cancel")\n    Toggle()\n  }.id("actions")\n}\n';

const G = "#designer mockitdown-gallery";
const card = (name) => `${G} .mkd-gallery__card[data-element="${name}"]`;

/** Open the designer page, then the fixture document in its designer; record requests and insert events. */
async function open(page) {
  const errors = [];
  const requests = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("request", (r) => requests.push(new URL(r.url()).pathname));
  await page.goto("/pages/designer.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  await page.evaluate(async (text) => {
    window.inserts = [];
    document.addEventListener("mockitdown-insert", (e) => window.inserts.push({ target: e.target.localName, detail: JSON.parse(JSON.stringify(e.detail)) }));
    const d = document.querySelector("#designer");
    await d.open(text);
    await d.rendered;
  }, SAMPLE);
  return { errors, requests };
}

const gallery = "document.querySelector('#designer').shadowRoot.querySelector('mockitdown-gallery')";

/** Select HStack #`id` of the active mockup, or clear the selection with null; wait for the gallery. */
async function selectById(page, id) {
  await page.evaluate(async ([want, g]) => {
    const s = document.querySelector("#designer").session;
    const tree = s.tree(s.active);
    const node = want === null ? null : tree.nodes.find((n) => n.name === "HStack" && tree.source.slice(n.first, n.span.end).includes(`.id("${want}")`));
    s.select(node ? [node.id] : []);
    await eval(g).rendered;
  }, [id, gallery]);
}

/** The names of the shown element cards, in order. */
const shown = (page) => page.locator(`${G} .mkd-gallery__card[data-element]`).evaluateAll((els) => els.map((e) => e.dataset.element));

test("TC-1: with an HStack selected the gallery hides frames under Hidden here, and Add appends the element as its last child (C1, C3, C6, C7, C8, V1)", async ({ page }) => {
  const { errors } = await open(page);
  // C6: nothing selected: what the root of a mockup allows, root-only frames included.
  await selectById(page, null);
  let names = await shown(page);
  expect(names).toContain("NavigationSplitView");
  expect(names).toContain("TabView");
  // C1: grouped by the category of their role.
  const groups = await page.locator(`${G} .mkd-gallery__group[data-category]`).evaluateAll((els) => els.map((e) => e.dataset.category));
  expect(groups).toContain("frame");
  expect(groups).toContain("layout");

  // C6, C7, V1: the HStack selected.
  await selectById(page, "actions");
  names = await shown(page);
  expect(names).not.toContain("NavigationSplitView");
  expect(names).not.toContain("TabView");
  expect(names).toContain("Toggle");
  const hidden = page.locator(`${G} .mkd-gallery__hidden`);
  await expect(hidden.locator("summary")).toContainText("Hidden here");
  const reason = hidden.locator(`.mkd-gallery__reason[data-reason="${FRAME_IN_HSTACK}"]`);
  await expect(reason).toContainText(FRAME_IN_HSTACK);
  await expect(reason.locator('[data-element="NavigationSplitView"]')).toHaveCount(1);
  await expect(reason.locator('[data-element="TabView"]')).toHaveCount(1);
  const listed = await hidden.locator("li[data-element]").count();
  expect(Number(await hidden.getAttribute("data-count"))).toBe(listed);
  await expect(hidden.locator("summary")).toContainText(`(${listed})`);

  // C3: previews only for cards near the viewport: the first card has one, the last card none yet.
  const first = page.locator(`${card(names[0])} mockitdown-mockup`);
  await expect(first).toHaveCount(1);
  await expect(first).toHaveAttribute("device", "fit");
  await expect(first).toHaveAttribute("pack", "base");
  const last = names[names.length - 1];
  await expect(page.locator(`${card(last)} mockitdown-mockup`)).toHaveCount(0);
  await page.locator(card(last)).scrollIntoViewIfNeeded();
  await expect(page.locator(`${card(last)} mockitdown-mockup`)).toHaveCount(1);

  // C8, V1: Add on Toggle appends Toggle(…) as the HStack's last child, selects it, one mockitdown-insert.
  await page.locator(`${card("Toggle")} .mkd-gallery__add`).click();
  const after = await page.evaluate(() => {
    const s = document.querySelector("#designer").session;
    const tree = s.tree(s.active);
    const sel = s.selection.map((id) => tree.byId(id));
    return { code: s.code(s.active), selected: sel.map((n) => n.name), parent: sel[0]?.parent?.name, inserts: window.inserts, ids: [...s.selection] };
  });
  expect(after.code).toBe(AFTER_ADD);
  expect(after.selected).toEqual(["Toggle"]);
  expect(after.parent).toBe("HStack");
  expect(after.inserts).toEqual([{ target: "mockitdown-designer", detail: { mockup: "Toolbar", node: after.ids[0], element: "Toggle" } }]);
  expect(errors).toEqual([]);
});

test("TC-1: a double-click or Enter on a card adds it, at the end of the mockup's root when nothing is selected (C8)", async ({ page }) => {
  await open(page);
  await selectById(page, null);
  await page.locator(card("Text")).dblclick();
  let code = await page.evaluate(() => document.querySelector("#designer").session.code("Toolbar"));
  expect(code.endsWith('  }.id("actions")\n}\nText()\n')).toBe(true);
  await selectById(page, null);
  await page.locator(card("Divider")).focus();
  await page.keyboard.press("Enter");
  code = await page.evaluate(() => document.querySelector("#designer").session.code("Toolbar"));
  expect(code.endsWith("}\nText()\nDivider()\n")).toBe(true);
  expect(await page.evaluate(() => window.inserts.map((e) => e.detail.element))).toEqual(["Text", "Divider"]);
});

test("TC-2: reference data from dist/shared, search by filter, the Components group, another pack's own elements first (C2, C4, C5)", async ({ page }) => {
  const { errors, requests } = await open(page);
  await selectById(page, null);
  // C2: the reference data comes from the package's dist/shared/reference/, nothing from shared/.
  expect(requests).toContain("/dist/shared/reference/base.json");
  expect(requests.filter((p) => p.startsWith("/shared/"))).toEqual([]);

  // C5: the struct the mockup declares.
  await expect(page.locator(`${G} .mkd-gallery__group[data-category="components"] [data-component="Badge"]`)).toHaveCount(1);

  // C4: the filter property narrows the cards and mirrors the search field.
  await page.evaluate(async (g) => {
    eval(g).filter = "toggle";
    await eval(g).rendered;
  }, gallery);
  await expect(page.locator(`${G} input[type="search"]`)).toHaveValue("toggle");
  const matches = await page.locator(`${G} .mkd-gallery__card[data-element]`).evaluateAll((els) => els.map((e) => ({
    name: e.dataset.element, role: e.dataset.role, doc: e.dataset.doc ?? "" })));
  expect(matches.map((m) => m.name)).toContain("Toggle");
  for (const m of matches) expect(`${m.name} ${m.role} ${m.doc}`.toLowerCase()).toContain("toggle");
  await expect(page.locator(`${G} [data-component="Badge"]`)).toHaveCount(0);
  // Typing into the field sets the property.
  await page.locator(`${G} input[type="search"]`).fill("BADGE");
  expect(await page.evaluate((g) => eval(g).filter, gallery)).toBe("BADGE");
  await expect(page.locator(`${G} [data-component="Badge"]`)).toHaveCount(1);
  await page.locator(`${G} input[type="search"]`).fill("");

  // C1, C2: the vuetify mockup lists vuetify's own elements first in each group.
  await page.evaluate(async (g) => {
    document.querySelector("#designer").session.setActive("Cards");
    await eval(g).rendered;
  }, gallery);
  expect(requests).toContain("/dist/shared/reference/vuetify.json");
  const own = new Set(VUETIFY.elements.filter((e) => e.own).map((e) => e.name));
  const byGroup = await page.locator(`${G} .mkd-gallery__group[data-category]:not([data-category="components"])`).evaluateAll((gs) =>
    gs.map((g) => [...g.querySelectorAll(".mkd-gallery__card[data-element]")].map((c) => c.dataset.element)));
  expect(own.has(byGroup.flat()[0])).toBe(true);
  for (const names of byGroup) {
    const firstInherited = names.findIndex((n) => !own.has(n));
    if (firstInherited >= 0) expect(names.slice(firstInherited).every((n) => !own.has(n))).toBe(true);
  }
  await expect(page.locator(`${card("VBtn")} .mkd-gallery__name`)).toHaveText("VBtn");
  expect(errors).toEqual([]);
});
