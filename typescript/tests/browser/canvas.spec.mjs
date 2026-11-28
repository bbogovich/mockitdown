// IT-69: the canvas `mockitdown-canvas` (R-TOOL-011) as the composite designer's view, on
// pages/designer.html with a document of three mockups opened over the sample (THREE below).
//
// The expected values were worked out by hand before the code ran, from the canvas's arithmetic
// (a canvas point c is drawn (c - view) * zoom pixels from the viewport's top left corner):
//   - Cmd/Ctrl+wheel of -100 px counts as -60 (the largest delta one event counts) and zooms by
//     e^(60 × 0.005) = e^0.3 ≈ 1.34986 about the pointer: from 100 % at (0, 0) with the pointer 200, 150
//     px into the viewport, the view's corner moves to (200 - 200/1.34986, 150 - 150/1.34986)
//     ≈ (51.836, 38.877), the canvas point under the pointer staying (200, 150). (The viewport's top
//     edge lies at a fractional page pixel, so the pointer is placed on whole pixels and the same
//     formula is applied to its actual offset; first written for exactly 150, corrected after the run.)
//   - Cmd/Ctrl+plus from 100 %: 150 %, 200 %; minus: 150 %; Cmd/Ctrl+1: 100 %.
//   - A wheel of (100, 0) at 200 % pans 50 canvas units right; a space-drag or middle-drag of
//     (+60, +40) px at 200 % pans (-30, -20); a minimap drag of (+10, +5) px pans (10, 5) / scale, the
//     scale being the minimap viewport rectangle's width over the viewport's width in canvas units.
//   - fit: every frame inside the viewport with at least 40 px on each side, and exactly 40 px (±1) on
//     both sides of the tighter axis; reveal centres the frame: its centre at the viewport's centre.
//   - TC-2: at 400 % a text is four times its 100 % height (±1 px); the world is not scaled (transform
//     scale 1) and every frame has CSS zoom 4; at 200 % the world's scale is 2 and the zoom 1.
import { expect, test } from "@playwright/test";

const D = "#designer";
const THREE = {
  format: "mockitdown-design",
  version: 1,
  name: "Three",
  defaults: { pack: "base", caption: false },
  mockups: [
    { name: "Sign in", x: 0, y: 0, options: { device: "fit" }, code: 'VStack {\n  Text("Welcome back")\n  Button("Sign in") {}\n}\n' },
    { name: "Inbox", x: 600, y: 0, options: { device: "fit" }, code: 'VStack {\n  Text("Inbox")\n  Button("Open") {}\n}\n' },
    { name: "Settings", x: 0, y: 500, options: { device: "fit" }, code: 'Text("Settings")\n' },
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
  }, THREE);
  return errors;
}

/** The canvas's view, its viewport rectangle on the page and its frames' boxes in canvas units. */
const state = (page) => page.evaluate(() => {
  const c = document.querySelector("#designer").canvas;
  const r = c.shadowRoot.querySelector(".mkd-canvas").getBoundingClientRect();
  return { view: c.view, vp: { x: r.left, y: r.top, w: r.width, h: r.height }, frames: c.frames };
});

const setView = (page, view) => page.evaluate((v) => {
  document.querySelector("#designer").canvas.view = v;
}, view);

const near = (a, b, eps = 1e-6) => expect(Math.abs(a - b), `${a} ≈ ${b}`).toBeLessThan(eps);

/** A frame's box on the screen, relative to the viewport. */
const onScreen = (s, f) => ({
  left: (f.x - s.view.x) * s.view.zoom, top: (f.y - s.view.y) * s.view.zoom,
  right: (f.x + f.w - s.view.x) * s.view.zoom, bottom: (f.y + f.h - s.view.y) * s.view.zoom,
});

/** A point of the viewport, in page coordinates: away from the minimap in the bottom right corner. */
const at = (s, fx = 0.3, fy = 0.3) => ({ x: s.vp.x + s.vp.w * fx, y: s.vp.y + s.vp.h * fy });

