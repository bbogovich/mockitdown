/**
 * `<mockitdown-editor>`: the editable view of one mockup of a design session (R-TOOL-001, A-WEB-5).
 *
 *   <mockitdown-editor pack="mui" device="phone">
 *     <script type="text/mockitdown">
 *       List { Card { Button("Open") {} } }
 *     </script>
 *   </mockitdown-editor>
 *
 * The editor renders the mockup its `mockup` attribute names, else the session's active mockup, with
 * the `edit` render option (R-EDIT-004) and the mockup's options (R-EDIT-005.C9) into its open shadow
 * root, resolving imports and images as `mockitdown-mockup` does (`import-base`, `asset-base`).
 *
 * Its session (R-EDIT-006.C11) is the one of the nearest enclosing `mockitdown-designer`, else the one
 * its host sets as `session`, else a session of its own over a one-mockup document made from its
 * `<script type="text/mockitdown">` child (named by `mockup`, default "Mockup") whose defaults are the
 * fence attributes (`pack`, `device`, …). Only an editor with a session of its own dispatches the
 * session's notifications as DOM events (`mockitdown-select`, …, R-EDIT-006.C7, C8).
 *
 * Pointer and keys (C4-C8): a click selects the innermost element under the pointer that a view node
 * produced (`data-mkd-node`), or the construct it was derived from (`data-mkd-derived`, shown with a
 * "derived" badge); a click on the selected element or Esc selects its parent, Enter goes back to the
 * child it came from (a click on a selected node without a parent selects the innermost element
 * again); Alt-click cycles through every element under the pointer, innermost first; a click outside
 * every element clears the selection. Hovering sets the session's hovered node.
 *
 * The outlines are drawn in a layer above the rendering (`part="overlay"`), which changes neither its
 * layout nor its attributes, coloured by `--mkd-selection-color` (default `#ff8a00`) and
 * `--mkd-hover-color` (default `#2f80ed`). The editor holds no editing rule (A-WEB-5.K2): every
 * change goes through the session.
 *
 * Drag and drop (R-TOOL-005, `./drag.ts`): while a gallery card or outline rows are dragged over the
 * view, the editor outlines the innermost container under the pointer (`session.isContainer`; the top
 * level when there is none) and draws an insertion bar at the gap between its children nearest the
 * pointer, across the axis its children are laid out along (horizontal for a `VStack`, vertical for an
 * `HStack`). A position the session refuses (`checkDrop`) is drawn in the refused colour; a drop calls
 * `session.drop`. Only the session's active mockup takes drops.
 */

import { assetsLoaded, coerceFenceOptions, Diagnostic, errorHtml, FENCE_OPTIONS, Location } from "../core/index.js";
import { mockupOptions, newDesign } from "../design/document.js";
import { DESIGN_EVENTS, DesignSession, type DesignNotification } from "../design/session.js";
import type { DropPosition } from "../design/session.js";
import { loadAssetsFromUrl } from "./assets.js";
import { registerDropTarget, type Drag, type DropAnswer } from "./drag.js";
import { baseUrls, renderWithImports, SCRIPT_TYPE, scriptCode, showInShadow } from "./mockup.js";

export const EDITOR_TAG = "mockitdown-editor";
/** The attributes the editor observes: `mockup`, the fence attributes (its own session's defaults) and the two base URLs. */
export const EDITOR_ATTRIBUTES: readonly string[] = ["mockup", ...FENCE_OPTIONS.keys(), "import-base", "asset-base"];
/** The name of the mockup of an editor's own session when its `mockup` attribute names none. */
const OWN_MOCKUP = "Mockup";
const DESIGNER_TAG = "mockitdown-designer";
/** Below this distance from the editor's top edge a tag or badge is drawn inside its outline. */
const LABEL_ROOM = 18;

