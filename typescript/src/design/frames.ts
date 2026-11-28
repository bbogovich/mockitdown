/**
 * Mockup frames on the canvas (R-TOOL-012): the rules for a mockup's name, a new mockup's name and
 * place, a copy's name (R-TOOL-013.C5), and the snapping of a moved frame. Plain values only, no DOM, so that the session, the canvas
 * and a desktop shell share them.
 */

import type { CanvasBox } from "./canvas.js";

/** The grid a moved frame snaps to, in canvas units (C2). */
export const GRID = 8;
/** How near, in CSS pixels on the screen, an edge of another frame draws a moved frame's edge (C2). */
export const EDGE_SNAP = 6;
/** The gap between a new mockup and the rightmost frame of its row, in canvas units (C8). */
export const NEW_MOCKUP_GAP = 80;
/** The code of a new mockup. */
export const NEW_MOCKUP_CODE = "VStack {\n}\n";
/** The warning the Mockups list shows by a default name (C9). */
export const DEFAULT_NAME_WARNING = "A default name: SpecItOut tools import mockups by name, so give this mockup a name of its own.";

const DEFAULT_NAME = /^Mockup ([0-9]+)$/;

/** Whether a name has the form `Mockup <n>` that new mockups get (C9). */
export function isDefaultName(name: string): boolean {
  return DEFAULT_NAME.test(name);
}

/** `Mockup <n>`, `n` the smallest number from 1 that no name uses (C8); names are case-sensitive. */
export function newMockupName(names: Iterable<string>): string {
  const taken = new Set(names);
  let n = 1;
  while (taken.has(`Mockup ${n}`)) n++;
  return `Mockup ${n}`;
}

/**
 * The name of a copy of mockup `name` among the document's `names` (R-TOOL-013.C5): `<name>-copy`, else
 * `<name>-copy-<n>` with the smallest free `n` from 2; names are case-sensitive.
 */
export function duplicateMockupName(names: Iterable<string>, name: string): string {
  return copyName(new Set(names), name);
}

/**
 * The name of a copy of `name` among the `taken` names (R-TOOL-013.C5, R-EDIT-008.C2): `<name>-copy`,
 * else `<name>-copy-<n>` with the smallest `n` from 2 that `taken` does not hold.
 */
export function copyName(taken: ReadonlySet<string>, name: string): string {
  const base = `${name}-copy`;
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** The message refusing a name another mockup holds (C5). */
export function nameTaken(name: string): string {
  return `A mockup named “${name}” already exists`;
}

/** The message refusing an empty name (C4). */
export const EMPTY_NAME = "A mockup's name must not be empty";

/**
 * Why renaming mockup `from` to `to` is refused among the document's `names` (C4, C5): an empty name or
 * one another mockup holds (case-sensitive, spaces kept as written); null when it may be renamed,
 * also to its own name.
 */
export function renameRefusal(names: Iterable<string>, from: string, to: string): string | null {
  if (typeof to !== "string" || to === "") return EMPTY_NAME;
  if (to === from) return null;
  for (const n of names) if (n === to) return nameTaken(to);
  return null;
}

/**
 * Where a frame being moved to `box` is drawn (C2), each axis on its own: an edge of it within
 * {@link EDGE_SNAP} CSS pixels (`EDGE_SNAP / zoom` canvas units) of an edge of another frame is put on
 * that edge, the nearest one winning; otherwise its position is rounded to the {@link GRID}. `free`
 * (Alt held) suspends snapping.
 */
export function snapMove(box: CanvasBox, others: readonly CanvasBox[], zoom: number, free = false): { x: number; y: number } {
  if (free) return { x: box.x, y: box.y };
  const reach = EDGE_SNAP / (zoom > 0 && Number.isFinite(zoom) ? zoom : 1);
  const axis = (at: number, size: number, edges: number[]): number => {
    let best: number | null = null;
    for (const target of edges) {
      for (const edge of [at, at + size]) {
        const d = target - edge;
        if (Math.abs(d) <= reach && (best === null || Math.abs(d) < Math.abs(best))) best = d;
      }
    }
    return best !== null ? at + best : Math.round(at / GRID) * GRID;
  };
  return {
    x: axis(box.x, box.w, others.flatMap((o) => [o.x, o.x + o.w])),
    y: axis(box.y, box.h, others.flatMap((o) => [o.y, o.y + o.h])),
  };
}

/**
 * Where a new mockup goes (C8): at the active frame's `y`, {@link NEW_MOCKUP_GAP} units right of the
 * rightmost frame that overlaps the active one vertically (the active one always counts); (0, 0) with
 * no active frame.
 */
export function newMockupPlace(active: CanvasBox | null, frames: readonly CanvasBox[]): { x: number; y: number } {
  if (!active) return { x: 0, y: 0 };
  let right = active.x + active.w;
  for (const f of frames) {
    if (f.y < active.y + active.h && active.y < f.y + f.h) right = Math.max(right, f.x + f.w);
  }
  return { x: right + NEW_MOCKUP_GAP, y: active.y };
}
