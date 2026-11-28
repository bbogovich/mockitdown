/**
 * `<mockitdown-canvas>`: the infinite canvas of a design session's mockups (R-TOOL-011, A-WEB-5).
 *
 *   <mockitdown-canvas>
 *     <mockitdown-editor></mockitdown-editor>   <!-- optional: shown in the active mockup's frame -->
 *   </mockitdown-canvas>
 *   <script type="module">
 *     canvas.session = session;
 *     canvas.fit();
 *     canvas.reveal("Inbox");
 *   </script>
 *
 * Every mockup of the session's document is a frame (part `frame`, `data-mockup`) at the mockup's `x`
 * and `y`, one canvas unit being one CSS pixel at 100 %, with its name above it (part `label`, drawn at
 * the same size at every zoom) (C1). The active mockup's frame (`data-active`) shows the canvas's
 * slotted child, an editor in the designer; every other frame, and every frame with the `preview`
 * attribute, shows the mockup read-only through a `mockitdown-mockup` whose attributes are the fence
 * options among the mockup's options, its `appearance` replaced by the canvas's `appearance` attribute
 * when it has one, and the canvas's `import-base` and `asset-base`. A click on an inactive frame makes
 * its mockup the active one (F-20.C5).
 *
 * The view (`view`: `{zoom, x, y}`, the canvas point at the viewport's top left corner) starts as the
 * document's `view` and is never written back to it. `zoom` holds the zoom factor, clamped to 0.1 to 4
 * (C2). Cmd/Ctrl with the wheel or a pinch zooms about the pointer, Cmd/Ctrl+plus and minus step
 * through 10, 25, 50, 75, 100, 150, 200, 300 and 400 % about the viewport's centre (C3); `fit()` and
 * Cmd/Ctrl+0 fit every frame with 40 px margins, Cmd/Ctrl+1 sets 100 %, Shift+2 fits the selected
 * element, else the active mockup (`fitSelection()`) (C4); `reveal(name)` centres and fits a mockup
 * and throws for a name the document does not hold (C5). The wheel or trackpad scroll pans (Shift turns
 * a vertical wheel horizontal), and so does a drag with the space bar held or with the middle button
 * (C6). The minimap (part `minimap`, bottom right) shows every frame (part `minimap-frame`) and the
 * viewport's rectangle (part `minimap-viewport`); a click there centres the viewport on that point
 * and dragging pans (C7). Up to 200 % the frames are scaled by a CSS transform; above it they are laid
 * out again with the CSS `zoom` at the zoomed size and not scaled, so text stays sharp (C8). Every view
 * change dispatches `mockitdown-view` (bubbling, composed, `detail: {zoom, x, y}`).
 *
 * Frames (R-TOOL-012): dragging a frame's label moves the frame, snapped to the 8-unit grid and to the
 * edges of other frames within 6 CSS pixels (`snapMove`), freely with Alt held; the mockup's `x` and
 * `y` are set through `session.moveMockup` when the drag ends, one undo step. A double-click on the
 * label opens an inline field (part `rename-field`): Enter renames through `session.renameMockup`,
 * whose refusal is shown beside it (part `rename-error`) with the field kept open; Esc, or leaving the
 * field with a refused name, cancels. Neither in Preview mode. The canvas measures the frames for the
 * session (`session.measure`), which places a new mockup by them.
 *
 * The geometry is `mockitdown/design`'s canvas.ts and frames.ts. The canvas holds no editing rule
 * (A-WEB-5.K2): it changes the session only through `setActive`, `moveMockup` and `renameMockup`. Its
 * session is the nearest enclosing designer's, else the one its host sets, else an empty one of its own
 * (R-EDIT-006.C11).
 *
 * Parts: `viewport`, `world`, `frame`, `label`, `rename-field`, `rename-error`, `body`, `minimap`,
 * `minimap-frame`, `minimap-viewport`.
 * Custom properties: `--mkd-canvas-background`, `--mkd-canvas-label-color`, `--mkd-selection-color`,
 * `--mkd-canvas-minimap-background`, `--mkd-canvas-minimap-frame`, `--mkd-canvas-minimap-viewport`.
 */

import { FENCE_OPTIONS } from "../core/index.js";
import {
  clampZoom, fitView, fromMinimap, minimapMapping, stepZoom, toMinimap, unionBox, viewBox, zoomAt, zoomRendering,
  type CanvasBox, type CanvasView, type MinimapMapping,
} from "../design/canvas.js";
import { mockupOptions, newDesign } from "../design/document.js";
import { snapMove } from "../design/frames.js";
import { DESIGN_EVENTS, DesignSession, type DesignNotification, type FrameMeasure } from "../design/session.js";
import { MOCKUP_TAG } from "./mockup.js";

export const CANVAS_TAG = "mockitdown-canvas";
/** The attributes the canvas observes. */
export const CANVAS_ATTRIBUTES: readonly string[] = ["preview", "appearance", "import-base", "asset-base"];
/** The event of every view change: `detail: {zoom, x, y}`. */
export const VIEW_EVENT = "mockitdown-view";
/** The minimap's size in CSS pixels (C7). */
export const MINIMAP_WIDTH = 160;
export const MINIMAP_HEIGHT = 110;
const DESIGNER_TAG = "mockitdown-designer";
/** Wheel zoom: the factor per pixel of wheel delta, and the largest delta one event counts. */
const WHEEL_ZOOM = 0.005;
const WHEEL_ZOOM_MAX = 60;
const BASES = ["import-base", "asset-base"] as const;
/** How far, in CSS pixels, a label must be dragged before its frame moves. */
const MOVE_THRESHOLD = 3;