const EDITOR_CSS = `:host{position:relative;outline:none}
:host(:focus-visible){outline:2px solid var(--mkd-selection-color,#ff8a00);outline-offset:2px}
.mkd-editor__view{cursor:default}
.mkd-editor__overlay{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2147483647}
.mkd-editor__box{position:absolute;box-sizing:border-box;border:2px solid var(--mkd-selection-color,#ff8a00);border-radius:2px}
.mkd-editor__box--hover{border:1px solid var(--mkd-hover-color,#2f80ed)}
.mkd-editor__tag,.mkd-editor__badge{position:absolute;font:500 11px/16px system-ui,sans-serif;white-space:nowrap;padding:0 5px;border-radius:3px;color:#fff}
.mkd-editor__tag{left:-1px;bottom:100%;margin-bottom:2px;background:var(--mkd-hover-color,#2f80ed)}
.mkd-editor__tag--inside{bottom:auto;top:1px;margin:0}
.mkd-editor__badge{right:-2px;top:-2px;transform:translateY(-100%);background:var(--mkd-selection-color,#ff8a00)}
.mkd-editor__badge--inside{transform:none;top:0;right:0}
.mkd-editor__drop{position:absolute;box-sizing:border-box;border:2px dashed var(--mkd-drop-color,#2f80ed);border-radius:3px}
.mkd-editor__bar{position:absolute;background:var(--mkd-drop-color,#2f80ed);border-radius:2px}
.mkd-editor__drop--refused,.mkd-editor__bar--refused{--mkd-drop-color:var(--mkd-drop-refused-color,#d93025)}`;

/** The thickness of the insertion bar, in CSS pixels (R-TOOL-005.C3). */
const BAR = 3;

/** A rectangle relative to the editor's host. */
interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** The drop position the editor shows during a drag: its container, the bar and the session's answer. */
interface DropMark {
  position: DropPosition;
  allowed: boolean;
  container: Box;
  bar: Box;
  /** The axis the container's children are laid out along; the bar runs across it. */
  axis: "vertical" | "horizontal";
}

/** The element name an outline's tag shows: the role root's `data-el`, else its tag name. */
export function elementName(el: Element): string {
  return el.getAttribute("data-el") || el.localName;
}

/** The hover tag text (C8): `Button · 88 × 32`, the size in whole CSS pixels. */
export function sizeTag(name: string, width: number, height: number): string {
  return `${name} · ${Math.round(width)} × ${Math.round(height)}`;
}

const MARKED = (el: Element): boolean => el.hasAttribute("data-mkd-node") || el.hasAttribute("data-mkd-derived");

const Base: typeof HTMLElement = (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) as typeof HTMLElement;

export class EditorElement extends Base {
  static get observedAttributes(): string[] {
    return [...EDITOR_ATTRIBUTES];
  }

