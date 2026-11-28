/**
 * Sections on the canvas (R-TOOL-014): named rectangles drawn behind groups of mockups. The rules for a
 * new section's box, the frames a moved section carries, the snapping of a moved or resized section and
 * the view the canvas opens a document with. Plain values only, no DOM, so that the session, the canvas
 * and a desktop shell share them.
 */

import { clampZoom, type CanvasBox, type CanvasView } from "./canvas.js";
import { GRID } from "./frames.js";

/** The margin a new section leaves around the active mockup's frame, in canvas units (C2). */
export const SECTION_MARGIN = 40;
/** The smallest width and height a resized section keeps, in canvas units (C3). */
export const SECTION_MIN = 40;
/** The edges and corners a section is resized by (C3). */
export const SECTION_EDGES = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;
export type SectionEdge = (typeof SECTION_EDGES)[number];
/** The message refusing an empty section name. */
export const EMPTY_SECTION_NAME = "A section's name must not be empty";

/** The box of a new section (C2): `frame` grown by `margin` canvas units on every side. */
export function sectionAround(frame: CanvasBox, margin: number = SECTION_MARGIN): CanvasBox {
  return { x: frame.x - margin, y: frame.y - margin, w: frame.w + 2 * margin, h: frame.h + 2 * margin };
}

/** Whether `inner` lies wholly inside `outer`, edges included (C3). */
export function liesInside(inner: CanvasBox, outer: CanvasBox): boolean {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.w <= outer.x + outer.w && inner.y + inner.h <= outer.y + outer.h;
}

/** The names of the frames lying wholly inside `section` (C3), in the order given. */
export function framesInside(section: CanvasBox, frames: Iterable<readonly [string, CanvasBox]>): string[] {
  const out: string[] = [];
  for (const [name, box] of frames) if (liesInside(box, section)) out.push(name);
  return out;
}

/**
 * Where a section dragged by `(dx, dy)` canvas units goes (C3): its new top left corner rounded to the
 * {@link GRID}, or exactly there with `free` (Alt held).
 */
export function snapSectionMove(section: CanvasBox, dx: number, dy: number, free = false): { x: number; y: number } {
  const x = section.x + dx;
  const y = section.y + dy;
  return free ? { x, y } : { x: Math.round(x / GRID) * GRID, y: Math.round(y / GRID) * GRID };
}

/**
 * The box of a section whose `edge` is dragged by `(dx, dy)` canvas units (C3): the dragged edges move,
 * rounded to the {@link GRID} unless `free`, the opposite ones stay, and the width and height keep at
 * least {@link SECTION_MIN}.
 */
export function resizeSectionBox(section: CanvasBox, edge: SectionEdge, dx: number, dy: number, free = false): CanvasBox {
  const snap = (v: number): number => (free ? v : Math.round(v / GRID) * GRID);
  let left = section.x;
  let top = section.y;
  let right = section.x + section.w;
  let bottom = section.y + section.h;
  if (edge.includes("w")) left = Math.min(snap(left + dx), right - SECTION_MIN);
  if (edge.includes("e")) right = Math.max(snap(right + dx), left + SECTION_MIN);
  if (edge.includes("n")) top = Math.min(snap(top + dy), bottom - SECTION_MIN);
  if (edge.includes("s")) bottom = Math.max(snap(bottom + dy), top + SECTION_MIN);
  return { x: left, y: top, w: right - left, h: bottom - top };
}

/** Why a section may not be named `name`: an empty name, or one that is not a string; null when it may. */
export function sectionNameRefusal(name: unknown): string | null {
  return typeof name === "string" && name !== "" ? null : EMPTY_SECTION_NAME;
}

/**
 * The view a canvas opens a document with (C4): the document's `view` zoom clamped to 0.1 to 4 (1 when
 * absent) and its `x` and `y` (0 when absent or not finite).
 */
export function documentView(view: { zoom?: unknown; x?: unknown; y?: unknown } | undefined | null): CanvasView {
  const num = (v: unknown, d: number): number => (typeof v === "number" && Number.isFinite(v) ? v : d);
  return { zoom: clampZoom(typeof view?.zoom === "number" ? view.zoom : 1), x: num(view?.x, 0), y: num(view?.y, 0) };
}
