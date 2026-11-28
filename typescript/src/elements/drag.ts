/**
 * Pointer drag and drop between the design-tool components (R-TOOL-005): a gallery card or outline
 * rows dragged onto the outline or the editor. It is the pointer side only (A-WEB-5.K2): what a drag
 * carries is a session {@link DragSource}, and where it may drop, and the drop itself, are the
 * session's (`dropPosition`, `checkDrop`, `drop`); the targets draw their own indicators.
 *
 * A source arms a drag on `pointerdown` ({@link armDrag}); it starts once the pointer has moved
 * {@link DRAG_THRESHOLD} CSS pixels. While it runs, a transparent shield covers the page (it carries the
 * cursor: `grabbing`, or `not-allowed` over a refused position, C4) and a ghost next to the pointer
 * shows what is dragged and, over a refused position, the reason. Under the pointer the deepest element
 * is found through open shadow roots, and the nearest registered target above it is asked for its
 * answer ({@link registerDropTarget}). Releasing the pointer drops on an allowed position; Esc, a
 * cancelled pointer or a release anywhere else ends the drag with nothing changed (C6).
 */

import type { DesignSession, DragSource } from "../design/session.js";

/** How far the pointer moves, in CSS pixels, before a pressed source starts a drag. */
export const DRAG_THRESHOLD = 4;
/** How far the ghost sits from the pointer, in CSS pixels. */
const GHOST_OFFSET = 14;

/** A running drag: its session, what it carries and the label its ghost shows. */
export interface Drag {
  readonly session: DesignSession;
  readonly source: DragSource;
  readonly label: string;
}

/** A target's answer for a point: a position it shows, allowed or refused with a reason. */
export interface DropAnswer {
  readonly allowed: boolean;
  readonly reason?: string;
}

/** What a component that takes drops provides. */
export interface DropTarget {
  /** The answer at a viewport point, drawing the indicator; null when it has no position there. */
  over(drag: Drag, x: number, y: number): DropAnswer | null;
  /** The pointer left it or the drag ended: remove the indicator. */
  leave(): void;
  /** Drop at the position of the last allowed answer. */
  drop(drag: Drag): void;
}

const targets = new WeakMap<Element, DropTarget>();

/** Make an element (a component's host) a drop target. */
export function registerDropTarget(host: Element, target: DropTarget): void {
  targets.set(host, target);
}

interface Running extends Drag {
  shield: HTMLElement;
  ghost: HTMLElement;
  target: DropTarget | null;
  answer: DropAnswer | null;
}

let running: Running | null = null;

/** Whether a drag is running. */
export function dragging(): boolean {
  return running !== null;
}

/**
 * Arm a drag from a `pointerdown` on a source. `start` is asked for the drag when the pointer has moved
 * far enough; null leaves it a plain press.
 */
export function armDrag(down: PointerEvent, start: () => Drag | null): void {
  if (down.button !== 0 || running) return;
  const win = (down.view ?? window) as Window;
  const x0 = down.clientX;
  const y0 = down.clientY;
  const pointer = down.pointerId;
  let armed = true;
  const move = (e: PointerEvent): void => {
    if (e.pointerId !== pointer) return;
    if (armed) {
      if (Math.hypot(e.clientX - x0, e.clientY - y0) < DRAG_THRESHOLD) return;
      armed = false;
      const drag = start();
      if (!drag) return stop();
      begin(win.document, drag);
    }
    if (running) {
      e.preventDefault();
      track(e.clientX, e.clientY);
    }
  };
  const up = (e: PointerEvent): void => {
    if (e.pointerId !== pointer) return;
    const r = running;
    if (r) {
      e.preventDefault();
      track(e.clientX, e.clientY);
      const target = r.target;
      const answer = r.answer;
      if (target && answer?.allowed) target.drop(r);
      finish();
    }
    stop();
  };
  const cancel = (e: PointerEvent): void => {
    if (e.pointerId !== pointer) return;
    finish();
    stop();
  };
  const key = (e: KeyboardEvent): void => {
    if (e.key !== "Escape" || !running) return;
    e.preventDefault();
    e.stopPropagation();
    finish();
    stop();
  };
  function stop(): void {
    win.removeEventListener("pointermove", move, true);
    win.removeEventListener("pointerup", up, true);
    win.removeEventListener("pointercancel", cancel, true);
    win.removeEventListener("keydown", key, true);
  }
  win.addEventListener("pointermove", move, true);
  win.addEventListener("pointerup", up, true);
  win.addEventListener("pointercancel", cancel, true);
  win.addEventListener("keydown", key, true);
}

