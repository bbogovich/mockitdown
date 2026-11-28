// IT-64 (browser part): keyboard, clipboard and multi-select in the composite designer (R-EDIT-008
// TC-2: C3, C8, C9) on pages/designer.html, which opens pages/designer-sample.mkdesign with the Inbox
// mockup active. The expected code is written by hand from the sample: fixtures/copied-card.mockitdown
// is the sample's Card at column 0 (what Cmd/Ctrl+C must put on the clipboard; python's
// test_clipboard.py renders it in a fence, F-19.AC10), and the Inbox codes after a cut and paste and
// after Alt+Down are the sample's lines moved by hand.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const HERE = dirname(fileURLToPath(import.meta.url));
const COPIED = readFileSync(join(HERE, "fixtures", "copied-card.mockitdown"), "utf8");

const INBOX = [
  "// The inbox, with its folders",
  'let folders = ["Alpha", "Beta", "Gamma"]',
  "",
  "VStack(spacing: 12) {",
  '  Text("Inbox").font(.title)',
  "  List {",
  "    Card {",
  '      Text("Quarterly report")',
  '      Button("Open") {}.id("open")',
  "    }",
  "    ForEach(folders) { name in",
  "      Text(name)",
  "    }",
  "  }",
  "}",
  "",
].join("\n");

const PASTED_AFTER_FOREACH = [
  "// The inbox, with its folders",
  'let folders = ["Alpha", "Beta", "Gamma"]',
  "",
  "VStack(spacing: 12) {",
  '  Text("Inbox").font(.title)',
  "  List {",
  "    ForEach(folders) { name in",
  "      Text(name)",
  "    }",
  "    Card {",
  '      Text("Quarterly report")',
  '      Button("Open") {}.id("open")',
  "    }",
  "  }",
  "}",
  "",
].join("\n");

const MOVED_DOWN = [
  "// The inbox, with its folders",
  'let folders = ["Alpha", "Beta", "Gamma"]',
  "",
  "VStack(spacing: 12) {",
  "  List {",
  "    Card {",
  '      Text("Quarterly report")',
  '      Button("Open") {}.id("open")',
  "    }",
  "    ForEach(folders) { name in",
  "      Text(name)",
  "    }",
  "  }",
  '  Text("Inbox").font(.title)',
  "}",
  "",
].join("\n");

const D = "#designer";
const VIEW = `${D} mockitdown-editor .mkd-editor__view`;
const ROWS = `${D} mockitdown-outline [role="treeitem"]`;

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

async function open(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/designer.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  return errors;
}

const row = (page, name, label) => page.locator(ROWS)
  .filter({ has: page.locator(".mkd-outline__name", { hasText: new RegExp(`^${name}$`) }) })
  .filter(label ? { has: page.locator(".mkd-outline__label", { hasText: label }) } : {})
  .first();

/** The selected nodes as `Name` or `Name "label"` (their first text). */
const selected = (page) => page.evaluate(() => {
  const s = document.querySelector("#designer").session;
  const tree = s.tree(s.active);
  return s.selection.map((id) => {
    const text = s.firstText(id);
    return text === null ? tree.byId(id).name : `${tree.byId(id).name} "${text}"`;
  });
});
const code = (page) => page.evaluate(() => document.querySelector("#designer").session.code("Inbox"));

