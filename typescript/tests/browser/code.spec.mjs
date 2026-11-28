// IT-66 (browser part): mockitdown-code, the code view (R-TOOL-008 TC-1 for C1-C7, TC-2's timing for C9).
// TC-1 runs on a bare mockitdown-code (pages/code.html) and on the designer's Code mode
// (pages/designer.html). Every expected value below was written by hand from the sources before the code
// view ran: the offsets of the brackets, the lines and the texts after each key.
import { expect, test } from "@playwright/test";

const C = "#code";
const TEXT = `${C} textarea`;
// Offsets: VStack 0-6, "{" 7, "\n" 8; Text 11, "(" 15, ")" 20; ".font" 26, "(" 31, ")" 38; Button 42, "(" 48,
// ")" 53, "{" 55, "}" 56; the last "}" 58; 60 characters, 6 lines (the last one empty).
const SAMPLE = 'VStack {\n  Text("Hi")\n    .font(.title)\n  Button("Go") {}\n}\n';

async function open(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/code.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  return errors;
}

/** Set the value and the diagnostics, then put the selection at [start, end). */
const set = (page, value, start = 0, end = start, diagnostics = []) => page.evaluate(([v, s, e, d]) => {
  const c = document.querySelector("#code");
  c.value = v;
  c.diagnostics = d;
  const ta = c.shadowRoot.querySelector("textarea");
  ta.focus();
  ta.setSelectionRange(s, e);
  ta.dispatchEvent(new Event("select"));
}, [value, start, end, diagnostics]);

const texts = (page, sel) => page.locator(`${C} ${sel}`).allTextContents();
const value = (page) => page.evaluate(() => document.querySelector("#code").value);
const ats = (page, cls) => page.evaluate((k) => [...document.querySelector("#code").shadowRoot.querySelectorAll(`.${k}`)].map((e) => Number(e.dataset.at)), cls);

test("TC-1: colours from the lexer's tokens, line numbers and gutter diagnostics (C1-C4)", async ({ page }) => {
  const errors = await open(page);
  // The page's own source, dedented from the element's text.
  expect(await value(page)).toContain('VStack(spacing: 12) {\n  // The header\n  Text("Inbox").font(.title)\n');
  await set(page, SAMPLE, 0, 0, [{ severity: "error", message: "unknown element 'Tex'", location: { line: 3, col: 5 } },
    { severity: "warning", message: "a warning on line 4", line: 4 }]);
  expect(await texts(page, ".t-name")).toEqual(["VStack", "Text", "Button"]);
  expect(await texts(page, ".t-string")).toEqual(['"Hi"', '"Go"']);
  expect(await texts(page, ".t-modifier")).toEqual(["font"]);
  expect(await texts(page, ".t-member")).toEqual(["title"]);
  expect(await texts(page, '[part="highlight"]')).toEqual([`${SAMPLE} `]);
  // The coloured layer lies behind a transparent text area.
  expect(await page.evaluate(() => getComputedStyle(document.querySelector("#code").shadowRoot.querySelector("textarea")).color)).toBe("rgba(0, 0, 0, 0)");
  // C3: one number per line.
  expect(await texts(page, '[part="line"]')).toEqual(["1", "2", "3", "4", "5", "6"]);
  // C4: line 3 is marked with the error's severity and message, line 4 with the warning's.
  const line3 = page.locator(`${C} [part="line"][data-line="3"]`);
  await expect(line3).toHaveAttribute("data-severity", "error");
  await expect(line3).toHaveAttribute("title", "error: unknown element 'Tex'");
  await expect(page.locator(`${C} [part="line"][data-line="4"]`)).toHaveAttribute("data-severity", "warning");
  expect(await page.locator(`${C} [part="line"][data-severity]`).count()).toBe(2);
  // The caret on line 3 shows its message as text, which the text area names as its description.
  await expect(page.locator(`${C} [part="message"]`)).toBeHidden();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(`${C} [part="message"]`)).toHaveText("Line 3: error: unknown element 'Tex'");
  await expect(page.locator(TEXT)).toHaveAttribute("aria-describedby", "message");
  // C1: reveal selects the range and scrolls it into view.
  const long = Array.from({ length: 200 }, (_, i) => `Text("line ${i + 1}")`).join("\n");
  // Line 150 starts after 149 lines: lines 1-9 are 14 characters and a line feed, 10-99 15 and 100-149 16.
  const at = 9 * 15 + 90 * 16 + 50 * 17;
  await set(page, long);
  await page.evaluate((s) => document.querySelector("#code").reveal({ start: s, end: s + 4 }), at);
  expect(await page.evaluate(() => { const t = document.querySelector("#code").shadowRoot.querySelector("textarea"); return [t.selectionStart, t.selectionEnd, t.scrollTop > 0]; }))
    .toEqual([at, at + 4, true]);
  expect(await page.evaluate((s) => document.querySelector("#code").value.slice(s, s + 4), at)).toBe("Text");
  expect(errors).toEqual([]);
});

test("TC-1: the bracket at the caret and its match, and unmatched brackets (C5)", async ({ page }) => {
  await open(page);
  await set(page, SAMPLE, 8);
  expect(await ats(page, "t-match")).toEqual([7, 58]);
  await set(page, SAMPLE, 31);
  expect(await ats(page, "t-match")).toEqual([31, 38]);
  await set(page, SAMPLE, 56);
  expect(await ats(page, "t-match")).toEqual([55, 56]);
  expect(await ats(page, "t-unmatched")).toEqual([]);
  // A caret away from any bracket matches nothing.
  await set(page, SAMPLE, 3);
  expect(await ats(page, "t-match")).toEqual([]);
  // 'Text("a"))': the second ")" (offset 9) has no opener; "[" at 11 is never closed.
  await set(page, 'Text("a"))\n[', 10);
  expect(await ats(page, "t-unmatched")).toEqual([9, 11]);
  expect(await ats(page, "t-match")).toEqual([9]);
  // Brackets in strings and comments are not brackets.
  await set(page, 'Text("(") // {', 0);
  expect(await ats(page, "t-unmatched")).toEqual([]);
});

