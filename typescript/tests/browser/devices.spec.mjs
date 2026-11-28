// R-DEV-003 TC-2 and R-DEV-006 TC-2: frame scaling and isolation from the host page, in a browser.
// Each test renders mockups with the package's Node entry, puts them on a blank page with their
// stylesheet (no script on the page), and measures them in Chromium.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { loadSharedAssets, render, stylesheet } from "../../dist/node.js";

loadSharedAssets();

/** A page holding `html` in a column `width` px wide, wrapped in `wrap` (an element with attributes). */
async function show(page, figures, { width = 700, host = "", wrap = "div" } = {}) {
  const css = stylesheet(["base", "swiftui"]);
  const tag = wrap.split(" ")[0];
  const cols = figures.map((html, i) => `<div class="col" data-i="${i}">${html}</div>`).join("");
  await page.setContent(`<!doctype html><html><head><style>${host}</style><style>${css}</style>`
    + `<style>body{margin:0}.col{width:${width}px}</style></head><body><${wrap}>${cols}</${tag}></body></html>`);
  expect(await page.locator("script").count()).toBe(0);
}

function fig(source, options) {
  const r = render(source, options);
  expect(r.diagnostics).toEqual([]);
  return r.html;
}

const TEXT = 'Text("Scaled").padding(20)';

test("R-DEV-003 TC-2: a desktop frame shrinks as one picture to a narrower column (C1, C2, V1)", async ({ page }) => {
  for (const [width, w, h] of [[640, 640, 400], [1600, 1280, 800], [1280, 1280, 800]]) {
    await show(page, [fig(TEXT, { device: "desktop" })], { width });
    const box = await page.locator(".mkd-frame").boundingBox();
    expect(Math.abs(box.width - w), `${width}px column`).toBeLessThan(0.5);
    expect(Math.abs(box.height - h), `${width}px column`).toBeLessThan(0.5);
    // Everything inside scales by the same factor: the text's padding and its font size.
    const scale = w / 1280;
    const text = await page.locator(".mkd-text").evaluate((el) => {
      const s = getComputedStyle(el);
      return { pad: parseFloat(s.paddingLeft), font: parseFloat(s.fontSize) };
    });
    await show(page, [fig(TEXT, { device: "desktop" })], { width: 1600 });
    const full = await page.locator(".mkd-text").evaluate((el) => {
      const s = getComputedStyle(el);
      return { pad: parseFloat(s.paddingLeft), font: parseFloat(s.fontSize) };
    });
    expect(Math.abs(text.pad - full.pad * scale)).toBeLessThan(0.05);
    expect(Math.abs(text.font - full.font * scale)).toBeLessThan(0.05);
  }
});

test("R-DEV-003 TC-2: the unit follows each cell, a fit frame keeps its size (C3, C4)", async ({ page }) => {
  // Two phones side by side share the column: each cell is the container its frame scales against.
  await show(page, [fig(TEXT, { device: "phone", appearance: "both" })], { width: 500 });
  const frames = page.locator(".mkd-frame");
  const cells = page.locator(".mkd-cell");
  for (let i = 0; i < 2; i++) {
    const [f, c] = [await frames.nth(i).boundingBox(), await cells.nth(i).boundingBox()];
    expect(Math.abs(f.width - c.width)).toBeLessThan(0.5);
    expect(Math.abs(f.height / f.width - 852 / 393)).toBeLessThan(0.01);
  }
  // fit: --u is 1px and the frame takes its content's size, whatever the column.
  const widths = [];
  for (const width of [700, 120]) {
    await show(page, [fig('HStack { Text("one"); Text("two"); Text("three") }', { device: "fit" })], { width });
    const u = await page.locator(".mkd-frame").evaluate((el) => getComputedStyle(el).getPropertyValue("--u").trim());
    expect(u).toBe("1px");
    const [box, client, scroll] = await page.locator(".mkd-frame").evaluate((el) =>
      [el.getBoundingClientRect().width, el.clientWidth, el.scrollWidth]);
    expect(scroll).toBeLessThanOrEqual(client + 1);               // the content fits: max-content
    widths.push(box);
  }
  expect(Math.abs(widths[0] - widths[1])).toBeLessThan(0.5);      // not squeezed by the 120px column
  expect(widths[1]).toBeGreaterThan(120);
  const cell = page.locator(".mkd-cell");
  expect(await cell.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);   // the cell scrolls
});

// Host rules of the kind documentation themes apply inside their content area (modelled on
// Material for MkDocs' and Zensical's .md-typeset): typography, margins, list, table, code and
// image styling. When the repository's virtual environment holds Zensical, its own stylesheet is
// added too.
const TYPESET = `
.md-typeset { font-size: .8rem; line-height: 1.6; color: #333; letter-spacing: .01em; }
.md-typeset p, .md-typeset ul, .md-typeset ol, .md-typeset table:not([class]), .md-typeset img { margin: 1em 0; }
.md-typeset ul, .md-typeset ol { margin-left: .625em; padding: 0; list-style: disc; }
.md-typeset li { margin-bottom: .5em; margin-left: 1.25em; }
.md-typeset code, .md-typeset kbd { padding: 0 .29em; border-radius: .1rem; background: #f5f5f5;
  font-family: monospace; font-size: .85em; word-break: break-word; }
.md-typeset kbd { box-shadow: 0 .1rem 0 .05rem #ccc, inset 0 -.1rem 0 #aaa; display: inline-block; }
.md-typeset table:not([class]) { display: inline-block; border: 1px solid #ddd;
  border-radius: .1rem; font-size: .64rem; max-width: 100%; overflow: auto; }
.md-typeset table:not([class]) th, .md-typeset table:not([class]) td { padding: .9375em 1.25em; vertical-align: top; border-top: 1px solid #ddd; }
.md-typeset img, .md-typeset svg { max-width: 100%; height: auto; }
.md-typeset label { display: block; font-weight: 700; }
.md-typeset nav { margin: 2em 0; }
`;

