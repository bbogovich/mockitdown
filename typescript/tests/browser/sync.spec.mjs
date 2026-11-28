// IT-67 (browser part): two-way editing between the code view and the visual tools (R-TOOL-009 TC-1 for
// C1-C3, TC-2 for C4-C8) and the inspector's Edit in code (R-TOOL-007 TC-3, C11), on
// pages/designer.html with its sample "Inbox" (the active mockup). Every expected value below was written
// by hand from pages/designer-sample.mkdesign before the code ran: the offsets, the edits of each
// change and the code after each step. Playwright's CSS locators pierce open shadow roots.
//
// "Inbox" offsets, line by line (start offsets): 1 "// The inbox…" 0; 2 "let folders…" 31; 3 "" 72;
// 4 "VStack(spacing: 12) {" 73; 5 `  Text("Inbox").font(.title)` 95 (Text 97-123); 6 "  List {" 124
// (List 126); 7 "    Card {" 133; 8 `      Text("Quarterly report")` 144 (Text 150-174);
// 9 `      Button("Open") {}.id("open")` 175 (Button 181-209); 10 "    }" 210; 11 "    ForEach(folders)
// { name in" 216 (ForEach 220, its closure's "}" 268, span 220-269); 12 "      Text(name)" 247;
// 13 "    }" 264; 14 "  }" 270; 15 "}" 274 (the VStack's closing brace); 276 characters.
import { expect, test } from "@playwright/test";

const D = "#designer";
const CODE = `${D} mockitdown-code`;
const TEXT = `${CODE} textarea`;
const OUTLINE = `${D} mockitdown-outline`;
const ROWS = `${OUTLINE} [role="treeitem"]`;
const BUTTON_LINE = '      Button("Open") {}.id("open")\n';

async function open(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/designer.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  await page.evaluate(() => {
    window.changes = [];
    document.querySelector("#designer").addEventListener("mockitdown-change", (e) => window.changes.push(JSON.parse(JSON.stringify(e.detail))));
  });
  return errors;
}

const code = (page) => page.evaluate(() => { const s = document.querySelector("#designer").session; return s.code(s.active); });
const viewValue = (page) => page.evaluate(() => document.querySelector("#designer").codeView.value);
const caret = (page) => page.evaluate(() => { const c = document.querySelector("#designer").codeView; return [c.selection.start, c.selection.end]; });
const mode = (page, m) => page.click(`${D} .mkd-designer__modes [role="radio"][data-mode="${m}"]`);

/** Put the caret (or the selection) in the code view without a caret event: no pointer, no navigation key. */
const place = (page, start, end = start) => page.evaluate(([s, e]) => {
  const ta = document.querySelector("#designer").codeView.shadowRoot.querySelector("textarea");
  ta.focus();
  ta.setSelectionRange(s, e);
}, [start, end]);

/** Select the first node of the active mockup with this name (and source text start), through the session. */
const select = (page, name, startsWith) => page.evaluate(([n, w]) => {
  const s = document.querySelector("#designer").session;
  const tree = s.tree(s.active);
  const node = tree.nodes.find((x) => x.name === n && (!w || tree.source.slice(x.first).startsWith(w)));
  s.select([node.id]);
  return node.id;
}, [name, startsWith ?? null]);

/** The element names of the selection and the first one's source text. */
const selected = (page) => page.evaluate(() => {
  const s = document.querySelector("#designer").session;
  const tree = s.tree(s.active);
  const nodes = s.selection.map((id) => tree.byId(id));
  return { ids: [...s.selection], names: nodes.map((n) => n.name), text: nodes[0] ? tree.source.slice(nodes[0].first, nodes[0].span.end) : null };
});

const rowNames = (page) => page.locator(`${ROWS} .mkd-outline__name`).allTextContents();

