// IT-54: the `mockitdown-outline` element (R-TOOL-002) in a browser, on pages/editor.html, where it
// shares the editor's session. The sample nests Button("Open").id("open") in a Card in a List under a
// VStack and has a ForEach of three Text rows. Playwright's CSS locators pierce open shadow roots.
//
// The expected rows below were written by hand from the sample's source and the evaluation rules
// (one row per view a view node produced, nested as the views are; a ForEach gives one italic row
// per item), before the element existed.
import { expect, test } from "@playwright/test";

const EDITOR = "#editor";
const OUTLINE = "#outline";
const BUTTON = `${EDITOR} .mkd-editor__view [data-el="Button"]`;
const ROWS = `${OUTLINE} [role="treeitem"]`;

async function open(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/editor.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  return errors;
}

/** The visible rows: [level, name, label, chip, italic, link icon, expanded, selected]. */
function rows(page) {
  return page.evaluate(() => [...document.querySelector("#outline").shadowRoot.querySelectorAll('[role="treeitem"]')]
    .filter((r) => !r.hidden)
    .map((r) => [
      Number(r.getAttribute("aria-level")),
      r.querySelector(".mkd-outline__name").textContent,
      r.querySelector(".mkd-outline__label")?.textContent ?? "",
      r.querySelector(".mkd-outline__chip")?.textContent ?? "",
      getComputedStyle(r.querySelector(".mkd-outline__name")).fontStyle === "italic",
      !!r.querySelector(".mkd-outline__link"),
      r.getAttribute("aria-expanded"),
      r.getAttribute("aria-selected"),
    ]));
}

/** The element names of the selected nodes. */
function selected(page) {
  return page.evaluate(() => {
    const s = document.querySelector("#outline").session;
    const tree = s.tree(s.active);
    return s.selection.map((id) => tree.byId(id).name);
  });
}

const row = (page, name, label) => page.locator(ROWS).filter({ has: page.locator(".mkd-outline__name", { hasText: new RegExp(`^${name}$`) }) })
  .filter(label ? { has: page.locator(".mkd-outline__label", { hasText: label }) } : {});

test("TC-1: tree and selection sync — rows, levels, labels, chips, indent, click to locate, derived rows (C1-C4, C6, C9, V1)", async ({ page }) => {
  const errors = await open(page);
  // C1, C9: one outline on the page, an ARIA tree over the editor's session.
  const shape = await page.evaluate(() => {
    const o = document.querySelector("#outline");
    const e = document.querySelector("#editor");
    return {
      defined: customElements.get("mockitdown-outline") === o.constructor,
      shared: o.session === e.session,
      tree: o.shadowRoot.querySelectorAll('[role="tree"]').length,
    };
  });
  expect(shape).toEqual({ defined: true, shared: true, tree: 1 });

  // C2, C3: the top-level rows are expanded, deeper rows collapsed.
  expect(await rows(page)).toEqual([
    [1, "VStack", "", "", false, false, "true", "false"],
    [2, "Text", "Inbox", "", false, false, null, "false"],
    [2, "List", "", "", false, false, "false", "false"],
  ]);

  // C6, V1: a click on the nested button in the editor expands the list and the card and selects the row.
  await page.click(BUTTON);
  await expect(row(page, "Button")).toHaveAttribute("aria-selected", "true");
  expect(await rows(page)).toEqual([
    [1, "VStack", "", "", false, false, "true", "false"],
    [2, "Text", "Inbox", "", false, false, null, "false"],
    [2, "List", "", "", false, false, "true", "false"],
    [3, "Card", "", "", false, false, "true", "false"],
    [4, "Text", "Quarterly report", "", false, false, null, "false"],
    [4, "Button", "Open", "#open", false, false, null, "true"],
    [3, "Text", "Alpha", "", true, true, null, "false"],
    [3, "Text", "Beta", "", true, true, null, "false"],
    [3, "Text", "Gamma", "", true, true, null, "false"],
  ]);
  // The selected row is in view inside the tree's scrolling box.
  const inView = await page.evaluate(() => {
    const root = document.querySelector("#outline").shadowRoot;
    const tree = root.querySelector('[role="tree"]').getBoundingClientRect();
    const r = root.querySelector('[role="treeitem"][aria-selected="true"]').getBoundingClientRect();
    return r.top >= tree.top - 0.5 && r.bottom <= tree.bottom + 0.5;
  });
  expect(inView).toBe(true);

  // C3: 14 CSS pixels of indent per level, measured at the disclosure triangle.
  const indents = await page.evaluate(() => [...document.querySelector("#outline").shadowRoot.querySelectorAll('[role="treeitem"]')]
    .filter((r) => !r.hidden)
    .map((r) => [Number(r.getAttribute("aria-level")), r.querySelector(".mkd-outline__twisty").getBoundingClientRect().left]));
  const base = indents[0][1];
  for (const [level, left] of indents) expect(Math.round(left - base)).toBe(14 * (level - 1));

  // C4: a derived row selects the ForEach that produced it; its three rows show as selected.
  await row(page, "Text", "Beta").click();
  expect(await selected(page)).toEqual(["ForEach"]);
  await expect(page.locator(`${ROWS}[aria-selected="true"]`)).toHaveCount(3);
  // A plain row selects its own node.
  await row(page, "Card").click();
  expect(await selected(page)).toEqual(["Card"]);
  expect(errors).toEqual([]);
});