/** Every frame inside the viewport with margins of 40 px, exactly 40 (±1) on the tighter axis. */
function expectFitted(s, frames) {
  const boxes = frames.map((f) => onScreen(s, f));
  const left = Math.min(...boxes.map((b) => b.left));
  const top = Math.min(...boxes.map((b) => b.top));
  const right = s.vp.w - Math.max(...boxes.map((b) => b.right));
  const bottom = s.vp.h - Math.max(...boxes.map((b) => b.bottom));
  for (const m of [left, top, right, bottom]) expect(m).toBeGreaterThanOrEqual(39);
  const tight = Math.abs(left - 40) <= 1 && Math.abs(right - 40) <= 1 ? "x" : Math.abs(top - 40) <= 1 && Math.abs(bottom - 40) <= 1 ? "y" : null;
  expect(tight, JSON.stringify({ left, top, right, bottom })).not.toBeNull();
  // Centred on the other axis.
  near(left, right, 1);
  near(top, bottom, 1);
}

test("TC-1: frames, zoom control, keys, wheel zoom about the pointer, fit, reveal (C1-C5, C9)", async ({ page }) => {
  const errors = await open(page);
  const canvas = page.locator(`${D} mockitdown-canvas`);
  await expect(canvas).toBeVisible();

  // C1, C9: every mockup a frame at its x and y; the active one shows the designer's editor.
  await setView(page, { zoom: 0.5, x: -20, y: -40 });
  let s = await state(page);
  expect(s.frames.map((f) => [f.name, f.x, f.y])).toEqual([["Sign in", 0, 0], ["Inbox", 600, 0], ["Settings", 0, 500]]);
  const frames = await page.evaluate(() => {
    const c = document.querySelector("#designer").canvas;
    const vp = c.shadowRoot.querySelector(".mkd-canvas").getBoundingClientRect();
    return [...c.shadowRoot.querySelectorAll("[part=frame]")].map((f) => {
      const r = f.getBoundingClientRect();
      return { name: f.dataset.mockup, left: r.left - vp.left, top: r.top - vp.top, active: f.hasAttribute("data-active"), shows: f.querySelector("slot") ? "editor" : f.querySelector("mockitdown-mockup") ? "mockup" : null };
    });
  });
  expect(frames.map((f) => [f.name, f.active, f.shows])).toEqual([["Sign in", false, "mockup"], ["Inbox", true, "editor"], ["Settings", false, "mockup"]]);
  // (0 - -20) × 0.5 = 10, (0 - -40) × 0.5 = 20; Inbox (600 + 20) × 0.5 = 310; Settings (500 + 40) × 0.5 = 270.
  near(frames[0].left, 10, 0.51);
  near(frames[0].top, 20, 0.51);
  near(frames[1].left, 310, 0.51);
  near(frames[2].top, 270, 0.51);
  const editorInInbox = await page.evaluate(() => {
    const d = document.querySelector("#designer");
    const e = d.shadowRoot.querySelector("mockitdown-editor").getBoundingClientRect();
    const f = d.canvas.shadowRoot.querySelector('[part=frame][data-mockup="Inbox"]').getBoundingClientRect();
    return e.left >= f.left - 0.5 && e.right <= f.right + 0.5 && e.top >= f.top - 0.5 && e.width > 0;
  });
  expect(editorInInbox).toBe(true);

  // C2, C3: the toolbar's zoom control: the steps and Fit; 10 % and 400 % and no further.
  const zoom = page.locator(`${D} [part="zoom"]`);
  expect(await zoom.locator("option:not([hidden])").allTextContents())
    .toEqual(["10%", "25%", "50%", "75%", "100%", "150%", "200%", "300%", "400%", "Fit"]);
  await zoom.selectOption("0.1");
  expect((await state(page)).view.zoom).toBe(0.1);
  await canvas.focus();
  await page.keyboard.press("Control+Minus");
  expect((await state(page)).view.zoom).toBe(0.1);
  await zoom.selectOption("4");
  expect((await state(page)).view.zoom).toBe(4);
  await page.keyboard.press("Control+Equal");
  expect((await state(page)).view.zoom).toBe(4);
  expect(await page.evaluate(() => {
    const c = document.querySelector("#designer").canvas;
    c.zoom = 8;
    const high = c.zoom;
    c.zoom = 0.01;
    return [high, c.zoom];
  })).toEqual([4, 0.1]);
  await expect(zoom).toHaveValue("0.1");

  // C3: Cmd/Ctrl+plus and minus step; Cmd/Ctrl+1 is 100 %.
  await setView(page, { zoom: 1, x: 0, y: 0 });
  const steps = [];
  for (const key of ["Control+Equal", "Control+Equal", "Control+Minus"]) {
    await page.keyboard.press(key);
    steps.push((await state(page)).view.zoom);
  }
  expect(steps).toEqual([1.5, 2, 1.5]);
  await expect(zoom).toHaveValue("1.5");
  await page.keyboard.press("Control+Digit1");
  expect((await state(page)).view.zoom).toBe(1);

  // C3: Cmd/Ctrl+wheel zooms about the pointer.
  await setView(page, { zoom: 1, x: 0, y: 0 });
  s = await state(page);
  // The pointer goes to whole page pixels: 200 px and 150 px past the viewport's corner rounded up.
  const pointer = { x: Math.ceil(s.vp.x) + 200, y: Math.ceil(s.vp.y) + 150 };
  const [px, py] = [pointer.x - s.vp.x, pointer.y - s.vp.y];
  await page.mouse.move(pointer.x, pointer.y);
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -100);
  await page.keyboard.up("Control");
  await expect.poll(async () => (await state(page)).view.zoom).not.toBe(1);
  s = await state(page);
  near(s.view.zoom, 1.349858807576003, 1e-9);
  // With px = 200 (an integer viewport corner): 200 - 200/1.34986 ≈ 51.836.
  if (px === 200) near(s.view.x, 51.83641, 1e-3);
  near(s.view.x, px - px / 1.349858807576003, 1e-6);
  near(s.view.y, py - py / 1.349858807576003, 1e-6);
  // The canvas point under the pointer stays where it was.
  near(s.view.x + px / s.view.zoom, px, 1e-9);
  near(s.view.y + py / s.view.zoom, py, 1e-9);
  // Not a step: the control shows the zoom itself.
  await expect(zoom).toHaveValue("current");
  await expect(zoom.locator("option").first()).toHaveText("135%");

  // C4: Cmd/Ctrl+0 and the control's Fit fit every frame with 40 px margins.
  await setView(page, { zoom: 3, x: 900, y: 900 });
  await page.keyboard.press("Control+Digit0");
  s = await state(page);
  expectFitted(s, s.frames);
  await setView(page, { zoom: 3, x: 900, y: 900 });
  await zoom.selectOption("fit");
  const fitted = await state(page);
  expect(fitted.view).toEqual(s.view);

  // C5: reveal centres and fits; an unknown name throws.
  await page.evaluate(() => document.querySelector("#designer").canvas.reveal("Inbox"));
  s = await state(page);
  const inbox = s.frames.find((f) => f.name === "Inbox");
  expectFitted(s, [inbox]);
  const box = onScreen(s, inbox);
  near((box.left + box.right) / 2, s.vp.w / 2, 0.5);
  near((box.top + box.bottom) / 2, s.vp.h / 2, 0.5);
  expect(await page.evaluate(() => {
    try {
      document.querySelector("#designer").canvas.reveal("Nope");
      return "no error";
    } catch (e) {
      return e.message;
    }
  })).toBe('there is no mockup named "Nope"');

  // C4: Shift+2 fits the selected element, else the active mockup.
  await setView(page, { zoom: 1, x: 0, y: 0 });
  await page.evaluate(() => {
    const s = document.querySelector("#designer").session;
    s.select([s.tree(s.active).nodes.find((n) => n.name === "Button").id]);
  });
  await canvas.focus();
  await page.keyboard.press("Shift+Digit2");
  s = await state(page);
  const button = await page.evaluate(() => {
    const d = document.querySelector("#designer");
    const vp = d.canvas.shadowRoot.querySelector(".mkd-canvas").getBoundingClientRect();
    const r = d.shadowRoot.querySelector("mockitdown-editor").shadowRoot.querySelector('[data-el="Button"]').getBoundingClientRect();
    return { left: r.left - vp.left, right: r.right - vp.left, top: r.top - vp.top, bottom: r.bottom - vp.top };
  });
  // The button (under 100 × 40 canvas units) would need more than 400 % to fill the viewport less the
  // margins, so the zoom stops at 400 % with the button centred (first written as "40 px margins",
  // corrected before the run passed: the clamp of C2 applies).
  // Within 2 px: the box is measured at 100 % and the frame laid out again at 400 %, where its layout
  // rounds differently by up to a quarter unit (1 px was too tight in the full suite's runs).
  expect(s.view.zoom).toBe(4);
  near((button.left + button.right) / 2, s.vp.w / 2, 2);
  near((button.top + button.bottom) / 2, s.vp.h / 2, 2);
  await page.evaluate(() => document.querySelector("#designer").session.select([]));
  await page.keyboard.press("Shift+Digit2");
  s = await state(page);
  expectFitted(s, [s.frames.find((f) => f.name === "Inbox")]);

  // F-20.C5: a click on an inactive frame makes its mockup the active one; the editor moves there.
  await page.evaluate(() => document.querySelector("#designer").canvas.fit());
  await page.locator(`${D} mockitdown-canvas [part=frame][data-mockup="Settings"] mockitdown-mockup`).click();
  expect(await page.evaluate(() => document.querySelector("#designer").session.active)).toBe("Settings");
  await expect(page.locator(`${D} mockitdown-canvas [part=frame][data-mockup="Settings"]`)).toHaveAttribute("data-active", "");

  // C9: Preview mode uses the canvas too, every frame read-only; Code mode hides it.
  await page.click(`${D} .mkd-designer__modes [role="radio"] >> text=Preview`);
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("preview", "");
  expect(await page.evaluate(() => document.querySelector("#designer").canvas.shadowRoot.querySelectorAll("[part=frame] mockitdown-mockup").length)).toBe(3);
  await page.click(`${D} .mkd-designer__preview-list button >> text=Inbox`);
  s = await state(page);
  expectFitted(s, [s.frames.find((f) => f.name === "Inbox")]);
  await page.click(`${D} .mkd-designer__modes [role="radio"] >> text=Code`);
  await expect(canvas).toBeHidden();
  await expect(zoom).toBeHidden();
  expect(errors).toEqual([]);
});