test("TC-1: an unbalanced brace shows its diagnostic, the visual tools keep the last valid tree read-only, the fix keeps the selection (C1-C3, V1)", async ({ page }) => {
  const errors = await open(page);
  const original = await code(page);
  expect(original.slice(274)).toBe("}\n");
  const id = await select(page, "Text", 'Text("Quarterly report")');
  const rowsBefore = await rowNames(page);
  await mode(page, "code");
  await expect(page.locator(CODE)).toBeVisible();
  await expect(page.locator(TEXT)).not.toHaveAttribute("readonly", "");

  // Delete the VStack's closing brace: nothing reaches the session before 300 ms have passed.
  await place(page, 275);
  await page.keyboard.press("Backspace");
  const broken = original.slice(0, 274) + original.slice(275);
  expect(await viewValue(page)).toBe(broken);
  expect(await code(page)).toBe(original);
  await expect.poll(() => code(page)).toBe(broken);
  expect(await page.evaluate(() => window.changes.map((c) => c.edits))).toEqual([[{ start: 274, end: 275, text: "" }]]);

  // C3: the gutter and the status bar show the syntax error.
  await expect(page.locator(`${CODE} [part="line"][data-severity="error"]`).first()).toBeVisible();
  await expect(page.locator(`${D} [part="diagnostics"]`)).not.toHaveText("0 diagnostics");
  await expect(page.locator(`${D} [part="status-message"]`)).not.toBeEmpty();
  // The outline keeps the previous tree, marked read-only, and refuses editing.
  await expect(page.locator(`${OUTLINE} [part="readonly"]`)).toBeVisible();
  await expect(page.locator(`${OUTLINE} [part="tree"]`)).toHaveAttribute("data-readonly", "");
  expect(await rowNames(page)).toEqual(rowsBefore);
  await page.locator(`${OUTLINE} [part="tree"]`).focus();
  await page.keyboard.press("Delete");
  expect(await code(page)).toBe(broken);
  expect(await page.evaluate(() => "error" in document.querySelector("#designer").session.delete())).toBe(true);
  expect((await selected(page)).ids).toEqual([id]);

  // Retype the brace: it parses again, the same Text node is still selected.
  await place(page, 274);
  await page.keyboard.type("}");
  await expect.poll(() => code(page)).toBe(original);
  expect(await page.evaluate(() => window.changes.map((c) => c.edits)))
    .toEqual([[{ start: 274, end: 275, text: "" }], [{ start: 274, end: 274, text: "}" }]]);
  await expect(page.locator(`${OUTLINE} [part="readonly"]`)).toBeHidden();
  await expect(page.locator(`${D} [part="status-message"]`)).toBeEmpty();
  const after = await selected(page);
  expect(after).toEqual({ ids: [id], names: ["Text"], text: 'Text("Quarterly report")' });

  // The view updates: in Design mode it renders the code, no read-only note.
  await mode(page, "design");
  await page.evaluate(() => document.querySelector("#designer").rendered);
  await expect(page.locator(`${D} mockitdown-editor [part="readonly"]`)).toHaveCount(0);
  await expect(page.locator(`${D} mockitdown-editor [data-el="Button"]`)).toBeVisible();
  expect(errors).toEqual([]);
});

test("TC-1: while the code does not parse the view shows its last valid version, read-only", async ({ page }) => {
  await open(page);
  const original = await code(page);
  await mode(page, "code");
  await place(page, 275);
  await page.keyboard.press("Backspace");
  await page.locator(OUTLINE).click({ position: { x: 5, y: 5 } }); // the focus leaves: applied at once
  expect(await code(page)).toBe(original.slice(0, 274) + "\n");
  await mode(page, "design");
  await page.evaluate(() => document.querySelector("#designer").rendered);
  await expect(page.locator(`${D} mockitdown-editor [part="readonly"]`)).toHaveText("The code does not parse: the last valid version is shown, read-only.");
  await expect(page.locator(`${D} mockitdown-editor [part="view"]`)).toHaveAttribute("aria-readonly", "true");
  await expect(page.locator(`${D} mockitdown-editor [data-el="Button"]`)).toBeVisible();
});

test("TC-2: the caret selects its node, and the gallery's Add in Code mode inserts into the stack holding it (C4, C7)", async ({ page }) => {
  const errors = await open(page);
  const original = await code(page);
  await mode(page, "code");
  // C4: the caret moved into Button("Open") by a navigation key selects it, and its outline row.
  await place(page, 183);
  await page.keyboard.press("ArrowRight");
  expect(await caret(page)).toEqual([184, 184]);
  expect((await selected(page)).names).toEqual(["Button"]);
  await expect(page.locator(`${ROWS}[aria-selected="true"] .mkd-outline__name`)).toHaveText(["Button"]);
  // On line 6 before "List": the innermost node holding the caret is the VStack.
  await place(page, 125);
  await page.keyboard.press("ArrowLeft");
  expect((await selected(page)).names).toEqual(["VStack"]);
  // C7: the outline and the inspector stay live in Code mode; Add inserts into the VStack, last child.
  await expect(page.locator(`${D} mockitdown-inspector [part="header"] strong`)).toHaveText("VStack");
  await page.evaluate(() => document.querySelector("#designer").shadowRoot.querySelector("mockitdown-gallery").rendered);
  await page.locator(`${D} mockitdown-gallery .mkd-gallery__card[data-element="Divider"] .mkd-gallery__add`).click();
  const added = original.slice(0, 274) + "  Divider()\n}\n";
  expect(await code(page)).toBe(added);
  // C5: the code view follows by text edits.
  expect(await viewValue(page)).toBe(added);
  expect(errors).toEqual([]);
});

