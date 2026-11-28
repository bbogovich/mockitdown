/**
 * The canvas's view geometry (R-TOOL-011): the zoom factor and the canvas point at the viewport's top
 * left corner, and the arithmetic of zooming about a point, stepping, fitting, centring and the
 * minimap. Plain numbers only, no DOM, so that `mockitdown-canvas` and a desktop shell share it.
 *
 * A view `{zoom, x, y}` shows the canvas point `(x, y)` at the viewport's top left corner; a canvas
 * point `c` is drawn `(c - x) * zoom` CSS pixels from it, one canvas unit being one CSS pixel at 100 %
 * (C1).
 */

/** The zoom factor's range (C2). */
export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 4;
/** The zoom steps of Cmd/Ctrl+plus and minus and of the designer's zoom control (C3). */
export const ZOOM_STEPS: readonly number[] = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];
/** The margin `fit` leaves around what it fits, in CSS pixels (C4). */
export const FIT_MARGIN = 40;
/** Up to this zoom the frames are scaled with a CSS transform; above it they are laid out again (C8). */
export const TRANSFORM_MAX = 2;

/** What the viewport shows: the zoom factor and the canvas point at its top left corner. */
export interface CanvasView {
  zoom: number;
  x: number;
  y: number;
}

/** A rectangle in canvas units. */
export interface CanvasBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const EPSILON = 1e-9;

/** The zoom factor clamped to 0.1 to 4 (C2); a value that is not a finite number gives 1. */
export function clampZoom(zoom: number): number {
  if (typeof zoom !== "number" || !Number.isFinite(zoom)) return 1;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));
}

/** The next zoom step above `zoom` (`direction` 1) or below it (-1), else the end of the range (C3). */
export function stepZoom(zoom: number, direction: 1 | -1): number {
  if (direction > 0) return ZOOM_STEPS.find((s) => s > zoom + EPSILON) ?? ZOOM_MAX;
  for (let k = ZOOM_STEPS.length - 1; k >= 0; k--) if (ZOOM_STEPS[k]! < zoom - EPSILON) return ZOOM_STEPS[k]!;
  return ZOOM_MIN;
}

/**
 * The view at zoom `zoom` (clamped) that keeps the canvas point under the viewport point `(px, py)`
 * (CSS pixels from the viewport's top left corner) where it is: zooming about the pointer (C3).
 */
export function zoomAt(view: CanvasView, zoom: number, px: number, py: number): CanvasView {
  const z = clampZoom(zoom);
  const cx = view.x + px / view.zoom;
  const cy = view.y + py / view.zoom;
  return { zoom: z, x: cx - px / z, y: cy - py / z };
}

/** The view at the same zoom whose viewport of `width` × `height` CSS pixels is centred on the canvas point `(cx, cy)`. */
export function centreAt(view: CanvasView, cx: number, cy: number, width: number, height: number): CanvasView {
  return { zoom: view.zoom, x: cx - width / 2 / view.zoom, y: cy - height / 2 / view.zoom };
}

/**
 * The view that shows `box` whole in a viewport of `width` × `height` CSS pixels with `margin` pixels
 * left on its tighter axis, centred (C4, C5); the zoom is clamped to 0.1 to 4. An empty box is shown
 * at 100 %, centred.
 */
export function fitView(box: CanvasBox, width: number, height: number, margin: number = FIT_MARGIN): CanvasView {
  const room = (n: number): number => Math.max(1, n - 2 * margin);
  const zx = box.w > 0 ? room(width) / box.w : Infinity;
  const zy = box.h > 0 ? room(height) / box.h : Infinity;
  const fit = Math.min(zx, zy);
  const zoom = clampZoom(Number.isFinite(fit) ? fit : 1);
  return centreAt({ zoom, x: 0, y: 0 }, box.x + box.w / 2, box.y + box.h / 2, width, height);
}

/** The smallest box holding every box, or null when there are none. */
export function unionBox(boxes: readonly CanvasBox[]): CanvasBox | null {
  if (!boxes.length) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const b of boxes) {
    x0 = Math.min(x0, b.x);
    y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + b.w);
    y1 = Math.max(y1, b.y + b.h);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** The part of the canvas a viewport of `width` × `height` CSS pixels shows. */
export function viewBox(view: CanvasView, width: number, height: number): CanvasBox {
  return { x: view.x, y: view.y, w: width / view.zoom, h: height / view.zoom };
}

/**
 * How the zoom is drawn (C8): up to 200 % the frames keep their layout and are scaled by the CSS
 * transform `transform`; above it they are laid out again with the CSS `zoom` `layout` and not scaled.
 * `transform × layout` is always the (clamped) zoom.
 */
export function zoomRendering(zoom: number): { transform: number; layout: number } {
  const z = clampZoom(zoom);
  return z <= TRANSFORM_MAX + EPSILON ? { transform: z, layout: 1 } : { transform: 1, layout: z };
}

/**
 * The minimap's mapping (C7): the box holding every frame and the viewport, scaled to fit a minimap of
 * `width` × `height` CSS pixels with `pad` pixels around it, centred. `scale` is minimap pixels per
 * canvas unit; a canvas point `c` is at `offset + (c - box origin) * scale` in the minimap.
 */
export interface MinimapMapping {
  box: CanvasBox;
  scale: number;
  ox: number;
  oy: number;
}

export function minimapMapping(frames: readonly CanvasBox[], viewport: CanvasBox, width: number, height: number, pad = 6): MinimapMapping {
  const box = unionBox([...frames, viewport])!;
  const sx = box.w > 0 ? Math.max(1, width - 2 * pad) / box.w : Infinity;
  const sy = box.h > 0 ? Math.max(1, height - 2 * pad) / box.h : Infinity;
  const s = Math.min(sx, sy);
  const scale = Number.isFinite(s) ? s : 1;
  return { box, scale, ox: (width - box.w * scale) / 2, oy: (height - box.h * scale) / 2 };
}

/** A canvas point's place in the minimap. */
export function toMinimap(m: MinimapMapping, cx: number, cy: number): { x: number; y: number } {
  return { x: m.ox + (cx - m.box.x) * m.scale, y: m.oy + (cy - m.box.y) * m.scale };
}

/** The canvas point at a place in the minimap. */
export function fromMinimap(m: MinimapMapping, mx: number, my: number): { x: number; y: number } {
  return { x: m.box.x + (mx - m.ox) / m.scale, y: m.box.y + (my - m.oy) / m.scale };
}
