// IT-69 (unit part): the canvas's view geometry (R-TOOL-011 TC-1, C2 to C5, C7, C8), `mockitdown/design`'s
// canvas.ts. Every expected value was worked out by hand before the code ran:
//
//   zoomAt: at 100 % from (0, 0), the canvas point under the viewport point (100, 50) is (100, 50);
//     at 200 % it stays there when the view's corner is (100 - 100/2, 50 - 50/2) = (50, 25).
//   centreAt: a viewport of 800 × 600 at 200 % spans 400 × 300 canvas units, so centring (300, 200)
//     puts its corner at (300 - 200, 200 - 150) = (100, 50).
//   fitView: the box {100, 0, 360 × 260} in 800 × 600 with 40 px margins: 720 / 360 = 2 and
//     520 / 260 = 2, so 200 %, centred on (280, 130): corner (280 - 400/2, 130 - 300/2) = (80, -20).
//     A box 100000 wide needs 0.0072, clamped to 0.1: corner (50000 - 4000, 5 - 3000).
//   minimapMapping: frames {0, 0, 400 × 200} and the viewport {100, 100, 200 × 100} make the box
//     {0, 0, 400 × 200}; a 160 × 100 minimap with 6 px padding gives min(148/400, 88/200) = 0.37,
//     the map 148 × 74, centred at (6, 13); the canvas point (200, 100) is at (6 + 74, 13 + 37).
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  centreAt, clampZoom, FIT_MARGIN, fitView, fromMinimap, minimapMapping, stepZoom, toMinimap, TRANSFORM_MAX, unionBox, viewBox,
  ZOOM_MAX, ZOOM_MIN, ZOOM_STEPS, zoomAt, zoomRendering,
} from "mockitdown/design";

const close = (actual: Record<string, number>, expected: Record<string, number>): void => {
  assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort());
  for (const k of Object.keys(expected)) assert.ok(Math.abs(actual[k]! - expected[k]!) < 1e-9, `${k}: ${actual[k]} != ${expected[k]}`);
};

test("C2: the zoom is clamped to 0.1 to 4; not a number reads as 1", () => {
  assert.equal(ZOOM_MIN, 0.1);
  assert.equal(ZOOM_MAX, 4);
  assert.equal(clampZoom(0.05), 0.1);
  assert.equal(clampZoom(5), 4);
  assert.equal(clampZoom(1.3), 1.3);
  assert.equal(clampZoom(Number.NaN), 1);
  assert.equal(clampZoom(Infinity), 1);
});

test("C3: the steps 10 % to 400 %, stepped up and down from a step or between two", () => {
  assert.deepEqual([...ZOOM_STEPS], [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4]);
  const up: number[] = [];
  for (let z = 0.1, k = 0; k < 9; k++) up.push((z = stepZoom(z, 1)));
  assert.deepEqual(up, [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 4]);
  const down: number[] = [];
  for (let z = 4, k = 0; k < 9; k++) down.push((z = stepZoom(z, -1)));
  assert.deepEqual(down, [3, 2, 1.5, 1, 0.75, 0.5, 0.25, 0.1, 0.1]);
  assert.equal(stepZoom(1.2, 1), 1.5);
  assert.equal(stepZoom(1.2, -1), 1);
  assert.equal(stepZoom(0.3, -1), 0.25);
});

test("C3: zooming about a point keeps the canvas point under it", () => {
  close({ ...zoomAt({ zoom: 1, x: 0, y: 0 }, 2, 100, 50) }, { zoom: 2, x: 50, y: 25 });
  // Clamped to 400 %; about the viewport's corner the corner stays.
  close({ ...zoomAt({ zoom: 2, x: 50, y: 25 }, 8, 0, 0) }, { zoom: 4, x: 50, y: 25 });
});

test("C4, C5: centring and fitting with 40 px margins", () => {
  assert.equal(FIT_MARGIN, 40);
  close({ ...centreAt({ zoom: 2, x: 0, y: 0 }, 300, 200, 800, 600) }, { zoom: 2, x: 100, y: 50 });
  close({ ...fitView({ x: 100, y: 0, w: 360, h: 260 }, 800, 600) }, { zoom: 2, x: 80, y: -20 });
  close({ ...fitView({ x: 0, y: 0, w: 100000, h: 10 }, 800, 600) }, { zoom: 0.1, x: 46000, y: -2995 });
  close({ ...fitView({ x: 10, y: 10, w: 0, h: 0 }, 800, 600) }, { zoom: 1, x: -390, y: -290 });
});

test("boxes: the union of frames and the viewport's part of the canvas", () => {
  assert.deepEqual(unionBox([{ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: -5, w: 5, h: 5 }]), { x: 0, y: -5, w: 25, h: 15 });
  assert.equal(unionBox([]), null);
  assert.deepEqual(viewBox({ zoom: 2, x: 10, y: 20 }, 800, 600), { x: 10, y: 20, w: 400, h: 300 });
});

test("C8: transform up to 200 %, laid out again above it", () => {
  assert.equal(TRANSFORM_MAX, 2);
  assert.deepEqual(zoomRendering(0.1), { transform: 0.1, layout: 1 });
  assert.deepEqual(zoomRendering(1), { transform: 1, layout: 1 });
  assert.deepEqual(zoomRendering(2), { transform: 2, layout: 1 });
  assert.deepEqual(zoomRendering(3), { transform: 1, layout: 3 });
  assert.deepEqual(zoomRendering(4), { transform: 1, layout: 4 });
  assert.deepEqual(zoomRendering(9), { transform: 1, layout: 4 });
});

test("C7: the minimap maps the frames and the viewport and back", () => {
  const m = minimapMapping([{ x: 0, y: 0, w: 400, h: 200 }], { x: 100, y: 100, w: 200, h: 100 }, 160, 100, 6);
  assert.deepEqual(m.box, { x: 0, y: 0, w: 400, h: 200 });
  close({ scale: m.scale, ox: m.ox, oy: m.oy }, { scale: 0.37, ox: 6, oy: 13 });
  close(toMinimap(m, 200, 100), { x: 80, y: 50 });
  close(fromMinimap(m, 80, 50), { x: 200, y: 100 });
});