test("TC-2: a Delete in the outline reaches the code view with the caret kept; the selection's span is marked without the focus (C5, C6)", async ({ page }) => {
  const errors = await open(page);
  const original = await code(page);
  await mode(page, "code");
  await place(page, 100);
  // C6: selecting a node elsewhere marks its span in the code view, and the focus stays where it is.
  await select(page, "Text", 'Text("Inbox")');
  await page.locator(`${OUTLINE} [part="tree"]`).focus();
  await expect(page.locator(`${CODE} [part="span"]`)).toHaveText('Text("Inbox").font(.title)');
  // C5: Delete in the outline; the code view gets the edit, its caret (100) is before the removed range.
  await select(page, "Button");
  await expect(page.locator(`${CODE} [part="span"]`)).toHaveText('Button("Open") {}.id("open")');
  await page.locator(`${OUTLINE} [part="tree"]`).focus();
  await page.keyboard.press("Delete");
  const deleted = original.replace(BUTTON_LINE, "");
  expect(await code(page)).toBe(deleted);
  expect(await viewValue(page)).toBe(deleted);
  expect(await caret(page)).toEqual([100, 100]);
  expect(await page.evaluate(() => document.querySelector("#designer").shadowRoot.activeElement?.localName)).toBe("mockitdown-outline");
  // Undo through the designer reaches the code view too.
  await page.keyboard.press("ControlOrMeta+z");
  expect(await viewValue(page)).toBe(original);
  expect(errors).toEqual([]);
});

test("TC-2: in Design mode the dock toggle shows the code view below the view, both in sync (C8)", async ({ page }) => {
  const errors = await open(page);
  const original = await code(page);
  const dock = page.locator(`${D} [part="dock"]`);
  await expect(page.locator(CODE)).toBeHidden();
  await expect(dock).toHaveAttribute("aria-pressed", "false");
  await dock.click();
  await expect(dock).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => document.querySelector("#designer").docked)).toBe(true);
  await expect(page.locator(CODE)).toBeVisible();
  const view = await page.locator(`${D} .mkd-designer__view`).boundingBox();
  const docked = await page.locator(CODE).boundingBox();
  expect(docked.y).toBeGreaterThanOrEqual(view.y + view.height - 1);
  expect(await viewValue(page)).toBe(original);
  // A visual edit reaches the docked code; typing there reaches the view.
  await select(page, "Button");
  await page.locator(`${D} mockitdown-editor`).focus();
  await page.keyboard.press("Delete");
  expect(await viewValue(page)).toBe(original.replace(BUTTON_LINE, ""));
  await place(page, 108);
  await page.keyboard.type("!");
  await expect.poll(() => code(page)).toBe(original.replace(BUTTON_LINE, "").replace('"Inbox"', '"Inbox!"'));
  await page.evaluate(() => document.querySelector("#designer").rendered);
  await expect(page.locator(`${D} mockitdown-editor .mkd-editor__view`)).toContainText("Inbox!");
  // The toggle is for Design mode only.
  await mode(page, "preview");
  await expect(dock).toBeHidden();
  await expect(page.locator(CODE)).toBeHidden();
  expect(errors).toEqual([]);
});

test("R-TOOL-007 TC-3: Edit in code on a derived row switches to Code mode with the node's span selected (C11)", async ({ page }) => {
  const errors = await open(page);
  // The ForEach's rows are in the List, collapsed at first: selecting the button expands its ancestors.
  await select(page, "Button");
  await page.locator(ROWS).filter({ has: page.locator(".mkd-outline__label", { hasText: "Beta" }) }).first().click();
  expect((await selected(page)).names).toEqual(["ForEach"]);
  const button = page.locator(`${D} mockitdown-inspector [part="edit-in-code"]`);
  await expect(button).toHaveText("Edit in code");
  await button.click();
  expect(await page.evaluate(() => document.querySelector("#designer").mode)).toBe("code");
  await expect(page.locator(CODE)).toBeVisible();
  expect(await caret(page)).toEqual([220, 269]);
  expect(await page.evaluate(() => { const c = document.querySelector("#designer").codeView; return c.value.slice(c.selection.start, c.selection.end); }))
    .toBe("ForEach(folders) { name in\n      Text(name)\n    }");
  // A plain Text offers none.
  await select(page, "Text", 'Text("Inbox")');
  await expect(button).toHaveCount(0);
  expect(errors).toEqual([]);
});