test("TC-2: keyboard, hover and the Mockups tab (C5, C7, C8)", async ({ page }) => {
  await open(page);
  await row(page, "VStack").click();
  expect(await selected(page)).toEqual(["VStack"]);
  // C5: Left collapses, Right expands.
  await page.keyboard.press("ArrowLeft");
  await expect(row(page, "VStack")).toHaveAttribute("aria-expanded", "false");
  expect((await rows(page)).length).toBe(1);
  await page.keyboard.press("ArrowRight");
  await expect(row(page, "VStack")).toHaveAttribute("aria-expanded", "true");
  expect((await rows(page)).length).toBe(3);
  // Up and Down move between visible rows.
  await page.keyboard.press("ArrowDown");
  expect(await selected(page)).toEqual(["Text"]);
  await page.keyboard.press("ArrowDown");
  expect(await selected(page)).toEqual(["List"]);
  await page.keyboard.press("ArrowUp");
  expect(await selected(page)).toEqual(["Text"]);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowRight");                // expands the list
  await page.keyboard.press("ArrowDown");
  expect(await selected(page)).toEqual(["Card"]);
  await page.keyboard.press("ArrowRight");                // expands the card
  // Home and End.
  await page.keyboard.press("End");
  expect(await selected(page)).toEqual(["ForEach"]);
  await page.keyboard.press("Home");
  expect(await selected(page)).toEqual(["VStack"]);
  // Typed characters select the next row whose name starts with them.
  await page.keyboard.type("Bu");
  expect(await selected(page)).toEqual(["Button"]);

  // C7: hovering a row sets the session's hovered node, which the editor outlines.
  await row(page, "Card").hover();
  const hovered = await page.evaluate(() => {
    const s = document.querySelector("#outline").session;
    return { node: s.tree(s.active).byId(s.hovered).name,
      tag: document.querySelector("#editor").shadowRoot.querySelector(".mkd-editor__tag")?.textContent ?? "" };
  });
  expect(hovered.node).toBe("Card");
  expect(hovered.tag).toMatch(/^Card · \d+ × \d+$/);
  // Hovering the element in the editor highlights its row.
  await page.hover(BUTTON);
  await expect(row(page, "Button")).toHaveClass(/mkd-outline__row--hover/);
  await expect(page.locator(`${ROWS}.mkd-outline__row--hover`)).toHaveCount(1);

  // C8: two tabs; the Mockups tab lists the document's mockups with the active one marked.
  await expect(page.locator(`${OUTLINE} [role="tab"]`)).toHaveText(["Elements", "Mockups"]);
  await page.locator(`${OUTLINE} [role="tab"]`, { hasText: "Mockups" }).click();
  await expect(page.locator(`${OUTLINE} [role="tab"]`, { hasText: "Mockups" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(`${OUTLINE} [role="tree"]`)).toBeHidden();
  await expect(page.locator(`${OUTLINE} .mkd-outline__mockup`)).toHaveText(["Mockup"]);
  await expect(page.locator(`${OUTLINE} .mkd-outline__mockup[aria-current="true"]`)).toHaveText("Mockup");

  const host = await page.evaluate(async () => {
    const { DesignSession, readDesign } = await import("../dist/design.js");
    const text = JSON.stringify({
      format: "mockitdown-design", version: 1, name: "t", defaults: { pack: "base" },
      mockups: [
        { name: "A", x: 0, y: 0, code: 'Text("first")' },
        { name: "B", x: 0, y: 0, code: 'VStack { Text("second").id("t2") }' },
      ],
      view: { active: "B" },
    });
    const o = document.createElement("mockitdown-outline");
    document.body.append(o);
    o.session = new DesignSession(readDesign(text).document);
    await o.rendered;
    const root = o.shadowRoot;
    return {
      mockups: [...root.querySelectorAll(".mkd-outline__mockup")].map((m) => [m.textContent, m.getAttribute("aria-current")]),
      rows: [...root.querySelectorAll('[role="treeitem"]')].filter((r) => !r.hidden)
        .map((r) => [r.getAttribute("aria-level"), ...[...r.querySelectorAll(".mkd-outline__name, .mkd-outline__label, .mkd-outline__chip")]
          .map((s) => s.textContent)].join(" ")),
    };
  });
  expect(host).toEqual({ mockups: [["A", null], ["B", "true"]], rows: ["1 VStack", "2 Text second #t2"] });
});