  #root: ShadowRoot;
  #session: DesignSession | null = null;
  #given: DesignSession | null = null;
  #own: DesignSession | null = null;
  #unsubscribe: (() => void) | null = null;
  #observer: MutationObserver | null = null;
  #resize: ResizeObserver | null = null;
  #view: HTMLElement | null = null;
  #overlay: HTMLElement | null = null;
  #diagnostics: Diagnostic[] = [];
  /** The element under the pointer (C8). */
  #hoverEl: Element | null = null;
  /** The children the selection climbed from, innermost last (C6, Enter). */
  #trail: string[] = [];
  /** The selection the editor itself is making by climbing: its `select` notification keeps the trail. */
  #expect: string[] | null = null;
  /** The last Alt-click's stack of nodes and the position in it (C7). */
  #cycle: { stack: string[]; index: number } | null = null;
  /** The pack of the last render, whose role rules a drop is checked by. */
  #pack = "";
  #drop: DropMark | null = null;
  #generation = 0;
  #dirty = true;
  #queued = false;
  #running = false;
  #renderedOnce = false;
  #waiters: (() => void)[] = [];

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#root.addEventListener("click", (e) => this.#onClick(e as MouseEvent));
    this.#root.addEventListener("pointermove", (e) => this.#onPointer(e));
    this.#root.addEventListener("scroll", () => this.#drawOverlay(), true);
    this.addEventListener("pointerleave", () => this.#onLeave());
    this.addEventListener("keydown", (e) => this.#onKey(e));
    registerDropTarget(this, {
      over: (drag, x, y) => this.#dragOver(drag, x, y),
      leave: () => {
        if (this.#drop === null) return;
        this.#drop = null;
        this.#drawOverlay();
      },
      drop: (drag) => this.#dragDrop(drag),
    });
  }

  // --- properties ---------------------------------------------------------------------------------

  /** The design session the editor shows (R-EDIT-006.C11); setting it makes the host's session the editor's. */
  get session(): DesignSession {
    return this.#attach();
  }

  set session(value: DesignSession | null) {
    this.#given = value instanceof DesignSession ? value : null;
    this.#attach();
  }

  /** The name of the mockup shown: the `mockup` attribute, else the session's active mockup. */
  get mockup(): string | null {
    return this.getAttribute("mockup") ?? this.session.active;
  }

  /** The shown mockup's code (C3); setting it changes the code through the session (`setCode`). */
  get code(): string {
    const name = this.mockup;
    return name === null ? "" : this.session.code(name) ?? "";
  }

  set code(value: string) {
    const name = this.mockup;
    if (name !== null) this.session.setCode(name, String(value));
  }

  /** The last render's diagnostics. */
  get diagnostics(): Diagnostic[] {
    return [...this.#diagnostics];
  }

  /** A promise that resolves after the next render, or at once when rendered and up to date; it never rejects. */
  get rendered(): Promise<void> {
    if (this.#renderedOnce && !this.#dirty && !this.#running && !this.#queued) return Promise.resolve();
    return new Promise((resolve) => this.#waiters.push(resolve));
  }

  /**
   * Select one view node of the shown mockup (C3), making the mockup active first; null clears the
   * selection. Returns the session's answer.
   */
  select(nodeId: string | null): { selection: string[] } | { error: string } {
    const name = this.#activate();
    if (name === null) return { error: "there is no mockup to select in" };
    this.#trail = [];
    return this.session.select(nodeId === null ? [] : [nodeId]);
  }

  // --- lifecycle ----------------------------------------------------------------------------------

  connectedCallback(): void {
    if (!this.hasAttribute("tabindex")) this.tabIndex = 0;
    this.#observer ??= new MutationObserver(() => this.#scriptChanged());
    this.#observer.observe(this, { childList: true, characterData: true, subtree: true });
    if (typeof ResizeObserver !== "undefined") {
      this.#resize ??= new ResizeObserver(() => this.#drawOverlay());
      this.#resize.observe(this);
    }
    this.#attach();
    this.#schedule();
  }

  disconnectedCallback(): void {
    this.#observer?.disconnect();
    this.#resize?.disconnect();
  }

  attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    if (old === value) return;
    if (this.#own && this.#session === this.#own && FENCE_OPTIONS.has(name)) this.#own.document.defaults = this.#fenceOptions()[0];
    this.#schedule();
  }

  // --- the session --------------------------------------------------------------------------------

  /** Join the nearest designer's session, else the host's, else one of its own; subscribe when it changed. */
  #attach(): DesignSession {
    const next = this.#designerSession() ?? this.#given ?? (this.#own ??= this.#ownSession());
    if (next !== this.#session) {
      this.#unsubscribe?.();
      this.#session = next;
      this.#unsubscribe = next.subscribe((n) => this.#notified(n));
      this.#trail = [];
      this.#cycle = null;
      this.#hoverEl = null;
      this.#schedule();
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

  #ownSession(): DesignSession {
    const doc = newDesign(EDITOR_TAG);
    doc.defaults = this.#fenceOptions()[0];
    doc.mockups.push({ name: this.getAttribute("mockup") ?? OWN_MOCKUP, x: 0, y: 0, code: this.#scriptCode() });
    return new DesignSession(doc);
  }

  #fenceOptions(): [Record<string, unknown>, string[]] {
    const raw: Record<string, string> = {};
    for (const name of FENCE_OPTIONS.keys()) {
      const value = this.getAttribute(name);
      if (value === null) continue;
      raw[name] = value === "" && FENCE_OPTIONS.get(name) === "bool" ? "true" : value;
    }
    return coerceFenceOptions(raw);
  }

  #scriptCode(): string {
    for (const child of Array.from(this.children)) {
      if (child.localName === "script" && (child.getAttribute("type") ?? "").trim().toLowerCase() === SCRIPT_TYPE) {
        return scriptCode(child.textContent ?? "");
      }
    }
    return "";
  }

  /** The script child changed: an editor with its own session takes it as the mockup's new code. */
  #scriptChanged(): void {
    if (!this.#own || this.#session !== this.#own) return;
    const name = this.#own.document.mockups[0]?.name;
    if (name !== undefined) this.#own.setCode(name, this.#scriptCode());
  }

  #notified(n: DesignNotification): void {
    const name = this.mockup;
    switch (n.kind) {
      case "change":
        if (n.detail.mockup === name && n.detail.kind !== "move") this.#schedule();
        break;
      case "active":
        if (!this.hasAttribute("mockup")) this.#schedule();
        this.#trail = [];
        break;
      case "select":
        if (!(this.#expect && sameList(this.#expect, n.detail.nodes))) this.#trail = [];
        if (n.detail.mockup === name) this.#reveal(n.detail.nodes);
        break;
      case "hover":
        if (n.detail.mockup === name) this.#drawOverlay();
        break;
    }
    if (this.#session === this.#own && n.kind in DESIGN_EVENTS) {
      const type = DESIGN_EVENTS[n.kind as keyof typeof DESIGN_EVENTS];
      this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: n.detail }));
    }
  }

  /** Make the shown mockup the session's active one; null when there is none. */
  #activate(): string | null {
    const session = this.session;
    const name = this.mockup;
    if (name === null || !session.mockup(name)) return null;
    if (session.active !== name && "error" in session.setActive(name)) return null;
    return name;
  }

  // --- rendering ----------------------------------------------------------------------------------

  #schedule(): void {
    this.#generation++;
    this.#dirty = true;
    if (!this.isConnected || this.#queued) return;
    this.#queued = true;
    queueMicrotask(() => {
      this.#queued = false;
      void this.#pump();
    });
  }

  async #pump(): Promise<void> {
    if (this.#running) return;
    this.#running = true;
    try {
      while (this.#dirty && this.isConnected) {
        this.#dirty = false;
        await this.#renderOnce(this.#generation);
      }
    } finally {
      this.#running = false;
    }
    if (!this.#dirty && this.#renderedOnce) {
      const waiters = this.#waiters;
      this.#waiters = [];
      for (const w of waiters) w();
    }
  }

  /** One render; abandoned (without touching the shadow root) when a newer change arrived meanwhile. */
  async #renderOnce(generation: number): Promise<void> {
    const stale = (): boolean => generation !== this.#generation;
    let html = "";
    let packs: string[] = [];
    let diagnostics: Diagnostic[] = [];
    try {
      if (!assetsLoaded()) await loadAssetsFromUrl();
      if (stale()) return;
      const session = this.session;
      const name = this.mockup;
      if (name !== null && session.mockup(name)) {
        const { importBase, assetBase } = baseUrls(this);
        const options = { ...(mockupOptions(session.document, name) ?? {}), edit: true };
        const result = await renderWithImports(session.code(name) ?? "", options, importBase, assetBase, stale);
        if (result === null) return;
        const fence = this.#session === this.#own
          ? this.#fenceOptions()[1].map((p) => new Diagnostic("error", p, new Location(), "fence"))
          : [];
        diagnostics = [...result.diagnostics, ...fence];
        html = (fence.length ? errorHtml(fence) : "") + result.html;
        packs = result.packs;
        this.#pack = result.screen?.pack.id ?? this.#pack;
      }
    } catch (e) {
      if (stale()) return;
      const message = e instanceof Error ? e.message : String(e);
      diagnostics = [new Diagnostic("error", `cannot render: ${message}`, new Location(), "element")];
      html = errorHtml(diagnostics);
    }
    if (stale()) return;
    showInShadow(this.#root, packs, html, EDITOR_CSS, (h) =>
      `<div class="mkd-editor__view" part="view">${h}</div><div class="mkd-editor__overlay" part="overlay" aria-hidden="true"></div>`);
    this.#view = this.#root.querySelector(".mkd-editor__view");
    this.#overlay = this.#root.querySelector(".mkd-editor__overlay");
    this.#diagnostics = diagnostics;
    this.#hoverEl = null;
    this.#renderedOnce = true;
    this.#drawOverlay();
  }

  // --- pointer and keys ---------------------------------------------------------------------------

  /** The node an element stands for: the construct it was derived from, else its own node (C4, C5). */
  #nodeOf(el: Element): string | null {
    const name = this.mockup;
    const ordinal = el.getAttribute("data-mkd-derived") ?? el.getAttribute("data-mkd-node");
    return name === null || ordinal === null ? null : this.session.nodeFor(name, ordinal);
  }