test("TC-1: scroll, space-drag, middle-drag and the minimap pan in all four directions (C6, C7)", async ({ page }) => {
  const errors = await open(page);
  const canvas = page.locator(`${D} mockitdown-canvas`);
  const start = { zoom: 2, x: 100, y: 100 };

  // The wheel or trackpad scroll: (±100, 0) and (0, ±100) px at 200 % pan ±50 canvas units.
  for (const [dx, dy] of [[100, 0], [-100, 0], [0, 100], [0, -100]]) {
    await setView(page, start);
    const s = await state(page);
    const p = at(s);
    await page.mouse.move(p.x, p.y);
    await page.mouse.wheel(dx, dy);
    await expect.poll(async () => (await state(page)).view).toEqual({ zoom: 2, x: 100 + dx / 2, y: 100 + dy / 2 });
  }

  // Dragging with the space bar held, and with the middle button: a drag of (dx, dy) px at 200 %
  // moves the view by (-dx/2, -dy/2), and the editor sees no click.
  const drags = [[60, 0], [-60, 0], [0, 40], [0, -40]];
  for (const how of ["space", "middle"]) {
    for (const [dx, dy] of drags) {
      await setView(page, start);
      const s = await state(page);
      const p = at(s, 0.5, 0.5);
      await canvas.focus();
      if (how === "space") await page.keyboard.down("Space");
      await page.mouse.move(p.x, p.y);
      await page.mouse.down({ button: how === "space" ? "left" : "middle" });
      await page.mouse.move(p.x + dx / 2, p.y + dy / 2);
      await page.mouse.move(p.x + dx, p.y + dy);
      await page.mouse.up({ button: how === "space" ? "left" : "middle" });
      if (how === "space") await page.keyboard.up("Space");
      expect((await state(page)).view, `${how} ${dx},${dy}`).toEqual({ zoom: 2, x: 100 - dx / 2, y: 100 - dy / 2 });
    }
  }
  expect(await page.evaluate(() => document.querySelector("#designer").session.selection.length)).toBe(0);

  // C7: the minimap shows every frame and the viewport's rectangle, bottom right.
  await setView(page, start);
  const mini = page.locator(`${D} mockitdown-canvas [part="minimap"]`);
  await expect(mini).toBeVisible();
  await expect(page.locator(`${D} mockitdown-canvas [part="minimap-frame"]`)).toHaveCount(3);
  const s0 = await state(page);
  const mb = await mini.boundingBox();
  expect(mb.x + mb.width).toBeGreaterThan(s0.vp.x + s0.vp.w - 20);
  expect(mb.y + mb.height).toBeGreaterThan(s0.vp.y + s0.vp.h - 20);

  // Dragging the minimap's viewport rectangle by (±10, 0) and (0, ±5) px pans by that over the scale.
  const rect = page.locator(`${D} mockitdown-canvas [part="minimap-viewport"]`);
  for (const [dx, dy] of [[10, 0], [-10, 0], [0, 5], [0, -5]]) {
    await setView(page, start);
    const s = await state(page);
    const r = await rect.boundingBox();
    const scale = r.width / (s.vp.w / s.view.zoom);
    const p = { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.mouse.move(p.x + dx, p.y + dy);
    await page.mouse.up();
    const v = (await state(page)).view;
    near(v.x, 100 + dx / scale, 0.5 / scale + 1e-6);
    near(v.y, 100 + dy / scale, 0.5 / scale + 1e-6);
  }

  // A click in the minimap centres the viewport there: on the Settings frame's mark, the viewport's
  // centre comes to the Settings frame's centre.
  await setView(page, start);
  const mark = await page.locator(`${D} mockitdown-canvas [part="minimap-frame"][data-mockup="Settings"]`).boundingBox();
  const sBefore = await state(page);
  const scale = (await rect.boundingBox()).width / (sBefore.vp.w / sBefore.view.zoom);
  await page.mouse.click(mark.x + mark.width / 2, mark.y + mark.height / 2);
  const s = await state(page);
  const settings = s.frames.find((f) => f.name === "Settings");
  near(s.view.x + s.vp.w / 2 / s.view.zoom, settings.x + settings.w / 2, 1 / scale);
  near(s.view.y + s.vp.h / 2 / s.view.zoom, settings.y + settings.h / 2, 1 / scale);
  expect(s.view.zoom).toBe(2);
  expect(errors).toEqual([]);
});

test("TC-2: crisp at 400 % — laid out again above 200 %, a transform up to it (C8, F-20.AC1)", async ({ page }) => {
  const errors = await open(page);
  const measure = () => page.evaluate(async () => {
    const d = document.querySelector("#designer");
    await d.rendered;
    const c = d.canvas;
    const world = c.shadowRoot.querySelector("[part=world]");
    const m = new DOMMatrix(getComputedStyle(world).transform);
    const frame = c.shadowRoot.querySelector('[part=frame][data-mockup="Settings"]');
    const text = frame.querySelector("mockitdown-mockup").shadowRoot.querySelector('[data-el="Text"]');
    return { scale: m.a, zoom: getComputedStyle(frame).zoom, height: text.getBoundingClientRect().height };
  });
  await setView(page, { zoom: 1, x: 0, y: 450 });
  const at100 = await measure();
  expect([at100.scale, at100.zoom]).toEqual([1, "1"]);
  await setView(page, { zoom: 2, x: 0, y: 450 });
  const at200 = await measure();
  expect([at200.scale, at200.zoom]).toEqual([2, "1"]);
  near(at200.height, 2 * at100.height, 1);
  await setView(page, { zoom: 4, x: 0, y: 480 });
  const at400 = await measure();
  expect([at400.scale, at400.zoom]).toEqual([1, "4"]);
  near(at400.height, 4 * at100.height, 1);

  // The text at 400 % against a reference laid out at that size: the same mockup at CSS zoom 4, both
  // captured at their texts' client rectangles.
  const clip = (r) => ({ x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) });
  const textRect = () => page.evaluate(() => {
    const c = document.querySelector("#designer").canvas;
    const t = c.shadowRoot.querySelector('[part=frame][data-mockup="Settings"] mockitdown-mockup').shadowRoot.querySelector('[data-el="Text"]');
    const r = t.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  const shot = await page.screenshot({ clip: clip(await textRect()) });
  const refRect = await page.evaluate(async () => {
    const ref = document.createElement("mockitdown-mockup");
    ref.id = "reference";
    for (const [k, v] of Object.entries({ pack: "base", caption: "false", device: "fit" })) ref.setAttribute(k, v);
    ref.code = 'Text("Settings")\n';
    // As wide as its canvas frame (a fit rendering in a box of no width is clipped).
    const w = document.querySelector("#designer").canvas.frames.find((f) => f.name === "Settings").w;
    ref.style.cssText = `zoom:4;position:fixed;left:0;top:0;width:${w}px;z-index:2147483647;background:#fff`;
    document.body.append(ref);
    await ref.rendered;
    const r = ref.shadowRoot.querySelector('[data-el="Text"]').getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  const reference = await page.screenshot({ clip: clip(refRect) });
  if (process.env.CANVAS_SHOTS) {
    (await import("node:fs")).writeFileSync(`${process.env.CANVAS_SHOTS}/canvas.png`, shot);
    (await import("node:fs")).writeFileSync(`${process.env.CANVAS_SHOTS}/reference.png`, reference);
  }
  const diff = await page.evaluate(async ([a, b]) => {
    const load = (b64) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = `data:image/png;base64,${b64}`;
    });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    const w = Math.min(ia.width, ib.width);
    const h = Math.min(ia.height, ib.height);
    const px = (img) => {
      const cv = document.createElement("canvas");
      cv.width = w;
      cv.height = h;
      const g = cv.getContext("2d");
      g.drawImage(img, 0, 0);
      return g.getImageData(0, 0, w, h).data;
    };
    const [pa, pb] = [px(ia), px(ib)];
    let sum = 0;
    for (let k = 0; k < pa.length; k += 4) sum += Math.abs(pa[k] - pb[k]) + Math.abs(pa[k + 1] - pb[k + 1]) + Math.abs(pa[k + 2] - pb[k + 2]);
    return { size: [ia.width, ia.height, ib.width, ib.height], mean: sum / (w * h * 3) };
  }, [shot.toString("base64"), reference.toString("base64")]);
  near(diff.size[0], diff.size[2], 2);
  near(diff.size[1], diff.size[3], 2);
  expect(diff.mean, JSON.stringify(diff)).toBeLessThan(8);
  expect(errors).toEqual([]);
});
