// IT-68 (browser part): the diagnostics list `mockitdown-diagnostics` in the designer (R-TOOL-010 TC-1,
// C1 to C4, V1) on pages/designer.html, its active mockup "Inbox" given the codes below through the
// session. Every expected value was written by hand from these codes before the code ran.
//
//   WARN: line 2 `  Text("A", bogus: 1)` (Text 11-30, the label `bogus` at 2:13), line 3 `  Bogus()` (3:8, the call's `(`).
//   BROKEN: line 2 `  Text("A"` lacks its `)`, so the error stands at the `}` of line 3, column 1, offset 20.
import { expect, test } from "@playwright/test";

const D = "#designer";
const COUNT = `${D} [part="diagnostics"]`;
const LIST = `${D} mockitdown-diagnostics`;
const ENTRIES = `${LIST} [part="entry"]`;
const WARN = 'VStack {\n  Text("A", bogus: 1)\n  Bogus()\n}\n';
const BROKEN = 'VStack {\n  Text("A"\n}\n';
const CLEAN = 'VStack {\n  Text("A")\n}\n';

async function open(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/designer.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  return errors;
}

const setCode = (page, code) => page.evaluate((c) => {
  const s = document.querySelector("#designer").session;
  s.setCode(s.active, c);
}, code);

const selected = (page) => page.evaluate(() => {
  const s = document.querySelector("#designer").session;
  const tree = s.tree(s.active);
  return s.selection.map((id) => { const n = tree.byId(id); return tree.source.slice(n.first, n.span.end); });
});

test("TC-1: the status count opens the list, entries lead to their element or their place in the code, Esc closes it (C1-C4, V1)", async ({ page }) => {
  const errors = await open(page);
  await setCode(page, WARN);
  const count = page.locator(COUNT);
  await expect(count).toHaveText("2 diagnostics");
  await expect(count).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(LIST)).toBeHidden();

  // C4: activating the count opens the list.
  await count.click();
  await expect(count).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(LIST)).toBeVisible();
  const entries = page.locator(ENTRIES);
  await expect(entries).toHaveCount(2);
  await expect(entries.nth(0)).toHaveAttribute("data-severity", "warning");
  await expect(entries.nth(0).locator('[part="message"]')).toHaveText("'bogus' is not understood by Text in pack 'base'");
  await expect(entries.nth(0).locator('[part="location"]')).toHaveText("2:13");
  await expect(entries.nth(1)).toHaveAttribute("data-severity", "error");
  await expect(entries.nth(1).locator('[part="location"]')).toHaveText("3:8");

  // C2, V1: a click on the unknown argument's entry selects the Text carrying it; Enter on the next the Bogus.
  await entries.nth(0).click();
  expect(await selected(page)).toEqual(['Text("A", bogus: 1)']);
  await entries.nth(1).focus();
  await page.keyboard.press("Enter");
  expect(await selected(page)).toEqual(["Bogus()"]);

  // C4: Esc closes the list and gives the focus back to the count.
  await page.keyboard.press("Escape");
  await expect(page.locator(LIST)).toBeHidden();
  await expect(count).toHaveAttribute("aria-expanded", "false");
  await expect(count).toBeFocused();

  // C2: a syntax error has no element yet, so its entry reveals its place in the code view (Code mode).
  await setCode(page, BROKEN);
  await expect(count).toHaveText("1 diagnostic");
  await count.click();
  await expect(entries).toHaveCount(1);
  await expect(entries.nth(0)).toHaveAttribute("data-severity", "error");
  await expect(entries.nth(0).locator('[part="location"]')).toHaveText("3:1");
  await entries.nth(0).click();
  await expect(page.locator(D)).toHaveAttribute("mode", "code");
  expect(await page.evaluate(() => { const c = document.querySelector("#designer").codeView; return [c.selection.start, c.selection.end]; })).toEqual([20, 20]);

  // C3: the open list follows the session: fixing the code empties it.
  await setCode(page, CLEAN);
  await expect(entries).toHaveCount(0);
  await expect(page.locator(`${LIST} [part="empty"]`)).toHaveText("No problems");
  await expect(count).toHaveText("0 diagnostics");
  expect(errors).toEqual([]);
});

test("TC-1: with the code docked, a syntax error is revealed in the dock without leaving Design mode (C2)", async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => { document.querySelector("#designer").docked = true; });
  await setCode(page, BROKEN);
  await page.locator(COUNT).click();
  await page.locator(ENTRIES).nth(0).click();
  await expect(page.locator(D)).not.toHaveAttribute("mode", "code");
  await expect(page.locator(`${D} mockitdown-code`)).toBeVisible();
  expect(await page.evaluate(() => { const c = document.querySelector("#designer").codeView; return [c.selection.start, c.selection.end]; })).toEqual([20, 20]);
  expect(errors).toEqual([]);
});