const CANVAS_CSS = `:host{display:block;position:relative;overflow:clip;min-width:0;min-height:0;outline:none;background:var(--mkd-canvas-background,#f0f1f4)}
:host([hidden]){display:none}
:host(:focus-visible){box-shadow:inset 0 0 0 2px var(--mkd-selection-color,#ff8a00)}
.mkd-canvas{position:absolute;inset:0;overflow:clip;touch-action:none}
.mkd-canvas--grab{cursor:grab}
.mkd-canvas--panning,.mkd-canvas--panning *{cursor:grabbing !important}
.mkd-canvas__world{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}
.mkd-canvas__frame{position:absolute;width:max-content}
.mkd-canvas__frame[data-active]{outline:calc(2px / var(--mkd-canvas-zoom,1)) solid var(--mkd-selection-color,#ff8a00);outline-offset:calc(4px / var(--mkd-canvas-zoom,1))}
.mkd-canvas__frame:not([data-active]) .mkd-canvas__body{cursor:pointer}
.mkd-canvas__body>mockitdown-mockup{display:block}
.mkd-canvas__label{position:absolute;left:0;bottom:100%;white-space:nowrap;font:500 calc(12px / var(--mkd-canvas-zoom,1))/1.3 system-ui,sans-serif;padding-bottom:calc(6px / var(--mkd-canvas-zoom,1));color:var(--mkd-canvas-label-color,#5b5d66);user-select:none;-webkit-user-select:none;touch-action:none}
:host(:not([preview])) .mkd-canvas__label{cursor:grab}
.mkd-canvas__frame--moving .mkd-canvas__label{cursor:grabbing}
.mkd-canvas__rename{font:inherit;color:var(--mkd-canvas-label-color,#1f2024);padding:0 .2em;margin:0;border:1px solid var(--mkd-selection-color,#ff8a00);border-radius:3px;min-width:12em;box-sizing:border-box;user-select:text;-webkit-user-select:text}
.mkd-canvas__rename-error{margin-left:.6em;color:var(--mkd-canvas-error-color,#d93025)}
.mkd-canvas__rename-error[hidden]{display:none}
.mkd-canvas__frame[data-active] .mkd-canvas__label{color:var(--mkd-selection-color,#ff8a00)}
.mkd-canvas__minimap{position:absolute;right:8px;bottom:8px;width:${MINIMAP_WIDTH}px;height:${MINIMAP_HEIGHT}px;box-sizing:border-box;overflow:hidden;z-index:2;border:1px solid var(--mkd-designer-border,#d0d0d7);border-radius:6px;background:var(--mkd-canvas-minimap-background,rgba(255,255,255,.92));cursor:pointer;touch-action:none}
.mkd-canvas__minimap[hidden]{display:none}
.mkd-canvas__mini-frame{position:absolute;border-radius:1px;background:var(--mkd-canvas-minimap-frame,#c4c7d0)}
.mkd-canvas__mini-frame[data-active]{background:var(--mkd-selection-color,#ff8a00)}
.mkd-canvas__mini-viewport{position:absolute;box-sizing:border-box;border:1.5px solid var(--mkd-canvas-minimap-viewport,#2f80ed);background:rgba(47,128,237,.08);cursor:grab}`;

const Base: typeof HTMLElement = (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) as typeof HTMLElement;

interface Frame {
  el: HTMLElement;
  label: HTMLElement;
  body: HTMLElement;
  mockup: (HTMLElement & { code: string; rendered?: Promise<void> }) | null;
}

const isTextField = (t: EventTarget | undefined): boolean => t instanceof HTMLElement
  && (t.isContentEditable || t.localName === "input" || t.localName === "textarea" || t.localName === "select");

export class CanvasElement extends Base {
  static get observedAttributes(): string[] {
    return [...CANVAS_ATTRIBUTES];
  }