function begin(doc: Document, drag: Drag): void {
  const shield = doc.createElement("div");
  shield.setAttribute("data-mkd-drag-shield", "");
  shield.style.cssText = "position:fixed;inset:0;z-index:2147483646;background:transparent;cursor:grabbing;touch-action:none";
  const ghost = doc.createElement("div");
  ghost.setAttribute("data-mkd-drag-ghost", "");
  ghost.setAttribute("role", "status");
  ghost.style.cssText = "position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;max-width:22rem;"
    + "font:500 12px/1.4 system-ui,sans-serif;color:#1d1d1f;background:#fff;border:1px solid #c8c8d0;border-radius:5px;"
    + "padding:3px 8px;box-shadow:0 2px 8px rgba(0,0,0,.18)";
  const label = doc.createElement("div");
  label.setAttribute("data-mkd-drag-label", "");
  label.textContent = drag.label;
  const reason = doc.createElement("div");
  reason.setAttribute("data-mkd-drag-reason", "");
  reason.style.cssText = "color:#b3261e;font-weight:400";
  reason.hidden = true;
  ghost.append(label, reason);
  doc.body.append(shield, ghost);
  running = { ...drag, shield, ghost, target: null, answer: null };
}

/** Follow the pointer: move the ghost, ask the target under it, show its answer. */
function track(x: number, y: number): void {
  const r = running;
  if (!r) return;
  r.ghost.style.transform = `translate(${x + GHOST_OFFSET}px, ${y + GHOST_OFFSET}px)`;
  const target = targetAt(r.shield.ownerDocument, x, y, r.shield);
  if (target !== r.target) {
    r.target?.leave();
    r.target = target;
  }
  r.answer = target ? target.over(r, x, y) : null;
  const refused = r.answer !== null && !r.answer.allowed;
  r.shield.style.cursor = refused ? "not-allowed" : "grabbing";
  r.shield.toggleAttribute("data-refused", refused);
  const reason = r.ghost.querySelector<HTMLElement>("[data-mkd-drag-reason]")!;
  reason.textContent = refused ? r.answer!.reason ?? "" : "";
  reason.hidden = !refused;
}

/** End the running drag: the target's indicator, the shield and the ghost go. */
function finish(): void {
  const r = running;
  if (!r) return;
  running = null;
  r.target?.leave();
  r.shield.remove();
  r.ghost.remove();
}

/** The registered target nearest above the deepest element at a point, through open shadow roots. */
function targetAt(doc: Document, x: number, y: number, shield: Element): DropTarget | null {
  let scope: Document | ShadowRoot = doc;
  let el: Element | null = null;
  for (let depth = 0; depth < 32; depth++) {
    const s: Document | ShadowRoot = scope;
    const hits: Element[] = s.elementsFromPoint(x, y).filter((e) => e !== shield && (s === doc || s.contains(e)));
    const hit: Element | undefined = hits[0];
    if (!hit || hit === el) break;
    el = hit;
    if (!hit.shadowRoot) break;
    scope = hit.shadowRoot;
  }
  for (let node: Node | null = el; node; node = node.parentNode ?? (node instanceof ShadowRoot ? node.host : null)) {
    if (node instanceof Element) {
      const t = targets.get(node);
      if (t) return t;
    }
  }
  return null;
}
