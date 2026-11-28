// IT-53: the `mockitdown-editor` element (R-TOOL-001) in a browser, on pages/editor.html, whose
// sample mockup nests a Button in a Card in a List under a VStack and has a ForEach of three rows.
// Playwright's CSS locators pierce the editor's open shadow root.
import { expect, test } from "@playwright/test";

const EDITOR = "#editor";
const view = (sel) => `${EDITOR} .mkd-editor__view ${sel}`;
const BUTTON = view('[data-el="Button"]');
const ROW = view('[data-mkd-derived]');

async function open(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/editor.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  return errors;
}

/** The element names of the selected nodes (`editor.session.selection` through the mockup's tree). */
function selected(page) {
  return page.evaluate(() => {
    const editor = document.querySelector("#editor");
    const tree = editor.session.tree(editor.mockup);
    return editor.session.selection.map((id) => tree.byId(id).name);
  });
}

test("TC-1: click to locate — click, second click, Esc, Enter, Alt-click and a derived row (C1, C3-C7, C11, V1)", async ({ page }) => {
  const errors = await open(page);
  // C1, C11: one editor on the page renders the sample in edit mode into its shadow root.
  const shape = await page.evaluate(() => {
    const editor = document.querySelector("#editor");
    const root = editor.shadowRoot;
    return {
      editors: document.querySelectorAll("mockitdown-editor").length,
      defined: customElements.get("mockitdown-editor") === editor.constructor,
      els: [...root.querySelectorAll("[data-mkd-node]")].map((e) => e.dataset.el),
      forEach: /ForEach\(/.test(editor.code),
      session: typeof editor.session.select === "function",
    };
  });
  expect(shape.editors).toBe(1);
  expect(shape.defined).toBe(true);
  expect(shape.forEach).toBe(true);
  expect(shape.session).toBe(true);
  for (const el of ["VStack", "List", "Card", "Button"]) expect(shape.els).toContain(el);

  await page.click(BUTTON);
  expect(await selected(page)).toEqual(["Button"]);      // C4: the innermost element
  await page.click(BUTTON);
  expect(await selected(page)).toEqual(["Card"]);        // C6: a second click climbs
  await page.keyboard.press("Escape");
  expect(await selected(page)).toEqual(["List"]);        // C6: Esc climbs
  await page.keyboard.press("Enter");
  expect(await selected(page)).toEqual(["Card"]);        // C6: Enter returns to the child
  await page.keyboard.press("Enter");
  expect(await selected(page)).toEqual(["Button"]);

  // C7: Alt-click cycles through every element under the pointer, innermost first, and wraps.
  const cycle = [];
  for (let i = 0; i < 5; i++) {
    await page.click(BUTTON, { modifiers: ["Alt"] });
    cycle.push((await selected(page))[0]);
  }
  expect(cycle).toEqual(["Button", "Card", "List", "VStack", "Button"]);

  // C5: a ForEach row selects the ForEach and shows the derived badge.
  await page.locator(ROW).nth(1).click();
  expect(await selected(page)).toEqual(["ForEach"]);
  await expect(page.locator(`${EDITOR} .mkd-editor__badge`).first()).toHaveText("derived");
  expect(await page.locator(`${EDITOR} .mkd-editor__box--selection`).count()).toBe(3);

  // C3: select(nodeId) and code go through the session.
  const api = await page.evaluate(async () => {
    const editor = document.querySelector("#editor");
    const tree = editor.session.tree(editor.mockup);
    const text = tree.nodes.find((n) => n.name === "Text");
    editor.select(text.id);
    const picked = editor.session.selection.map((id) => tree.byId(id).name);
    editor.code = editor.code.replace('"Inbox"', '"Outbox"');
    await editor.rendered;
    return { picked, code: editor.session.code(editor.mockup).includes("Outbox"),
      shown: editor.shadowRoot.querySelector('[data-el="Text"]').textContent,
      kept: editor.session.selection.length };
  });
  expect(api).toEqual({ picked: ["Text"], code: true, shown: "Outbox", kept: 1 });
  expect(errors).toEqual([]);
});

test("hover sets the session's hovered node and draws a tag with name and size (C8)", async ({ page }) => {
  await open(page);
  await page.hover(BUTTON);
  const tag = page.locator(`${EDITOR} .mkd-editor__tag`);
  await expect(tag).toHaveCount(1);
  const expected = await page.evaluate(() => {
    const editor = document.querySelector("#editor");
    const r = editor.shadowRoot.querySelector('[data-el="Button"]').getBoundingClientRect();
    const tree = editor.session.tree(editor.mockup);
    return { text: `Button · ${Math.round(r.width)} × ${Math.round(r.height)}`, hovered: tree.byId(editor.session.hovered).name };
  });
  await expect(tag).toHaveText(expected.text);
  expect(expected.hovered).toBe("Button");

  // A node hovered elsewhere (another component of the session) is outlined the same way.
  await page.mouse.move(1, 1);
  await expect(tag).toHaveCount(0);
  const card = await page.evaluate(() => {
    const editor = document.querySelector("#editor");
    const tree = editor.session.tree(editor.mockup);
    editor.session.hover(tree.nodes.find((n) => n.name === "Card").id);
    return editor.shadowRoot.querySelector(".mkd-editor__tag")?.textContent ?? null;
  });
  expect(card).toMatch(/^Card · \d+ × \d+$/);
});

test("outlines sit in a layer that changes neither layout nor attributes, in the themeable colours (C9, C10)", async ({ page }) => {
  await open(page);
  const before = await page.evaluate(() => {
    const v = document.querySelector("#editor").shadowRoot.querySelector(".mkd-editor__view");
    return { html: v.innerHTML, box: JSON.stringify(v.getBoundingClientRect()) };
  });
  await page.click(BUTTON);
  await page.hover(view('[data-el="Card"] [data-el="Text"]'));
  const after = await page.evaluate(() => {
    const editor = document.querySelector("#editor");
    const root = editor.shadowRoot;
    const v = root.querySelector(".mkd-editor__view");
    const sel = root.querySelector(".mkd-editor__box--selection");
    const button = root.querySelector('[data-el="Button"]').getBoundingClientRect();
    const box = sel.getBoundingClientRect();
    return {
      html: v.innerHTML, box: JSON.stringify(v.getBoundingClientRect()),
      color: getComputedStyle(sel).borderTopColor,
      overlay: getComputedStyle(root.querySelector(".mkd-editor__overlay")).pointerEvents,
      fits: Math.abs(box.left - button.left) < 1 && Math.abs(box.width - button.width) < 1
        && Math.abs(box.top - button.top) < 1 && Math.abs(box.height - button.height) < 1,
    };
  });
  expect(after.html).toBe(before.html);
  expect(after.box).toBe(before.box);
  expect(after.color).toBe("rgb(255, 138, 0)");
  expect(after.overlay).toBe("none");
  expect(after.fits).toBe(true);

  const themed = await page.evaluate(() => {
    const editor = document.querySelector("#editor");
    editor.style.setProperty("--mkd-selection-color", "rgb(1, 2, 3)");
    return getComputedStyle(editor.shadowRoot.querySelector(".mkd-editor__box--selection")).borderTopColor;
  });
  expect(themed).toBe("rgb(1, 2, 3)");
});

test("a host session, the mockup attribute and the select event of an editor's own session (R-EDIT-006.C7, C11)", async ({ page }) => {
  await open(page);
  const result = await page.evaluate(async () => {
    const { DesignSession, readDesign } = await import("../dist/design.js");
    const events = [];
    const own = document.querySelector("#editor");
    own.addEventListener("mockitdown-select", (e) => events.push(e.detail.nodes.length));
    own.select(own.session.tree(own.mockup).nodes[0].id);

    const text = JSON.stringify({
      format: "mockitdown-design", version: 1, name: "t", defaults: { pack: "base", device: "fit", caption: false },
      mockups: [
        { name: "A", x: 0, y: 0, code: 'Text("first")' },
        { name: "B", x: 0, y: 0, code: 'VStack { Text("second") }' },
      ],
    });
    const session = new DesignSession(readDesign(text).document);
    const hostEvents = [];
    const ed = document.createElement("mockitdown-editor");
    ed.setAttribute("mockup", "B");
    ed.addEventListener("mockitdown-select", () => hostEvents.push(1));
    document.body.append(ed);
    ed.session = session;
    await ed.rendered;
    const shown = ed.shadowRoot.querySelector('[data-el="Text"]').textContent;
    ed.select(session.tree("B").nodes[1].id);
    return { events, shown, active: session.active, selected: session.selection.length, hostEvents: hostEvents.length };
  });
  expect(result).toEqual({ events: [1], shown: "second", active: "B", selected: 1, hostEvents: 0 });
});

test("import-base and asset-base resolve imports and images as the mockup element does (C2)", async ({ page }) => {
  await open(page);
  const got = await page.evaluate(async () => {
    const source = await (await fetch("../shared/conformance/import-component.mockitdown")).text();
    const ed = document.createElement("mockitdown-editor");
    ed.setAttribute("import-base", "../shared/conformance/");
    ed.setAttribute("asset-base", "../shared/img");
    const script = document.createElement("script");
    script.type = "text/mockitdown";
    script.textContent = source + '\nImage("team.jpg")';
    ed.append(script);
    document.body.append(ed);
    await ed.rendered;
    await new Promise((r) => setTimeout(r, 0));
    await ed.rendered;
    return {
      diagnostics: ed.diagnostics.filter((d) => d.code === "import").map((d) => d.message),
      img: ed.shadowRoot.querySelector("img")?.getAttribute("src"),
      derived: ed.shadowRoot.querySelectorAll("[data-mkd-derived]").length > 0,
    };
  });
  expect(got.diagnostics).toEqual([]);
  expect(got.img).toBe(new URL("/shared/img/team.jpg", page.url()).href);
  expect(got.derived).toBe(true);
});

test("Esc at a root and Enter with nothing to return to change nothing; a click on the selected root starts again; a click on no element clears (C14, C16)", async ({ page }) => {
  await open(page);
  await page.locator(view('[data-el="VStack"]')).click({ position: { x: 2, y: 2 } });
  expect(await selected(page)).toEqual(["VStack"]);
  await page.keyboard.press("Escape");
  expect(await selected(page)).toEqual(["VStack"]);
  await page.keyboard.press("Enter");
  expect(await selected(page)).toEqual(["VStack"]);
  await page.click(BUTTON);                              // the root has no parent: back to the innermost
  expect(await selected(page)).toEqual(["Button"]);
  await page.click(BUTTON);
  expect(await selected(page)).toEqual(["Card"]);
  await page.evaluate(() => { const e = document.querySelector("#editor"); e.select(e.session.tree(e.mockup).nodes[0].id); });
  await page.keyboard.press("Enter");                    // a selection made elsewhere forgets the trail
  expect(await selected(page)).toEqual(["VStack"]);
  await page.locator(view(".mkd-frame")).click({ position: { x: 1, y: 1 } });
  expect(await selected(page)).toEqual([]);
});