  /** The elements of the rendering an event passed through that a view node produced, innermost first. */
  #pathElements(e: Event): Element[] {
    const view = this.#view;
    if (!view) return [];
    return e.composedPath().filter((t): t is Element => t instanceof Element && t !== view && view.contains(t) && MARKED(t));
  }

  /** The nodes of elements, in their order, each once. */
  #nodes(elements: readonly Element[]): string[] {
    const out: string[] = [];
    for (const el of elements) {
      const id = this.#nodeOf(el);
      if (id !== null && !out.includes(id)) out.push(id);
    }
    return out;
  }

  #onClick(e: MouseEvent): void {
    if (!this.#view || !e.composedPath().includes(this.#view)) return;
    e.preventDefault();
    this.focus({ preventScroll: true });
    const name = this.#activate();
    if (name === null) return;
    const session = this.session;
    const elements = this.#pathElements(e);
    if (e.altKey) {
      const stack = this.#nodes(this.#elementsAt(e.clientX, e.clientY, elements));
      if (!stack.length) return;
      const sel = session.selection;
      const cycle = this.#cycle;
      const index = cycle && sameList(cycle.stack, stack) && sel.length === 1 && sel[0] === stack[cycle.index]
        ? (cycle.index + 1) % stack.length
        : 0;
      this.#cycle = { stack, index };
      this.#trail = [];
      session.select([stack[index]!]);
      return;
    }
    this.#cycle = null;
    const stack = this.#nodes(elements);
    if (!stack.length) {
      session.select([]);
      return;
    }
    const sel = session.selection;
    // A click on the selected element climbs; at a node without a parent it starts again at the innermost.
    if (sel.length === 1 && stack.includes(sel[0]!) && session.tree(name)?.byId(sel[0]!)?.parent) this.#climb();
    else {
      this.#trail = [];
      session.select([stack[0]!]);
    }
  }

  /** Every element under a point that a view node produced, innermost (topmost) first. */
  #elementsAt(x: number, y: number, fallback: Element[]): Element[] {
    const view = this.#view;
    const root = this.#root as ShadowRoot & { elementsFromPoint?: (x: number, y: number) => Element[] };
    if (!view || typeof root.elementsFromPoint !== "function") return fallback;
    return root.elementsFromPoint(x, y).filter((el) => el !== view && view.contains(el) && MARKED(el));
  }

  /** Move the selection to the parent view node (C6), remembering the child for Enter. */
  #climb(): void {
    const name = this.mockup;
    const session = this.session;
    const sel = session.selection;
    if (name === null || session.active !== name || !sel.length) return;
    const node = session.tree(name)?.byId(sel[0]!);
    const parent = node?.parent;
    if (!node || !parent) return;
    this.#selectKeepingTrail([parent.id], [...this.#trail, node.id]);
  }

  /** Move the selection back to the child it climbed from (C6). */
  #descend(): void {
    const name = this.mockup;
    const session = this.session;
    const sel = session.selection;
    const child = this.#trail[this.#trail.length - 1];
    if (name === null || session.active !== name || sel.length !== 1 || child === undefined) return;
    const node = session.tree(name)?.byId(child);
    if (!node || node.parent?.id !== sel[0]) {
      this.#trail = [];
      return;
    }
    this.#selectKeepingTrail([child], this.#trail.slice(0, -1));
  }

  #selectKeepingTrail(ids: string[], trail: string[]): void {
    this.#expect = ids;
    try {
      this.session.select(ids);
    } finally {
      this.#expect = null;
    }
    this.#trail = trail;
  }

  #onKey(e: KeyboardEvent): void {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "Escape") {
      e.preventDefault();
      this.#climb();
    } else if (e.key === "Enter") {
      e.preventDefault();
      this.#descend();
    }
  }

  #onPointer(e: Event): void {
    const el = this.#pathElements(e)[0] ?? null;
    if (el === this.#hoverEl) return;
    this.#hoverEl = el;
    this.#setHover(el === null ? null : this.#nodeOf(el));
    this.#drawOverlay();
  }

  #onLeave(): void {
    if (this.#hoverEl === null) return;
    this.#hoverEl = null;
    this.#setHover(null);
    this.#drawOverlay();
  }

  #setHover(id: string | null): void {
    const session = this.#session;
    const name = this.mockup;
    if (session && name !== null && session.active === name) session.hover(id);
  }

  // --- drag and drop (R-TOOL-005) -----------------------------------------------------------------

  /** C3, C4: the innermost container under a point, the gap nearest it, and the session's answer. */
  #dragOver(drag: Drag, x: number, y: number): DropAnswer | null {
    const session = this.#session;
    const view = this.#view;
    const name = this.mockup;
    if (!session || !view || drag.session !== session || name === null || session.active !== name) return this.#clearDrop();
    const root = this.#root as ShadowRoot & { elementsFromPoint?: (x: number, y: number) => Element[] };
    const hits = typeof root.elementsFromPoint === "function" ? root.elementsFromPoint(x, y) : [];
    if (!hits.some((h) => h === view || view.contains(h))) return this.#clearDrop();
    let containerEl: Element = view;
    let parent: string | null = null;
    for (const h of hits) {
      if (h === view || !view.contains(h) || !h.hasAttribute("data-mkd-node")) continue;
      const id = session.nodeFor(name, h.getAttribute("data-mkd-node")!);
      if (id !== null && session.isContainer(id, this.#pack)) {
        containerEl = h;
        parent = id;
        break;
      }
    }
    const host = this.getBoundingClientRect();
    const rel = (r: DOMRect | Box): Box => ({ left: r.left - host.left, top: r.top - host.top, width: r.width, height: r.height });
    const children = session.childrenOf(parent);
    const rects: { index: number; box: Box }[] = [];
    children.forEach((id, index) => {
      const box = this.#boxWithin(containerEl, id);
      if (box) rects.push({ index, box: rel(box) });
    });
    const axis = layoutAxis(containerEl, rects.map((r) => r.box));
    const px = x - host.left;
    const py = y - host.top;
    const centre = (b: Box): number => (axis === "vertical" ? b.top + b.height / 2 : b.left + b.width / 2);
    const k = rects.findIndex((r) => centre(r.box) > (axis === "vertical" ? py : px));
    const index = k < 0 ? (rects.length ? rects[rects.length - 1]!.index + 1 : "end") : rects[k]!.index;
    const container = rel(containerEl.getBoundingClientRect());
    const prev = k < 0 ? rects[rects.length - 1]?.box : k > 0 ? rects[k - 1]!.box : undefined;
    const next = k < 0 ? undefined : rects[k]!.box;
    const position: DropPosition = { parent, index: index === "end" || index >= children.length ? "end" : index };
    const check = session.checkDrop(drag.source, position, this.#pack);
    this.#drop = { position, allowed: check.ok, container, bar: insertionBar(axis, container, prev, next), axis };
    this.#drawOverlay();
    return check.ok ? { allowed: true } : { allowed: false, reason: check.reason };
  }

  #clearDrop(): null {
    if (this.#drop !== null) {
      this.#drop = null;
      this.#drawOverlay();
    }
    return null;
  }

  #dragDrop(drag: Drag): void {
    const mark = this.#drop;
    this.#drop = null;
    this.#drawOverlay();
    // C5, C6: one session operation — an insert, selected, or a move of the dragged nodes.
    if (mark?.allowed) this.session.drop(drag.source, mark.position, this.#pack);
  }

  /** The box around a child node's outermost elements inside a container element, or null when it has none there. */
  #boxWithin(container: Element, id: string): Box | null {
    const name = this.mockup;
    const node = name === null ? null : this.session.tree(name)?.byId(id);
    if (!node) return null;
    const sel = `[data-mkd-node="${node.ordinal}"],[data-mkd-derived="${node.ordinal}"]`;
    const found = Array.from(container.querySelectorAll(sel));
    const outer = found.filter((el) => !found.some((o) => o !== el && o.contains(el)));
    let box: Box | null = null;
    for (const el of outer) {
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      if (!box) box = { left: r.left, top: r.top, width: r.width, height: r.height };
      else {
        const right = Math.max(box.left + box.width, r.right);
        const bottom = Math.max(box.top + box.height, r.bottom);
        box.left = Math.min(box.left, r.left);
        box.top = Math.min(box.top, r.top);
        box.width = right - box.left;
        box.height = bottom - box.top;
      }
    }
    return box;
  }

  // --- outlines -----------------------------------------------------------------------------------

  /**
   * The elements of a view node (C8, C9): those carrying its ordinal as `data-mkd-node`, else the
   * outermost of those derived from it (a `ForEach`, an `if` or a struct call has no element of its own).
   */
  #elementsOf(id: string): Element[] {
    const view = this.#view;
    const name = this.mockup;
    const node = name === null ? null : this.session.tree(name)?.byId(id);
    if (!view || !node) return [];
    const own = Array.from(view.querySelectorAll(`[data-mkd-node="${node.ordinal}"]`));
    if (own.length) return own;
    const derived = Array.from(view.querySelectorAll(`[data-mkd-derived="${node.ordinal}"]`));
    return derived.filter((el) => !derived.some((other) => other !== el && other.contains(el)));
  }

  /** A new selection: scroll its first element into view (C9) and redraw. */
  #reveal(ids: readonly string[]): void {
    const first = ids.length ? this.#elementsOf(ids[0]!)[0] : undefined;
    if (first && typeof (first as HTMLElement).scrollIntoView === "function") {
      (first as HTMLElement).scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    this.#drawOverlay();
  }

  /** Redraw the selection and hover outlines over the rendering (C8-C10). */
  #drawOverlay(): void {
    const overlay = this.#overlay;
    if (!overlay) return;
    overlay.replaceChildren();
    const session = this.#session;
    const name = this.mockup;
    if (!session || name === null || !this.#view) return;
    const host = this.getBoundingClientRect();
    const box = (el: Element, kind: "selection" | "hover"): [HTMLElement, DOMRect] => {
      const r = el.getBoundingClientRect();
      const b = document.createElement("div");
      b.className = `mkd-editor__box mkd-editor__box--${kind}`;
      b.setAttribute("part", kind);
      b.style.left = `${r.left - host.left}px`;
      b.style.top = `${r.top - host.top}px`;
      b.style.width = `${r.width}px`;
      b.style.height = `${r.height}px`;
      overlay.append(b);
      return [b, r];
    };
    const label = (b: HTMLElement, r: DOMRect, cls: string, text: string): void => {
      const span = document.createElement("span");
      span.className = cls;
      span.setAttribute("part", cls === "mkd-editor__tag" ? "tag" : "badge");
      span.textContent = text;
      if (r.top - host.top < LABEL_ROOM) span.classList.add(`${cls}--inside`);
      b.append(span);
    };
    const active = session.active === name;
    if (active) {
      for (const id of session.selection) {
        for (const el of this.#elementsOf(id)) {
          const [b, r] = box(el, "selection");
          if (el.hasAttribute("data-mkd-derived")) label(b, r, "mkd-editor__badge", "derived");
        }
      }
    }
    const hovered = active ? session.hovered : null;
    let hoverEls: Element[] = [];
    if (this.#hoverEl && (!active || (hovered !== null && this.#nodeOf(this.#hoverEl) === hovered))) hoverEls = [this.#hoverEl];
    else if (hovered !== null) hoverEls = this.#elementsOf(hovered);
    hoverEls.forEach((el, i) => {
      const [b, r] = box(el, "hover");
      if (i === 0) label(b, r, "mkd-editor__tag", sizeTag(elementName(el), r.width, r.height));
    });
    const drop = this.#drop;
    if (drop) {
      const place = (cls: string, part: string, at: Box): HTMLElement => {
        const d = document.createElement("div");
        d.className = `${cls}${drop.allowed ? "" : ` ${cls}--refused`}`;
        d.setAttribute("part", part);
        d.style.left = `${at.left}px`;
        d.style.top = `${at.top}px`;
        d.style.width = `${at.width}px`;
        d.style.height = `${at.height}px`;
        overlay.append(d);
        return d;
      };
      place("mkd-editor__drop", "drop-target", drop.container).dataset.refused = String(!drop.allowed);
      const bar = place("mkd-editor__bar", "drop-bar", drop.bar);
      bar.dataset.orientation = drop.axis === "vertical" ? "horizontal" : "vertical";
      bar.dataset.refused = String(!drop.allowed);
    }
  }
}