function zensicalCss() {
  const root = new URL("../../../.venv/lib/", import.meta.url);
  if (!existsSync(root)) return "";
  for (const py of readdirSync(root)) {
    const dir = new URL(`${py}/site-packages/zensical_ui/templates/assets/stylesheets/modern/`, root);
    if (!existsSync(dir)) continue;
    const file = readdirSync(dir).find((f) => /^main\..*\.css$/.test(f));
    if (file) return readFileSync(new URL(file, dir), "utf8");
  }
  return "";
}

const RICH = `VStack(alignment: .leading, spacing: 8) {
  Label("Inbox", systemImage: "tray")
  Text("A paragraph of text, bold and italic").bold()
  CodeBlock("let total = items.count")
  Kbd(["⌘", "K"])
  Table(columns: ["Name", "Status"], rows: [["Ana Lima", "Active"], ["Ben Okafor", "Away"]])
  Spreadsheet(columns: ["A", "B"], rows: [[1, 2], [3, 4]])
  List { Text("One"); Text("Two") }
  Image(systemName: "star")
  Toggle("Wi-Fi", isOn: true)
  Button("Continue")
}`;

/** Box (relative to the frame) and key computed styles of every element inside the frame. */
function geometry(page) {
  return page.locator(".mkd-frame").evaluate((frame) => {
    const origin = frame.getBoundingClientRect();
    return [frame, ...frame.querySelectorAll("*")].map((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        box: [r.x - origin.x, r.y - origin.y, r.width, r.height],
        style: [el.tagName, el.className.baseVal ?? el.className, s.fontSize, s.fontFamily, s.fontWeight,
          s.lineHeight, s.letterSpacing, s.color, s.backgroundColor, s.boxShadow, s.margin, s.padding,
          s.listStyleType, s.textTransform].join(" | "),
      };
    });
  });
}

/** The elements whose style differs, or whose box moved by half a pixel or more. */
function differences(bare, hosted) {
  return bare.flatMap((b, i) => {
    const h = hosted[i];
    const moved = b.box.some((v, k) => Math.abs(v - h.box[k]) >= 0.5);
    return b.style === h.style && !moved ? []
      : [`${i}\n  bare:   ${b.style} @ ${b.box.join(",")}\n  hosted: ${h.style} @ ${h.box.join(",")}`];
  });
}

for (const [name, host] of [["the modelled theme rules", TYPESET], ["Zensical's stylesheet", zensicalCss()]]) {
  test(`R-DEV-006 TC-2: a mockup inside a documentation page looks as on a bare page — ${name} (C1, C2, V1)`,
    async ({ page }) => {
      test.skip(!host, "Zensical is not installed in the repository's .venv");
      for (const device of ["desktop", "fit"]) {
        const html = fig(RICH, { pack: "swiftui", device });
        await show(page, [html], { width: 900 });
        const bare = await geometry(page);
        await show(page, [html], { width: 900, host, wrap: 'article class="md-typeset md-content__inner"' });
        const hosted = await geometry(page);
        expect(hosted.length).toBe(bare.length);
        expect(differences(bare, hosted), device).toEqual([]);
      }
    });
}

test("R-DEV-006 TC-2: a presentation stays inside its frame (C2)", async ({ page }) => {
  const src = 'Text("Behind").alert("Delete?", isPresented: true) { Button("Delete", role: .destructive) }';
  await show(page, [fig(src, { pack: "swiftui", device: "phone" })], { width: 300 });
  const frame = await page.locator(".mkd-frame").boundingBox();
  const s = await page.locator(".mkd-frame").evaluate((el) => {
    const c = getComputedStyle(el);
    return [c.isolation, c.overflow];
  });
  expect(s).toEqual(["isolate", "hidden"]);
  for (const box of await page.locator(".mkd-layer, .mkd-layer *").evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect().toJSON()))) {
    // Anything visible lies inside the frame (clipped); the layer itself covers it exactly.
    if (box.width === 0) continue;
    expect(box.x).toBeGreaterThanOrEqual(frame.x - 0.5);
    expect(box.x + box.width).toBeLessThanOrEqual(frame.x + frame.width + 0.5);
  }
  // A page element after the figure is not covered by the scrim: the frame is its own stacking context.
  const hit = await page.evaluate(() => {
    const f = document.querySelector(".mkd-figure").getBoundingClientRect();
    const el = document.elementFromPoint(f.x + 2, f.bottom + 5);
    return el?.closest(".mkd-layer") === null || el === null;
  });
  expect(hit).toBe(true);
});