test("TC-2: Shift-click selects a range of siblings, Cmd/Ctrl-click toggles one, a non-sibling replaces the selection, in the outline and the view (C8)", async ({ page }) => {
  const errors = await open(page);
  // The outline: VStack's children Text "Inbox" and List are visible rows.
  await row(page, "Text", "Inbox").click();
  await row(page, "List").click({ modifiers: ["Shift"] });
  expect(await selected(page)).toEqual(['Text "Inbox"', "List"]);
  await row(page, "Text", "Inbox").click({ modifiers: ["ControlOrMeta"] });
  expect(await selected(page)).toEqual(["List"]);
  await row(page, "Text", "Inbox").click({ modifiers: ["ControlOrMeta"] });
  expect(await selected(page)).toEqual(["List", 'Text "Inbox"']);
  await row(page, "VStack").click({ modifiers: ["ControlOrMeta"] });
  expect(await selected(page)).toEqual(["VStack"], "the VStack is no sibling of the selection");
  await row(page, "VStack").click({ modifiers: ["Shift"] });
  expect(await selected(page)).toEqual(["VStack"]);

  // The view: the card's text, then Shift-click on its button; Cmd/Ctrl-click on the title replaces.
  await page.locator(`${VIEW} [data-el="Text"]`, { hasText: "Quarterly report" }).click();
  expect(await selected(page)).toEqual(['Text "Quarterly report"']);
  await page.locator(`${VIEW} [data-el="Button"]`).click({ modifiers: ["Shift"] });
  expect(await selected(page)).toEqual(['Text "Quarterly report"', 'Button "Open"']);
  await page.locator(`${VIEW} [data-el="Button"]`).click({ modifiers: ["ControlOrMeta"] });
  expect(await selected(page)).toEqual(['Text "Quarterly report"']);
  await page.locator(`${VIEW} [data-el="Text"]`, { hasText: "Inbox" }).click({ modifiers: ["ControlOrMeta"] });
  expect(await selected(page)).toEqual(['Text "Inbox"'], "a non-sibling replaces the selection");
  // The outline shows the selection made in the view.
  await expect(row(page, "Text", "Inbox")).toHaveAttribute("aria-selected", "true");
  expect(errors).toEqual([]);
});

test("TC-2: Cmd/Ctrl+C writes the selection's code to the clipboard; D, X and V duplicate, cut and paste; Alt+Down moves (C3, C9)", async ({ page }) => {
  const errors = await open(page);
  // The Card through the outline's keys: List, expanded, its first child.
  await row(page, "List").click();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  expect(await selected(page)).toEqual(["Card"]);

  await page.keyboard.press("ControlOrMeta+c");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(COPIED);
  expect(await code(page)).toBe(INBOX, "copy changes nothing");

  // Cmd/Ctrl+D: a copy after the card, its button's id open-2, selected; one undo removes it.
  await page.keyboard.press("ControlOrMeta+d");
  await expect.poll(() => code(page)).toContain('Button("Open") {}.id("open-2")');
  expect(await selected(page)).toEqual(["Card"]);
  await page.keyboard.press("ControlOrMeta+z");
  await expect.poll(() => code(page)).toBe(INBOX);

  // Cmd/Ctrl+X: the card is gone and the ForEach after it selected; Cmd/Ctrl+V pastes it after the ForEach.
  await page.keyboard.press("ControlOrMeta+x");
  await expect.poll(() => code(page)).not.toContain("Card");
  expect(await selected(page)).toEqual(["ForEach"]);
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(COPIED);
  await page.keyboard.press("ControlOrMeta+v");
  await expect.poll(() => code(page)).toBe(PASTED_AFTER_FOREACH);
  expect(await selected(page)).toEqual(["Card"]);
  await page.keyboard.press("ControlOrMeta+z");
  await page.keyboard.press("ControlOrMeta+z");
  await expect.poll(() => code(page)).toBe(INBOX);

  // Alt+Down in the view moves the title below the list; Alt+Up moves it back.
  await page.locator(`${VIEW} [data-el="Text"]`, { hasText: "Inbox" }).click();
  await page.keyboard.press("Alt+ArrowDown");
  await expect.poll(() => code(page)).toBe(MOVED_DOWN);
  expect(await selected(page)).toEqual(['Text "Inbox"']);
  await page.keyboard.press("Alt+ArrowUp");
  await expect.poll(() => code(page)).toBe(INBOX);

  // In a text field the keys are the field's.
  await page.locator(`${D} mockitdown-gallery [part="search"]`).focus();
  await page.keyboard.press("ControlOrMeta+d");
  await page.waitForTimeout(100);
  expect(await code(page)).toBe(INBOX);
  expect(errors).toEqual([]);
});

test("TC-2: when the clipboard cannot be read, Cmd/Ctrl+V pastes what the designer copied last (C14)", async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => {
    navigator.clipboard.readText = () => Promise.reject(new DOMException("denied", "NotAllowedError"));
  });
  await page.locator(`${VIEW} [data-el="Text"]`, { hasText: "Inbox" }).click();
  await page.keyboard.press("ControlOrMeta+c");
  await page.keyboard.press("ControlOrMeta+v");
  // The title is a leaf: the copy goes after it.
  await expect.poll(() => code(page)).toBe(INBOX.replace('  Text("Inbox").font(.title)\n', '  Text("Inbox").font(.title)\n  Text("Inbox").font(.title)\n'));
  expect(errors).toEqual([]);
});