  #root: ShadowRoot;
  #viewport: HTMLElement;
  #world: HTMLElement;
  #minimap: HTMLElement;
  #miniViewport: HTMLElement;
  #slot: HTMLSlotElement;
  #frames = new Map<string, Frame>();
  #miniFrames = new Map<string, HTMLElement>();
  #session: DesignSession | null = null;
  #given: DesignSession | null = null;
  #own: DesignSession | null = null;
  #unsubscribe: (() => void) | null = null;
  #view: CanvasView = { zoom: 1, x: 0, y: 0 };
  #space = false;
  #pan: { id: number; x: number; y: number; view: CanvasView; button: number } | null = null;
  #suppressClick = false;
  #mini: { id: number; x: number; y: number; view: CanvasView; map: MinimapMapping } | null = null;
  #gesture: number | null = null;
  #resize: ResizeObserver | null = null;
  #minimapQueued = false;
  /** The latest measuring of the frames' widths, which waits for their renderings. */
  #measured: Promise<void> = Promise.resolve();
  #measuring = 0;
  /** The frame being moved by its label (R-TOOL-012.C1, C2). */
  #move: { id: number; name: string; sx: number; sy: number; x: number; y: number; w: number; h: number; others: CanvasBox[]; at: { x: number; y: number } | null } | null = null;
  /** The rename field open on a label (R-TOOL-012.C3, C5). */
  #rename: { name: string; label: HTMLElement; input: HTMLInputElement; error: HTMLElement } | null = null;
  /** What the canvas gives its session as `measure`: its frames' sizes. */
  readonly #measure: FrameMeasure = (name) => {
    const box = this.#boxes().get(name);
    return box ? { w: box.w, h: box.h } : null;
  };

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#root.innerHTML = `<style>${CANVAS_CSS}</style><div class="mkd-canvas" part="viewport">`
      + `<div class="mkd-canvas__world" part="world"></div>`
      + `<div class="mkd-canvas__minimap" part="minimap" aria-hidden="true" hidden><div class="mkd-canvas__mini-viewport" part="minimap-viewport"></div></div>`
      + `</div>`;
    this.#viewport = this.#root.querySelector(".mkd-canvas")!;
    this.#world = this.#root.querySelector(".mkd-canvas__world")!;
    this.#minimap = this.#root.querySelector(".mkd-canvas__minimap")!;
    this.#miniViewport = this.#root.querySelector(".mkd-canvas__mini-viewport")!;
    this.#slot = document.createElement("slot");
    this.#viewport.addEventListener("wheel", (e) => this.#onWheel(e), { passive: false });
    this.#viewport.addEventListener("gesturestart", (e) => this.#onGesture(e, "start"));
    this.#viewport.addEventListener("gesturechange", (e) => this.#onGesture(e, "change"));
    this.#viewport.addEventListener("gestureend", (e) => this.#onGesture(e, "end"));
    this.addEventListener("keydown", (e) => this.#onKey(e));
    this.addEventListener("keyup", (e) => {
      if (e.key === " ") this.#setSpace(false);
    });
    this.addEventListener("focusout", (e) => {
      if (!e.relatedTarget || !this.contains(e.relatedTarget as Node) && !this.#root.contains(e.relatedTarget as Node)) this.#setSpace(false);
    });
    // Pans take the pointer before the editor inside sees it (capture on the host).
    this.addEventListener("pointerdown", (e) => this.#onPanStart(e), { capture: true });
    this.addEventListener("pointermove", (e) => this.#onPanMove(e));
    this.addEventListener("pointerup", (e) => this.#onPanEnd(e));
    this.addEventListener("pointercancel", (e) => this.#onPanEnd(e));
    this.addEventListener("mousedown", (e) => {
      if (e.button === 1) e.preventDefault();
    }, { capture: true });
    this.addEventListener("click", (e) => {
      if (!this.#suppressClick) return;
      this.#suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    }, { capture: true });
    this.#world.addEventListener("click", (e) => this.#onFrameClick(e));
    this.#world.addEventListener("pointerdown", (e) => this.#onLabelDown(e));
    this.#world.addEventListener("pointermove", (e) => this.#onLabelMove(e));
    this.#world.addEventListener("pointerup", (e) => this.#onLabelUp(e, false));
    this.#world.addEventListener("pointercancel", (e) => this.#onLabelUp(e, true));
    this.#world.addEventListener("dblclick", (e) => this.#onLabelDoubleClick(e));
    this.#minimap.addEventListener("pointerdown", (e) => this.#onMiniDown(e));
    this.#minimap.addEventListener("pointermove", (e) => this.#onMiniMove(e));
    this.#minimap.addEventListener("pointerup", (e) => this.#onMiniEnd(e));
    this.#minimap.addEventListener("pointercancel", (e) => this.#onMiniEnd(e));
    if (typeof ResizeObserver === "function") {
      this.#resize = new ResizeObserver((entries) => {
        // Shown again (from display: none): the frames are measured now that they are laid out.
        if (entries.some((e) => e.target === this.#viewport && e.contentRect.width > 0)) this.#remeasure();
        this.#queueMinimap();
      });
    }
    this.#resize?.observe(this.#viewport);
  }

  // --- properties ---------------------------------------------------------------------------------

  /** The design session whose mockups it shows (R-EDIT-006.C11); setting it gives the host's. */
  get session(): DesignSession {
    return this.#attach();
  }

  set session(value: DesignSession | null) {
    this.#given = value instanceof DesignSession ? value : null;
    this.#attach();
  }

  /** The zoom factor (C2), clamped to 0.1 to 4; setting it zooms about the viewport's centre. */
  get zoom(): number {
    return this.#view.zoom;
  }

  set zoom(value: number) {
    const [w, h] = this.#size();
    this.#setView(zoomAt(this.#view, clampZoom(Number(value)), w / 2, h / 2));
  }

  /** The view: the zoom and the canvas point at the viewport's top left corner. Setting it changes the parts it names. */
  get view(): CanvasView {
    return { ...this.#view };
  }

  set view(value: Partial<CanvasView>) {
    const v = { ...this.#view };
    if (typeof value?.zoom === "number") v.zoom = clampZoom(value.zoom);
    if (typeof value?.x === "number" && Number.isFinite(value.x)) v.x = value.x;
    if (typeof value?.y === "number" && Number.isFinite(value.y)) v.y = value.y;
    this.#setView(v);
  }

  /** The frames' boxes in canvas units, by mockup name, in document order. */
  get frames(): { name: string; x: number; y: number; w: number; h: number }[] {
    const out: { name: string; x: number; y: number; w: number; h: number }[] = [];
    for (const [name, box] of this.#boxes()) out.push({ name, ...box });
    return out;
  }

  /** A promise that resolves once every frame is rendered and sized. */
  get rendered(): Promise<void> {
    return Promise.all([...this.#contents().map((c) => c.rendered), this.#measured]).then(() => undefined);
  }

  /** Fit every frame in the viewport with a margin of 40 CSS pixels (C4); nothing without frames. */
  fit(): void {
    const all = unionBox([...this.#boxes().values()]);
    if (all) this.#fitBox(all);
  }

  /** Centre and fit the named mockup (C5); throws for a name the document does not hold. */
  reveal(name: string): void {
    const box = this.#boxes().get(name);
    if (!box) throw new Error(`there is no mockup named ${JSON.stringify(name)}`);
    this.#fitBox(box);
  }

  /** Fit the selected element (its rendered elements), else the active mockup (C4, Shift+2). */
  fitSelection(): void {
    const box = this.#selectionBox();
    if (box) return this.#fitBox(box);
    const active = this.session.active;
    if (active !== null && this.#boxes().has(active)) this.reveal(active);
  }

  // --- lifecycle ----------------------------------------------------------------------------------

  connectedCallback(): void {
    if (!this.hasAttribute("tabindex")) this.tabIndex = 0;
    this.#attach();
    this.#draw();
  }

  attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    if (old === value) return;
    if (this.#session) this.#draw();
    void name;
  }

  #attach(): DesignSession {
    const next = this.#designerSession() ?? this.#given ?? (this.#own ??= new DesignSession(newDesign(CANVAS_TAG)));
    if (next !== this.#session) {
      this.#unsubscribe?.();
      if (this.#session?.measure === this.#measure) this.#session.measure = null;
      this.#closeRename();
      this.#session = next;
      next.measure = this.#measure;
      this.#unsubscribe = next.subscribe((n) => this.#notified(n));
      const v = next.document.view;
      this.#view = {
        zoom: clampZoom(typeof v?.zoom === "number" ? v.zoom : 1),
        x: typeof v?.x === "number" && Number.isFinite(v.x) ? v.x : 0,
        y: typeof v?.y === "number" && Number.isFinite(v.y) ? v.y : 0,
      };
      for (const f of this.#frames.values()) f.el.remove();
      this.#frames.clear();
      this.#draw();
    }
    return next;
  }

  #designerSession(): DesignSession | null {
    let node: Node | null = this.parentNode;
    while (node) {
      if (node instanceof Element && node.localName === DESIGNER_TAG) {
        const s = (node as unknown as { session?: unknown }).session;
        if (s instanceof DesignSession) return s;
      }
      node = node.parentNode ?? (node instanceof ShadowRoot ? node.host : null);
    }
    return null;
  }

  #notified(n: DesignNotification): void {
    switch (n.kind) {
      case "change":
        if (n.detail.kind === "move") this.#place();
        else this.#draw();
        break;
      case "diagnostics":
        // A render the session's change caused has new content to size.
        this.#remeasure();
        break;
      case "rename": {
        if (this.#rename?.name === n.detail.from) this.#rename.name = n.detail.to;
        const f = this.#frames.get(n.detail.from);
        if (f) {
          this.#frames.delete(n.detail.from);
          this.#frames.set(n.detail.to, f);
        }
        this.#draw();
        break;
      }
      case "active":
        this.#draw();
        break;
    }
    if (this.#session === this.#own && n.kind in DESIGN_EVENTS) {
      const type = DESIGN_EVENTS[n.kind as keyof typeof DESIGN_EVENTS];
      this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: n.detail }));
    }
  }

  // --- frames -------------------------------------------------------------------------------------

  /** Bring the frames in line with the document: one per mockup, in document order, the active one holding the slot. */
  #draw(): void {
    const session = this.#session;
    if (!session) return;
    const doc = session.document;
    const preview = this.hasAttribute("preview");
    const seen = new Set<string>();
    const order: HTMLElement[] = [];
    for (const m of doc.mockups) {
      seen.add(m.name);
      let f = this.#frames.get(m.name);
      if (!f) {
        const el = document.createElement("div");
        el.className = "mkd-canvas__frame";
        el.setAttribute("part", "frame");
        const label = document.createElement("div");
        label.className = "mkd-canvas__label";
        label.setAttribute("part", "label");
        const body = document.createElement("div");
        body.className = "mkd-canvas__body";
        body.setAttribute("part", "body");
        el.append(label, body);
        f = { el, label, body, mockup: null };
        this.#frames.set(m.name, f);
        this.#resize?.observe(el);
      }
      f.el.dataset.mockup = m.name;
      if (this.#rename?.label !== f.label && f.label.textContent !== m.name) f.label.textContent = m.name;
      const editable = !preview && m.name === session.active;
      f.el.toggleAttribute("data-active", !preview && m.name === session.active);
      if (editable) {
        if (this.#slot.parentNode !== f.body) f.body.replaceChildren(this.#slot);
      } else {
        const mockup = (f.mockup ??= document.createElement(MOCKUP_TAG) as Frame["mockup"] & HTMLElement);
        this.#mockupAttributes(mockup, mockupOptions(doc, m.name) ?? {});
        if (mockup.code !== m.code) mockup.code = m.code;
        if (mockup.parentNode !== f.body) f.body.replaceChildren(mockup);
      }
      order.push(f.el);
    }
    this.#remeasure();
    for (const [name, f] of [...this.#frames]) {
      if (seen.has(name)) continue;
      this.#resize?.unobserve(f.el);
      f.el.remove();
      this.#frames.delete(name);
    }
    const current = Array.from(this.#world.children);
    if (current.length !== order.length || current.some((el, k) => el !== order[k])) {
      for (const el of order) if (el.parentNode !== this.#world || this.#world.lastElementChild !== el) this.#world.append(el);
    }
    this.#place();
  }

  /** What each frame shows, by mockup name: its read-only mockup or the slotted editor, with its `rendered` promise. */
  #contents(): { name: string; el: Element; rendered: Promise<void> }[] {
    const out: { name: string; el: Element; rendered: Promise<void> }[] = [];
    for (const [name, f] of this.#frames) {
      const el = f.body.firstElementChild === this.#slot ? this.#slot.assignedElements()[0] : f.mockup;
      if (!el?.isConnected) continue;
      const r = (el as unknown as { rendered?: Promise<void> }).rendered;
      out.push({ name, el, rendered: r instanceof Promise ? r : Promise.resolve() });
    }
    return out;
  }

  /**
   * Size every frame once what it shows is rendered (C1): a rendering fills the width it is given, its
   * device frames shrinking to fit it, so the frame is given the rendering's natural width — the device
   * widths (or a fit frame's own width) of its cells and the gaps between them — at one canvas unit per
   * CSS pixel. Runs after the other listeners of the notification that called it.
   */
  #remeasure(): void {
    const ticket = ++this.#measuring;
    this.#measured = Promise.resolve().then(async () => {
      await Promise.all(this.#contents().map((c) => c.rendered));
      // Not laid out (hidden): nothing to measure; the resize observer measures once it is shown.
      if (ticket !== this.#measuring || !this.#viewport.clientWidth) return;
      for (const c of this.#contents()) {
        const f = this.#frames.get(c.name);
        const w = naturalWidth(c.el.shadowRoot);
        if (f && w !== null && w > 0) {
          const width = `${Math.ceil(w)}px`;
          if (f.el.style.width !== width) f.el.style.width = width;
        }
      }
      this.#drawMinimap();
    });
  }

  /** A read-only mockup's attributes: the fence options among the mockup's options, the canvas's appearance and bases. */
  #mockupAttributes(el: HTMLElement, options: Record<string, unknown>): void {
    const want = new Map<string, string>();
    for (const [key, value] of Object.entries(options)) {
      if (!FENCE_OPTIONS.has(key) || value === null || value === undefined) continue;
      want.set(key, typeof value === "string" ? value : String(value));
    }
    const appearance = this.getAttribute("appearance");
    if (appearance) want.set("appearance", appearance);
    for (const base of BASES) {
      const v = this.getAttribute(base);
      if (v !== null) want.set(base, v);
    }
    for (const a of el.getAttributeNames()) if (!want.has(a) && (FENCE_OPTIONS.has(a) || (BASES as readonly string[]).includes(a))) el.removeAttribute(a);
    for (const [k, v] of want) if (el.getAttribute(k) !== v) el.setAttribute(k, v);
  }

  /** Position the frames and draw the view. */
  #place(): void {
    const session = this.#session;
    if (!session) return;
    for (const m of session.document.mockups) {
      const f = this.#frames.get(m.name);
      if (!f) continue;
      f.el.style.left = `${m.x}px`;
      f.el.style.top = `${m.y}px`;
    }
    this.#applyView();
  }

  /** The frames' boxes in canvas units: the mockup's position and the frame's laid-out size. */
  #boxes(): Map<string, CanvasBox> {
    const out = new Map<string, CanvasBox>();
    const session = this.#session;
    if (!session) return out;
    for (const m of session.document.mockups) {
      const f = this.#frames.get(m.name);
      out.set(m.name, { x: m.x, y: m.y, w: f?.el.offsetWidth ?? 0, h: f?.el.offsetHeight ?? 0 });
    }
    return out;
  }

  /** The box of the selected nodes' elements in the active frame, in canvas units, or null. */
  #selectionBox(): CanvasBox | null {
    const session = this.session;
    const name = session.active;
    const tree = name === null ? null : session.tree(name);
    const shown = this.#slot.assignedElements()[0];
    const root = shown?.shadowRoot;
    if (!tree || !root || !this.#slot.isConnected || !session.selection.length) return null;
    const vp = this.#viewport.getBoundingClientRect();
    const z = this.#view.zoom;
    const boxes: CanvasBox[] = [];
    for (const id of session.selection) {
      const node = tree.byId(id);
      if (!node) continue;
      for (const el of root.querySelectorAll(`[data-mkd-node="${node.ordinal}"],[data-mkd-derived="${node.ordinal}"]`)) {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        boxes.push({ x: this.#view.x + (r.left - vp.left) / z, y: this.#view.y + (r.top - vp.top) / z, w: r.width / z, h: r.height / z });
      }
    }
    return unionBox(boxes);
  }

  // --- moving and renaming frames (R-TOOL-012) ----------------------------------------------------

  /** The label an event is on, with its frame's mockup name, outside a rename field and Preview mode. */
  #labelOf(e: Event): { label: HTMLElement; name: string } | null {
    if (this.hasAttribute("preview")) return null;
    const path = e.composedPath();
    if (this.#rename && path.includes(this.#rename.label)) return null;
    const label = path.find((t) => t instanceof HTMLElement && t.classList.contains("mkd-canvas__label")) as HTMLElement | undefined;
    const name = (label?.parentElement as HTMLElement | null)?.dataset.mockup;
    return label && name !== undefined ? { label, name } : null;
  }

  /** A press on a label starts a move (C1). */
  #onLabelDown(e: PointerEvent): void {
    if (e.button !== 0 || this.#pan || this.#move) return;
    const hit = this.#labelOf(e);
    const m = hit ? this.session.mockup(hit.name) : null;
    if (!hit || !m) return;
    e.preventDefault();
    this.focus({ preventScroll: true });
    const boxes = this.#boxes();
    const own = boxes.get(hit.name)!;
    boxes.delete(hit.name);
    hit.label.setPointerCapture?.(e.pointerId);
    this.#move = { id: e.pointerId, name: hit.name, sx: e.clientX, sy: e.clientY, x: m.x, y: m.y, w: own.w, h: own.h, others: [...boxes.values()], at: null };
  }

  /** Where the moved frame goes: the drag in canvas units, snapped (C2) unless Alt is held. */
  #movedTo(e: PointerEvent): { x: number; y: number } {
    const mv = this.#move!;
    const z = this.#view.zoom;
    const raw = { x: mv.x + (e.clientX - mv.sx) / z, y: mv.y + (e.clientY - mv.sy) / z, w: mv.w, h: mv.h };
    return snapMove(raw, mv.others, z, e.altKey);
  }

  #onLabelMove(e: PointerEvent): void {
    const mv = this.#move;
    if (!mv || mv.id !== e.pointerId) return;
    if (!mv.at && Math.hypot(e.clientX - mv.sx, e.clientY - mv.sy) < MOVE_THRESHOLD) return;
    mv.at = this.#movedTo(e);
    const f = this.#frames.get(mv.name);
    if (!f) return;
    f.el.classList.add("mkd-canvas__frame--moving");
    f.el.style.left = `${mv.at.x}px`;
    f.el.style.top = `${mv.at.y}px`;
  }

  /** The drag ends: the mockup's `x` and `y` are set, one undo step (C1, C7); a cancelled drag puts the frame back. */
  #onLabelUp(e: PointerEvent, cancelled: boolean): void {
    const mv = this.#move;
    if (!mv || mv.id !== e.pointerId) return;
    const at = mv.at ? this.#movedTo(e) : null;
    this.#move = null;
    this.#frames.get(mv.name)?.el.classList.remove("mkd-canvas__frame--moving");
    if (!at) return;
    this.#suppressClick = true;
    setTimeout(() => {
      this.#suppressClick = false;
    }, 0);
    if (cancelled) return this.#place();
    if ("error" in this.session.moveMockup(mv.name, at.x, at.y)) this.#place();
  }

  /** A double-click on a label opens the rename field (C3). */
  #onLabelDoubleClick(e: MouseEvent): void {
    const hit = this.#labelOf(e);
    if (!hit) return;
    e.preventDefault();
    this.#closeRename();
    const input = document.createElement("input");
    input.type = "text";
    input.className = "mkd-canvas__rename";
    input.setAttribute("part", "rename-field");
    input.setAttribute("aria-label", "Mockup name");
    input.spellcheck = false;
    input.value = hit.name;
    input.size = Math.max(12, hit.name.length + 2);
    const error = document.createElement("span");
    error.className = "mkd-canvas__rename-error";
    error.setAttribute("part", "rename-error");
    error.setAttribute("role", "alert");
    error.hidden = true;
    hit.label.replaceChildren(input, error);
    const rename = { name: hit.name, label: hit.label, input, error };
    this.#rename = rename;
    input.addEventListener("keydown", (k) => {
      if (k.key === "Enter") {
        k.preventDefault();
        k.stopPropagation();
        this.#commitRename(false);
      } else if (k.key === "Escape") {
        k.preventDefault();
        k.stopPropagation();
        this.#closeRename();
      }
    });
    input.addEventListener("input", () => {
      error.hidden = true;
      error.textContent = "";
    });
    input.addEventListener("blur", () => {
      if (this.#rename === rename) this.#commitRename(true);
    });
    input.focus();
    input.select();
  }

  /**
   * Rename the mockup to the field's text (C4-C6). A refusal is shown beside the field, which stays
   * open (C5), unless the field was left (`leaving`), which cancels.
   */
  #commitRename(leaving: boolean): void {
    const r = this.#rename;
    if (!r) return;
    const result = r.input.value === r.name ? { mockup: r.name } : this.session.renameMockup(r.name, r.input.value);
    if ("error" in result) {
      if (leaving) return this.#closeRename();
      r.error.textContent = result.error;
      r.error.hidden = false;
      return;
    }
    const focused = this.#root.activeElement === r.input;
    this.#closeRename();
    if (focused) this.focus({ preventScroll: true });
  }

  #closeRename(): void {
    const r = this.#rename;
    if (!r) return;
    this.#rename = null;
    const name = (r.label.parentElement as HTMLElement | null)?.dataset.mockup ?? r.name;
    r.label.textContent = name;
  }

  #onFrameClick(e: MouseEvent): void {
    if (this.hasAttribute("preview")) return;
    const frame = e.composedPath().find((t) => t instanceof HTMLElement && t.classList.contains("mkd-canvas__frame")) as HTMLElement | undefined;
    const name = frame?.dataset.mockup;
    if (name === undefined || frame!.hasAttribute("data-active")) return;
    this.session.setActive(name);
  }

  // --- the view -----------------------------------------------------------------------------------

  #size(): [number, number] {
    return [this.#viewport.clientWidth || this.clientWidth, this.#viewport.clientHeight || this.clientHeight];
  }

  #fitBox(box: CanvasBox): void {
    const [w, h] = this.#size();
    this.#setView(fitView(box, w, h));
  }

  #setView(v: CanvasView): void {
    const next = { zoom: clampZoom(v.zoom), x: v.x, y: v.y };
    if (!Number.isFinite(next.x) || !Number.isFinite(next.y)) return;
    const old = this.#view;
    if (old.zoom === next.zoom && old.x === next.x && old.y === next.y) return;
    this.#view = next;
    this.#applyView();
    this.dispatchEvent(new CustomEvent(VIEW_EVENT, { bubbles: true, composed: true, detail: { ...next } }));
  }

  /** Draw the view (C8): a transform up to 200 %, the frames laid out again with `zoom` above it. */
  #applyView(): void {
    const { zoom: z, x, y } = this.#view;
    const r = zoomRendering(z);
    this.#world.style.transform = `translate(${-x * z}px, ${-y * z}px) scale(${r.transform})`;
    this.#world.style.setProperty("--mkd-canvas-zoom", String(z));
    const layout = r.layout === 1 ? "" : String(r.layout);
    for (const f of this.#frames.values()) if (f.el.style.zoom !== layout) f.el.style.zoom = layout;
    this.#drawMinimap();
  }

  // --- input --------------------------------------------------------------------------------------

  #local(e: { clientX: number; clientY: number }): [number, number] {
    const r = this.#viewport.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  /** Cmd/Ctrl+wheel and a pinch zoom about the pointer (C3); the wheel alone pans (C6). */
  #onWheel(e: WheelEvent): void {
    e.preventDefault();
    const [, h] = this.#size();
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? h : 1;
    const v = this.#view;
    if (e.ctrlKey || e.metaKey) {
      const dy = Math.max(-WHEEL_ZOOM_MAX, Math.min(WHEEL_ZOOM_MAX, e.deltaY * unit));
      const [px, py] = this.#local(e);
      this.#setView(zoomAt(v, v.zoom * Math.exp(-dy * WHEEL_ZOOM), px, py));
      return;
    }
    let dx = e.deltaX * unit;
    let dy = e.deltaY * unit;
    if (e.shiftKey && !dx) {
      dx = dy;
      dy = 0;
    }
    this.#setView({ zoom: v.zoom, x: v.x + dx / v.zoom, y: v.y + dy / v.zoom });
  }

  /** Safari's pinch: gesture events with a scale since the gesture began (C3). */
  #onGesture(e: Event, phase: "start" | "change" | "end"): void {
    const g = e as Event & { scale?: number; clientX?: number; clientY?: number };
    e.preventDefault();
    if (phase === "start") this.#gesture = this.#view.zoom;
    else if (phase === "end") this.#gesture = null;
    else if (this.#gesture !== null && typeof g.scale === "number") {
      const [px, py] = this.#local({ clientX: g.clientX ?? 0, clientY: g.clientY ?? 0 });
      this.#setView(zoomAt(this.#view, this.#gesture * g.scale, px, py));
    }
  }

  /** The zoom keys (C3, C4) and the space bar of a pan (C6); none in a text field. */
  #onKey(e: KeyboardEvent): void {
    if (e.defaultPrevented || isTextField(e.composedPath()[0])) return;
    const command = e.ctrlKey || e.metaKey;
    const [w, h] = this.#size();
    if (command && !e.altKey) {
      const v = this.#view;
      if (e.key === "=" || e.key === "+" || e.code === "NumpadAdd") this.#setView(zoomAt(v, stepZoom(v.zoom, 1), w / 2, h / 2));
      else if (e.key === "-" || e.key === "_" || e.code === "NumpadSubtract") this.#setView(zoomAt(v, stepZoom(v.zoom, -1), w / 2, h / 2));
      else if (e.key === "0" || e.code === "Digit0" || e.code === "Numpad0") this.fit();
      else if (e.key === "1" || e.code === "Digit1" || e.code === "Numpad1") this.#setView(zoomAt(v, 1, w / 2, h / 2));
      else return;
      e.preventDefault();
      return;
    }
    if (e.shiftKey && !command && !e.altKey && e.code === "Digit2") {
      e.preventDefault();
      this.fitSelection();
      return;
    }
    if (e.key === " " && !command && !e.altKey) {
      e.preventDefault();
      this.#setSpace(true);
    }
  }

  #setSpace(on: boolean): void {
    this.#space = on;
    this.#viewport.classList.toggle("mkd-canvas--grab", on);
  }

  /** A drag with the space bar held or with the middle button pans (C6); the editor never sees it. */
  #onPanStart(e: PointerEvent): void {
    if (e.button === 0 && this.#mini === null && e.composedPath().includes(this.#minimap)) return;
    if (!(e.button === 1 || (e.button === 0 && this.#space))) return;
    e.preventDefault();
    e.stopPropagation();
    this.focus({ preventScroll: true });
    this.setPointerCapture?.(e.pointerId);
    this.#pan = { id: e.pointerId, x: e.clientX, y: e.clientY, view: { ...this.#view }, button: e.button };
    this.#viewport.classList.add("mkd-canvas--panning");
  }

  #onPanMove(e: PointerEvent): void {
    const p = this.#pan;
    if (!p || p.id !== e.pointerId) return;
    const z = p.view.zoom;
    this.#setView({ zoom: z, x: p.view.x - (e.clientX - p.x) / z, y: p.view.y - (e.clientY - p.y) / z });
  }

  #onPanEnd(e: PointerEvent): void {
    const p = this.#pan;
    if (!p || p.id !== e.pointerId) return;
    this.#pan = null;
    this.releasePointerCapture?.(e.pointerId);
    this.#viewport.classList.remove("mkd-canvas--panning");
    if (p.button === 0) this.#suppressClick = true;
    // A click that never comes (the pointer was released elsewhere) must not swallow the next one.
    setTimeout(() => {
      this.#suppressClick = false;
    }, 0);
  }

  // --- the minimap --------------------------------------------------------------------------------

  #queueMinimap(): void {
    if (this.#minimapQueued) return;
    this.#minimapQueued = true;
    const run = (): void => {
      this.#minimapQueued = false;
      this.#drawMinimap();
    };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
    else setTimeout(run, 0);
  }

  #mapping(): MinimapMapping | null {
    if (this.#mini) return this.#mini.map;
    const boxes = [...this.#boxes().values()];
    if (!boxes.length) return null;
    const [w, h] = this.#size();
    return minimapMapping(boxes, viewBox(this.#view, w, h), MINIMAP_WIDTH, MINIMAP_HEIGHT);
  }

  /** The minimap (C7): every frame and the viewport's rectangle. */
  #drawMinimap(): void {
    const map = this.#mapping();
    this.#minimap.hidden = map === null;
    if (!map) return;
    const session = this.#session!;
    const seen = new Set<string>();
    for (const [name, b] of this.#boxes()) {
      seen.add(name);
      let el = this.#miniFrames.get(name);
      if (!el) {
        el = document.createElement("div");
        el.className = "mkd-canvas__mini-frame";
        el.setAttribute("part", "minimap-frame");
        this.#miniFrames.set(name, el);
      }
      el.dataset.mockup = name;
      el.toggleAttribute("data-active", name === session.active);
      const p = toMinimap(map, b.x, b.y);
      Object.assign(el.style, { left: `${p.x}px`, top: `${p.y}px`, width: `${Math.max(1, b.w * map.scale)}px`, height: `${Math.max(1, b.h * map.scale)}px` });
      if (el.parentNode !== this.#minimap) this.#minimap.insertBefore(el, this.#miniViewport);
    }
    for (const [name, el] of [...this.#miniFrames]) {
      if (seen.has(name)) continue;
      el.remove();
      this.#miniFrames.delete(name);
    }
    const [w, h] = this.#size();
    const vb = viewBox(this.#view, w, h);
    const p = toMinimap(map, vb.x, vb.y);
    Object.assign(this.#miniViewport.style, { left: `${p.x}px`, top: `${p.y}px`, width: `${vb.w * map.scale}px`, height: `${vb.h * map.scale}px` });
  }

  /** A press in the minimap: on the viewport's rectangle it starts a drag; elsewhere it centres the viewport there first (C6, C7). */
  #onMiniDown(e: PointerEvent): void {
    if (e.button !== 0 || this.#pan) return;
    const map = this.#mapping();
    if (!map) return;
    e.preventDefault();
    e.stopPropagation();
    const r = this.#minimap.getBoundingClientRect();
    const mx = e.clientX - r.left - this.#minimap.clientLeft;
    const my = e.clientY - r.top - this.#minimap.clientTop;
    if (!e.composedPath().includes(this.#miniViewport)) {
      const c = fromMinimap(map, mx, my);
      const [w, h] = this.#size();
      this.#setView({ zoom: this.#view.zoom, x: c.x - w / 2 / this.#view.zoom, y: c.y - h / 2 / this.#view.zoom });
    }
    this.#minimap.setPointerCapture?.(e.pointerId);
    this.#mini = { id: e.pointerId, x: e.clientX, y: e.clientY, view: { ...this.#view }, map };
  }

  #onMiniMove(e: PointerEvent): void {
    const m = this.#mini;
    if (!m || m.id !== e.pointerId) return;
    this.#setView({ zoom: m.view.zoom, x: m.view.x + (e.clientX - m.x) / m.map.scale, y: m.view.y + (e.clientY - m.y) / m.map.scale });
  }

  #onMiniEnd(e: PointerEvent): void {
    const m = this.#mini;
    if (!m || m.id !== e.pointerId) return;
    this.#mini = null;
    this.#minimap.releasePointerCapture?.(e.pointerId);
    this.#drawMinimap();
  }
}

/**
 * The natural width of a rendering in a shadow root, in its own CSS pixels: the sum of its cells' frame
 * widths (the device width `--mkd-w`, or a fit frame's laid-out width) and the gaps between them; null
 * when it shows no frame.
 */
function naturalWidth(root: ShadowRoot | null): number | null {
  const stage = root?.querySelector(".mkd-stage");
  if (!stage) return null;
  let total = 0;
  let n = 0;
  for (const frame of stage.querySelectorAll<HTMLElement>(":scope > .mkd-cell > .mkd-frame")) {
    const device = Number.parseFloat(frame.style.getPropertyValue("--mkd-w"));
    const w = frame.dataset.fit === "true" || !Number.isFinite(device) ? frame.offsetWidth : device;
    total += w;
    n++;
  }
  if (!n) return null;
  const gap = typeof getComputedStyle === "function" ? Number.parseFloat(getComputedStyle(stage).columnGap) : 0;
  return total + (Number.isFinite(gap) ? gap : 0) * (n - 1);
}

declare global {
  interface HTMLElementTagNameMap {
    "mockitdown-canvas": CanvasElement;
  }
}