/**
 * The axis a container lays its children out along: by the first two children's boxes (side by side
 * is horizontal), else by the container's flex direction, else vertical.
 */
function layoutAxis(container: Element, boxes: readonly Box[]): "vertical" | "horizontal" {
  if (boxes.length >= 2) {
    const [a, b] = [boxes[0]!, boxes[1]!];
    const sideBySide = b.left >= a.left + a.width - 1 || a.left >= b.left + b.width - 1;
    const stacked = b.top >= a.top + a.height - 1 || a.top >= b.top + b.height - 1;
    if (sideBySide && !stacked) return "horizontal";
    return "vertical";
  }
  const style = typeof getComputedStyle === "function" ? getComputedStyle(container) : null;
  if (style && /flex/.test(style.display) && style.flexDirection.startsWith("row")) return "horizontal";
  return "vertical";
}

/**
 * The insertion bar (C3): across the axis, spanning the container, at the middle of the gap between
 * the children before and after the position, at the edge of the one there is, or at the container's start.
 */
function insertionBar(axis: "vertical" | "horizontal", c: Box, prev: Box | undefined, next: Box | undefined): Box {
  if (axis === "vertical") {
    const y = prev && next ? (prev.top + prev.height + next.top) / 2
      : next ? next.top - 1 : prev ? prev.top + prev.height + 1 : c.top + 4;
    return { left: c.left + 2, top: Math.round(y - BAR / 2), width: Math.max(c.width - 4, 8), height: BAR };
  }
  const x = prev && next ? (prev.left + prev.width + next.left) / 2
    : next ? next.left - 1 : prev ? prev.left + prev.width + 1 : c.left + 4;
  return { left: Math.round(x - BAR / 2), top: c.top + 2, width: BAR, height: Math.max(c.height - 4, 8) };
}

function sameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

declare global {
  interface HTMLElementTagNameMap {
    "mockitdown-editor": EditorElement;
  }
}