test("TC-1: Enter, }, Tab, Shift+Tab and Esc then Tab (C6), one input event per change (C7)", async ({ page }) => {
  await open(page);
  await page.evaluate(() => {
    window.inputs = [];
    document.addEventListener("input", (e) => window.inputs.push([e.target.id, e.bubbles, e.composed]));
  });
  const inputs = () => page.evaluate(() => { const r = window.inputs; window.inputs = []; return r; });
  // Enter after "{" keeps the indentation and adds the source's unit (two spaces here).
  await set(page, 'VStack {\n  Text("a")\n}', 8);
  await page.keyboard.press("Enter");
  expect(await value(page)).toBe('VStack {\n  \n  Text("a")\n}');
  // Enter after a line ending in nothing special keeps its indentation.
  await set(page, 'VStack {\n  Text("a")\n}', 20);
  await page.keyboard.press("Enter");
  expect(await value(page)).toBe('VStack {\n  Text("a")\n  \n}');
  // "}" as the line's first character removes one unit.
  await page.keyboard.type("}");
  expect(await value(page)).toBe('VStack {\n  Text("a")\n}\n}');
  expect(await inputs(page)).toEqual([["code", true, true], ["code", true, true], ["code", true, true]]);
  // Enter after "(" with no indented line: four spaces.
  await set(page, "HStack(", 7);
  await page.keyboard.press("Enter");
  expect(await value(page)).toBe("HStack(\n    ");
  // Tab indents the selected lines, Shift+Tab outdents them.
  await set(page, "A\nB\nC", 0, 3);
  await page.keyboard.press("Tab");
  expect(await value(page)).toBe("    A\n    B\nC");
  await page.keyboard.press("Shift+Tab");
  expect(await value(page)).toBe("A\nB\nC");
  // Tab with no selection inserts one unit.
  await set(page, "A\nB", 2);
  await page.keyboard.press("Tab");
  expect(await value(page)).toBe("A\n    B");
  // Esc then Tab moves the focus out, leaving the text alone.
  await inputs(page);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.id)).toBe("after");
  expect(await value(page)).toBe("A\n    B");
  // C7: each typed character is one bubbling, composed input event; setting value is none.
  await set(page, "", 0);
  await page.keyboard.type("abc");
  expect(await value(page)).toBe("abc");
  expect(await inputs(page)).toEqual([["code", true, true], ["code", true, true], ["code", true, true]]);
  await page.evaluate(() => { document.querySelector("#code").value = "Divider"; });
  expect(await inputs(page)).toEqual([]);
  // The typed text is coloured too, and the page's mockup follows the input events.
  expect(await texts(page, ".t-name")).toEqual(["Divider"]);
});

test("TC-1: the designer's Code mode shows the active mockup's code in mockitdown-code", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/designer.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  await page.click('#designer .mkd-designer__modes [role="radio"] >> text=Code');
  const view = "#designer mockitdown-code";
  await expect(page.locator(view)).toBeVisible();
  const code = await page.evaluate(() => document.querySelector("#designer").session.code(document.querySelector("#designer").session.active));
  expect(await page.evaluate(() => document.querySelector("#designer").shadowRoot.querySelector("mockitdown-code").value)).toBe(code);
  expect(await page.locator(`${view} [part="line"]`).count()).toBe(code.split("\n").length);
  expect(await page.locator(`${view} .t-name`).allTextContents()).toContain("Text");
  await expect(page.locator(`${view} textarea`)).toHaveAttribute("readonly", "");
  expect(errors).toEqual([]);
});

test("TC-2: re-colouring a 1000-line source after a keystroke (C9)", async ({ page }, info) => {
  await open(page);
  const block = 'VStack(spacing: 8) {\n  Text("Row").font(.headline)\n  Button("Open") { }.id("open")\n  Divider()\n}\n';
  const source = block.repeat(200); // 1000 lines and a final empty one
  // A code view of its own, so that no listener of the page (its mockup) is timed with it.
  const median = await page.evaluate((src) => {
    const c = document.createElement("mockitdown-code");
    c.id = "timed";
    document.body.append(c);
    c.value = src;
    const ta = c.shadowRoot.querySelector("textarea");
    ta.focus();
    const times = [];
    for (let i = 0; i < 50; i++) {
      ta.setSelectionRange(ta.value.length, ta.value.length);
      const t0 = performance.now();
      document.execCommand("insertText", false, "x");
      c.shadowRoot.querySelector("pre").getBoundingClientRect();
      times.push(performance.now() - t0);
    }
    times.sort((a, b) => a - b);
    return times[25];
  }, source);
  info.annotations.push({ type: median > 16 ? "warning" : "info", description: `median re-colour ${median.toFixed(2)} ms for 1000 lines` });
  if (median > 16) console.warn(`R-TOOL-008.C9: median re-colour ${median.toFixed(2)} ms is above 16 ms`);
  // Colouring and line numbers stay right after the keystrokes.
  const T = "#timed";
  expect(await page.locator(`${T} [part="line"]`).count()).toBe(1001);
  expect(await page.locator(`${T} .t-name`).count()).toBe(800);
  expect(await page.locator(`${T} .t-ident`).last().textContent()).toBe("x".repeat(50));
});
