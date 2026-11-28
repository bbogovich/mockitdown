/**
 * `<mockitdown-gallery>`: the elements a design session's selection may hold, as live previews with an
 * Add button (R-TOOL-004, A-WEB-5).
 *
 *   <mockitdown-gallery></mockitdown-gallery>
 *   <script type="module">gallery.session = editor.session; gallery.filter = "toggle";</script>
 *
 * The gallery lists the elements of the active mockup's pack (the pack its edit-mode evaluation
 * selects): the pack's own elements first, then the inherited core vocabulary, grouped by the category
 * of their role (R-PACK-016.C1) in the order frames, bars, layouts, collections, content, overlays and
 * annotations, after a Components group of the structs the mockup declares or imports. The elements,
 * their roles, doc lines and samples come from the reference data the package publishes in
 * `dist/shared/reference/<pack>.json` (R-WEB-001.C17), fetched beside the shared assets
 * `loadAssetsFromUrl` loads ({@link referenceUrl}); a pack without reference data lists its registered
 * elements without previews.
 *
 * With nothing selected the gallery shows what the root of a mockup accepts; with a selection, what the
 * first selected node's element accepts (`allowedChildren`, R-PACK-016.C7). The footer group "Hidden
 * here" counts the elements the selection filters out and lists them under the reasons the role rules
 * give. The search field, mirrored by `filter`, keeps the cards whose name, role or doc line contains
 * its text, ignoring case (a component by its name); it does not narrow Hidden here.
 *
 * Each card shows the element's name and a preview, a `mockitdown-mockup` of its sample with
 * `device="fit"` in the pack, created when the card comes within 200 px of the gallery's visible part
 * (IntersectionObserver) and kept for the pack. Add, a double-click on the card or Enter on the focused
 * card inserts `<Name>()` through `session.insert` (R-EDIT-006): as the last child of the first selected
 * node, else at the end of the mockup's top level, then selects it; the session notifies `insert`.
 * Up, Down, Home and End move the focus among the cards. A card dragged onto the outline or the
 * editor inserts its element where it is dropped (R-TOOL-005, `./drag.ts`). The session is joined as the outline joins
 * one (R-EDIT-006.C11), and only the gallery's own session's notifications become its DOM events
 * (C7, C8). The gallery holds no editing rule (A-WEB-5.K2): the role rules are the core's.
 */

import { allowedChildren, assetsLoaded, canContain, registry, roleRule, ROLE_CATEGORIES, type Pack, type RoleCategory } from "../core/index.js";
import { mockupOptions, mockupPack, newDesign } from "../design/document.js";
import { DESIGN_EVENTS, DesignSession, type DesignNotification } from "../design/session.js";
import type { EditRefusal, EditResult } from "../core/syntax/edit.js";
import { defaultAssetsUrl, loadAssetsFromUrl } from "./assets.js";
import { armDrag } from "./drag.js";
import { baseUrls, evaluateWithImports, MOCKUP_TAG } from "./mockup.js";

export const GALLERY_TAG = "mockitdown-gallery";
/** The attributes the gallery observes: the base URL its mockups' imports resolve against. */
export const GALLERY_ATTRIBUTES: readonly string[] = ["import-base"];
/** How far outside the gallery's visible part a card gets its preview, in CSS pixels (C3). */
export const PREVIEW_MARGIN = 200;
const DESIGNER_TAG = "mockitdown-designer";

/** The heading of each role category's group (C1). */
export const CATEGORY_TITLES: Readonly<Record<RoleCategory, string>> = {
  frame: "Frames", bar: "Bars", layout: "Layouts", collection: "Collections", content: "Content",
  overlay: "Overlays", annotation: "Annotations",
};

/** One element of a pack's reference data (`shared/reference/<pack>.json`, R-PACK-013). */
export interface ReferenceElement {
  name: string;
  role: string;
  doc: string;
  /** Whether the pack defines it itself (else it is inherited). */
  own: boolean;
  /** Its sample code, or null when the data has none. */
  sample: string | null;
}

/** A pack's reference data: what the gallery reads of it. */
export interface ReferenceData {
  id: string;
  elements: ReferenceElement[];
}

/** One card of the gallery. */
export interface GalleryCard {
  /** The element or struct name. */
  name: string;
  /** The element's render role, or `component` for a struct. */
  role: string;
  doc: string;
  own: boolean;
  sample: string | null;
  /** The group it is listed in: a role category, or `components`. */
  group: RoleCategory | "components";
}

/** What the gallery shows for the active mockup and the selection. */
export interface GalleryState {
  /** The mockup and pack shown; null when the session has no active mockup. */
  mockup: string | null;
  pack: string | null;
  /** The element the cards may go into, null for the root of the mockup. */
  parent: string | null;
  /** Every card the selection allows, before the search. */
  cards: GalleryCard[];
  /** The elements the selection filters out, by reason (C7). */
  hidden: { reason: string; elements: string[] }[];
}

const references = new Map<string, Promise<ReferenceData>>();

/** The URL of a pack's reference data: `reference/<pack>.json` under the shared-assets base (C2). */
export function referenceUrl(pack: string, base: string | URL = defaultAssetsUrl()): string {
  let href = new URL(String(base), (globalThis as { location?: { href: string } }).location?.href).href;
  if (!href.endsWith("/")) href += "/";
  return new URL(`reference/${encodeURIComponent(pack)}.json`, href).href;
}

/** Fetch a pack's reference data once per URL; a failed fetch is forgotten so it can be retried. */
export function loadReference(pack: string, base?: string | URL): Promise<ReferenceData> {
  const url = referenceUrl(pack, base);
  let p = references.get(url);
  if (!p) {
    p = (async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`mockitdown: cannot load ${url} (HTTP ${res.status})`);
      const raw = (await res.json()) as { id?: unknown; elements?: unknown };
      const elements: ReferenceElement[] = [];
      for (const e of Array.isArray(raw.elements) ? raw.elements : []) {
        const r = e as Record<string, unknown>;
        if (typeof r.name !== "string") continue;
        elements.push({
          name: r.name,
          role: typeof r.role === "string" ? r.role : "unknown",
          doc: typeof r.doc === "string" ? r.doc : "",
          own: r.own === true,
          sample: typeof r.sample === "string" && r.sample ? r.sample : null,
        });
      }
      return { id: typeof raw.id === "string" ? raw.id : pack, elements };
    })();
    references.set(url, p);
    p.catch(() => references.delete(url));
  }
  return p;
}

/** The code Add inserts for an element or struct (C8). */
export function insertCode(name: string): string {
  return `${name}()`;
}

/** Whether a card matches the search text (C4): its name, role or doc line contains it, ignoring case. */
export function matchesFilter(card: Pick<GalleryCard, "name" | "role" | "doc" | "group">, text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return true;
  const fields = card.group === "components" ? [card.name] : [card.name, card.role, card.doc];
  return fields.some((f) => f.toLowerCase().includes(t));
}

/**
 * The gallery's state for a pack and a parent element (C1, C5-C7): the cards `parent` (null for the root)
 * may hold, grouped and ordered, and the refused elements by reason. `reference` gives the elements'
 * order, roles, doc lines and samples; `structs` the mockup's components.
 */
export function galleryState(pack: Pack, parent: string | null, reference: readonly ReferenceElement[], structs: readonly string[], mockup: string | null = null): GalleryState {
  const result = allowedChildren(pack, parent);
  const allowed = new Set(result.allowed);
  const listed = new Set(reference.map((e) => e.name));
  const ok = (name: string): boolean => (pack.elements.has(name) ? allowed.has(name) : canContain(pack, parent, name).ok);
  const cards: GalleryCard[] = [];
  for (const s of structs) {
    if (canContain(pack, parent, s).ok) cards.push({ name: s, role: "component", doc: "", own: true, sample: null, group: "components" });
  }
  for (const category of ROLE_CATEGORIES) {
    const of = reference.filter((e) => ok(e.name) && (roleRule(e.role)?.category ?? "content") === category);
    for (const e of [...of.filter((x) => x.own), ...of.filter((x) => !x.own)]) cards.push({ ...e, group: category });
  }
  const hidden = result.refused
    .map((g) => ({ reason: g.reason, elements: g.elements.filter((n) => listed.has(n)) }))
    .filter((g) => g.elements.length);
  return { mockup, pack: pack.id, parent, cards, hidden };
}

const GALLERY_CSS = `:host([hidden]){display:none}
:host{display:flex;flex-direction:column;min-height:0;font:13px/1.4 system-ui,sans-serif;color:var(--mkd-gallery-color,inherit);overflow:hidden}
.mkd-gallery__search{flex:none;margin:6px;padding:4px 8px;font:inherit;color:inherit;border:1px solid var(--mkd-gallery-border,#d0d0d7);border-radius:5px;background:var(--mkd-gallery-field-background,#fff)}
.mkd-gallery__list{flex:1 1 auto;min-height:0;overflow:auto;padding:0 6px 8px}
.mkd-gallery__group>h3{font-size:11px;letter-spacing:.04em;text-transform:uppercase;margin:10px 2px 4px;opacity:.7;font-weight:600}
.mkd-gallery__cards{display:flex;flex-direction:column;gap:6px}
.mkd-gallery__card{border:1px solid var(--mkd-gallery-border,#d0d0d7);border-radius:6px;background:var(--mkd-gallery-card-background,#fff);outline:none;cursor:grab;user-select:none;touch-action:none}
.mkd-gallery__card:focus-visible{box-shadow:0 0 0 2px var(--mkd-selection-color,#ff8a00)}
.mkd-gallery__head{display:flex;align-items:center;gap:6px;padding:3px 4px 3px 8px}
.mkd-gallery__name{flex:1 1 auto;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mkd-gallery__inherited{font-size:11px;opacity:.55}
.mkd-gallery__add{flex:none;font:inherit;font-size:12px;color:inherit;background:var(--mkd-gallery-add-background,#eceef2);border:0;border-radius:4px;padding:1px 8px;cursor:pointer}
.mkd-gallery__add:hover{background:var(--mkd-gallery-add-hover-background,#e2e4ea)}
.mkd-gallery__preview{height:72px;overflow:hidden;pointer-events:none;border-top:1px solid var(--mkd-gallery-border,#d0d0d7);background:var(--mkd-gallery-preview-background,#fafafb);border-radius:0 0 6px 6px}
.mkd-gallery__preview>mockitdown-mockup{display:block;width:200%;transform:scale(.5);transform-origin:0 0;padding:6px;box-sizing:border-box}
.mkd-gallery__hidden{margin:12px 2px 0;opacity:.85}
.mkd-gallery__hidden>summary{cursor:pointer;font-size:12px}
.mkd-gallery__reason>p{margin:6px 0 2px;font-size:12px}
.mkd-gallery__reason>ul{margin:0;padding-left:18px;font-size:12px;opacity:.8}
.mkd-gallery__empty{padding:6px 8px;opacity:.6}`;

const Base: typeof HTMLElement = (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) as typeof HTMLElement;

export class GalleryElement extends Base {
  static get observedAttributes(): string[] {
    return [...GALLERY_ATTRIBUTES];
  }

  #root: ShadowRoot;
  #session: DesignSession | null = null;
  #given: DesignSession | null = null;
  #own: DesignSession | null = null;
  #unsubscribe: (() => void) | null = null;
  #search: HTMLInputElement;
  #list: HTMLElement;
  #filter = "";
  #state: GalleryState = { mockup: null, pack: null, parent: null, cards: [], hidden: [] };
  /** Created previews by `<pack>\n<name>`, kept across redraws. */
  #previews = new Map<string, HTMLElement>();
  #observer: IntersectionObserver | null = null;
  /** The name of the card holding the roving tab stop. */
  #current: string | null = null;
  #generation = 0;
  #dirty = true;
  #queued = false;
  #running = false;
  #renderedOnce = false;
  #waiters: (() => void)[] = [];

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#root.innerHTML = `<style>${GALLERY_CSS}</style>`
      + `<input type="search" class="mkd-gallery__search" part="search" aria-label="Search elements" placeholder="Search elements">`
      + `<div class="mkd-gallery__list" part="list"></div>`;
    this.#search = this.#root.querySelector("input")!;
    this.#list = this.#root.querySelector(".mkd-gallery__list")!;
    this.#search.addEventListener("input", () => {
      this.filter = this.#search.value;
    });
    this.#list.addEventListener("click", (e) => {
      const add = (e.target as Element).closest?.(".mkd-gallery__add");
      const card = this.#cardAt(e);
      if (card) this.#focusCard(card, false);
      if (add && card) this.#addFrom(card);
    });
    this.#list.addEventListener("dblclick", (e) => {
      const card = this.#cardAt(e);
      if (card && !(e.target as Element).closest?.(".mkd-gallery__add")) this.#addFrom(card);
    });
    this.#list.addEventListener("keydown", (e) => this.#onKey(e));
    this.#list.addEventListener("pointerdown", (e) => {
      const card = this.#cardAt(e);
      const name = card?.dataset.name;
      if (!card || !name || (e.target as Element).closest?.(".mkd-gallery__add")) return;
      // R-TOOL-005.C1: the card drags its element; the drop inserts `<Name>()` (as Add does).
      armDrag(e, () => ({ session: this.session, source: { kind: "element", name, code: insertCode(name) }, label: name }));
    });
  }

  // --- properties ---------------------------------------------------------------------------------

  /** The design session the gallery inserts into (R-EDIT-006.C11); setting it makes the host's session the gallery's. */
  get session(): DesignSession {
    return this.#attach();
  }

  set session(value: DesignSession | null) {
    this.#given = value instanceof DesignSession ? value : null;
    this.#attach();
  }

  /** The search text (C4), mirrored by the search field. */
  get filter(): string {
    return this.#filter;
  }

  set filter(value: string) {
    const v = value === null || value === undefined ? "" : String(value);
    if (this.#search.value !== v) this.#search.value = v;
    if (v === this.#filter) return;
    this.#filter = v;
    this.#draw();
  }

  /** What the gallery shows for the active mockup and the selection, before the search. */
  get state(): GalleryState {
    return { ...this.#state, cards: [...this.#state.cards], hidden: this.#state.hidden.map((g) => ({ ...g, elements: [...g.elements] })) };
  }

  /** A promise that resolves after the next rebuild, or at once when up to date; it never rejects. */
  get rendered(): Promise<void> {
    if (this.#renderedOnce && !this.#dirty && !this.#running && !this.#queued) return Promise.resolve();
    return new Promise((resolve) => this.#waiters.push(resolve));
  }

  /**
   * Insert an element or struct of the gallery as Add does (C8): `<name>()` as the last child of the
   * first selected node, else at the end of the active mockup's top level, then selected.
   */
  add(name: string): EditResult | EditRefusal {
    return this.session.insert(insertCode(name));
  }

  // --- lifecycle ----------------------------------------------------------------------------------

  connectedCallback(): void {
    this.#attach();
    this.#schedule();
  }

  disconnectedCallback(): void {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  attributeChangedCallback(_name: string, old: string | null, value: string | null): void {
    if (old !== value) this.#schedule();
  }

  // --- the session --------------------------------------------------------------------------------

  #attach(): DesignSession {
    const next = this.#designerSession() ?? this.#given ?? (this.#own ??= new DesignSession(newDesign(GALLERY_TAG)));
    if (next !== this.#session) {
      this.#unsubscribe?.();
      this.#session = next;
      this.#unsubscribe = next.subscribe((n) => this.#notified(n));
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

  #notified(n: DesignNotification): void {
    const session = this.#session;
    switch (n.kind) {
      case "change":
        if (n.detail.kind !== "move" && (n.detail.mockup === session?.active || n.detail.kind === "mockups")) this.#schedule();
        break;
      case "active":
      case "select":
      case "rename":
        this.#schedule();
        break;
    }
    if (this.#session === this.#own && n.kind in DESIGN_EVENTS) {
      const type = DESIGN_EVENTS[n.kind as keyof typeof DESIGN_EVENTS];
      this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: n.detail }));
    }
  }

  // --- building -----------------------------------------------------------------------------------

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
        await this.#build(this.#generation);
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

  /** Evaluate the active mockup (its pack and structs), fetch the pack's reference data and redraw. */
  async #build(generation: number): Promise<void> {
    const stale = (): boolean => generation !== this.#generation;
    const session = this.session;
    const name = session.active;
    let state: GalleryState = { mockup: null, pack: null, parent: null, cards: [], hidden: [] };
    try {
      if (name !== null && session.mockup(name)) {
        if (!assetsLoaded()) await loadAssetsFromUrl();
        if (stale()) return;
        const options = { ...(mockupOptions(session.document, name) ?? {}), edit: true };
        const evaluation = await evaluateWithImports(session.code(name) ?? "", options, baseUrls(this).importBase, stale);
        if (evaluation === null || stale()) return;
        const packId = evaluation.screen?.pack.id ?? mockupPack(session.document, name) ?? "base";
        const pack = registry.get(packId);
        let reference: ReferenceElement[];
        try {
          reference = (await loadReference(packId)).elements;
        } catch {
          reference = [...pack.elements.values()].map((el) => ({ name: el.name, role: el.role, doc: "", own: false, sample: null }));
        }
        if (stale()) return;
        const tree = session.tree(name);
        const first = session.selection.length && tree ? tree.byId(session.selection[0]!) : null;
        const structs = evaluation.structs.length ? evaluation.structs : (tree?.module.structs.map((s) => s.name) ?? []);
        state = galleryState(pack, first ? first.name : null, reference, structs, name);
      }
    } catch {
      // A mockup that cannot be evaluated keeps the last cards.
      if (stale()) return;
      state = this.#state;
    }
    if (stale()) return;
    this.#state = state;
    this.#renderedOnce = true;
    this.#draw();
  }

  // --- drawing ------------------------------------------------------------------------------------

  #draw(): void {
    const doc = this.#list.ownerDocument;
    const state = this.#state;
    this.#observer?.disconnect();
    this.#observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver((entries, obs) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        obs.unobserve(e.target);
        this.#materialise(e.target as HTMLElement);
      }
    }, { root: this.#list, rootMargin: `${PREVIEW_MARGIN}px 0px` });
    const out: Node[] = [];
    if (state.mockup === null) {
      const empty = doc.createElement("div");
      empty.className = "mkd-gallery__empty";
      empty.textContent = "No mockup";
      this.#list.replaceChildren(empty);
      return;
    }
    const shown = state.cards.filter((c) => matchesFilter(c, this.#filter));
    if (this.#current !== null && !shown.some((c) => c.name === this.#current)) this.#current = null;
    const groups: (RoleCategory | "components")[] = ["components", ...ROLE_CATEGORIES];
    for (const g of groups) {
      const cards = shown.filter((c) => c.group === g);
      if (!cards.length) continue;
      const section = doc.createElement("section");
      section.className = "mkd-gallery__group";
      section.setAttribute("part", "group");
      section.dataset.category = g;
      const h = doc.createElement("h3");
      h.id = `group-${g}`;
      h.textContent = g === "components" ? "Components" : CATEGORY_TITLES[g];
      const list = doc.createElement("div");
      list.className = "mkd-gallery__cards";
      list.setAttribute("role", "list");
      list.setAttribute("aria-labelledby", h.id);
      for (const c of cards) list.append(this.#card(c, state.pack!));
      section.append(h, list);
      out.push(section);
    }
    if (!shown.length) {
      const empty = doc.createElement("div");
      empty.className = "mkd-gallery__empty";
      empty.textContent = this.#filter.trim() ? "No element matches the search" : "Nothing can be placed here";
      out.push(empty);
    }
    const count = state.hidden.reduce((n, g) => n + g.elements.length, 0);
    if (count) {
      const details = doc.createElement("details");
      details.className = "mkd-gallery__hidden";
      details.setAttribute("part", "hidden");
      details.dataset.count = String(count);
      const summary = doc.createElement("summary");
      summary.textContent = `Hidden here (${count})`;
      details.append(summary);
      for (const g of state.hidden) {
        const section = doc.createElement("section");
        section.className = "mkd-gallery__reason";
        section.setAttribute("part", "reason");
        section.dataset.reason = g.reason;
        const p = doc.createElement("p");
        p.textContent = g.reason;
        const ul = doc.createElement("ul");
        for (const name of g.elements) {
          const li = doc.createElement("li");
          li.dataset.element = name;
          li.textContent = name;
          ul.append(li);
        }
        section.append(p, ul);
        details.append(section);
      }
      out.push(details);
    }
    this.#list.replaceChildren(...out);
    const cards = this.#cards();
    const current = cards.find((c) => c.dataset.name === this.#current) ?? cards[0];
    if (current) current.tabIndex = 0;
  }

  #card(c: GalleryCard, pack: string): HTMLElement {
    const doc = this.#list.ownerDocument;
    const el = doc.createElement("div");
    el.className = "mkd-gallery__card";
    el.setAttribute("part", "card");
    el.setAttribute("role", "listitem");
    el.setAttribute("aria-label", c.name);
    el.tabIndex = -1;
    el.dataset.name = c.name;
    if (c.group === "components") el.dataset.component = c.name;
    else {
      el.dataset.element = c.name;
      el.dataset.role = c.role;
      if (c.doc) el.dataset.doc = c.doc;
      el.dataset.own = String(c.own);
    }
    if (c.doc) el.title = c.doc;
    const head = doc.createElement("div");
    head.className = "mkd-gallery__head";
    const name = doc.createElement("span");
    name.className = "mkd-gallery__name";
    name.setAttribute("part", "name");
    name.textContent = c.name;
    head.append(name);
    if (c.group !== "components" && !c.own) {
      const inh = doc.createElement("span");
      inh.className = "mkd-gallery__inherited";
      inh.textContent = "core";
      head.append(inh);
    }
    const add = doc.createElement("button");
    add.type = "button";
    add.className = "mkd-gallery__add";
    add.setAttribute("part", "add");
    add.setAttribute("aria-label", `Add ${c.name}`);
    add.tabIndex = -1;
    add.textContent = "Add";
    head.append(add);
    el.append(head);
    if (c.sample !== null) {
      const preview = doc.createElement("div");
      preview.className = "mkd-gallery__preview";
      preview.setAttribute("part", "preview");
      preview.setAttribute("aria-hidden", "true");
      preview.dataset.key = `${pack}\n${c.name}`;
      preview.dataset.pack = pack;
      preview.dataset.sample = c.sample;
      const kept = this.#previews.get(preview.dataset.key);
      if (kept) preview.append(kept);
      else this.#observer?.observe(preview);
      el.append(preview);
    }
    return el;
  }

  /** Create a card's preview (C3): a `mockitdown-mockup` of the sample, `device="fit"`, in the pack. */
  #materialise(preview: HTMLElement): void {
    const key = preview.dataset.key ?? "";
    let mockup = this.#previews.get(key);
    if (!mockup) {
      mockup = preview.ownerDocument.createElement(MOCKUP_TAG);
      mockup.setAttribute("device", "fit");
      mockup.setAttribute("pack", preview.dataset.pack ?? "base");
      (mockup as HTMLElement & { code: string }).code = preview.dataset.sample ?? "";
      this.#previews.set(key, mockup);
    }
    if (mockup.parentNode !== preview) preview.replaceChildren(mockup);
  }

  // --- pointer and keys ---------------------------------------------------------------------------

  #cards(): HTMLElement[] {
    return Array.from(this.#list.querySelectorAll<HTMLElement>(".mkd-gallery__card"));
  }

  #cardAt(e: Event): HTMLElement | null {
    return e.composedPath().find((t): t is HTMLElement => t instanceof HTMLElement && t.classList.contains("mkd-gallery__card")) ?? null;
  }

  #focusCard(card: HTMLElement, focus = true): void {
    for (const c of this.#cards()) c.tabIndex = c === card ? 0 : -1;
    this.#current = card.dataset.name ?? null;
    if (focus) card.focus();
  }

  #addFrom(card: HTMLElement): void {
    const name = card.dataset.name;
    if (name) this.add(name);
  }

  #onKey(e: KeyboardEvent): void {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const card = this.#cardAt(e);
    if (!card) return;
    if (e.key === "Enter" && e.target === card) {
      e.preventDefault();
      this.#addFrom(card);
      return;
    }
    const cards = this.#cards();
    const i = cards.indexOf(card);
    const to = e.key === "ArrowDown" ? cards[i + 1] : e.key === "ArrowUp" ? cards[i - 1]
      : e.key === "Home" ? cards[0] : e.key === "End" ? cards[cards.length - 1] : undefined;
    if (to) {
      e.preventDefault();
      this.#focusCard(to);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mockitdown-gallery": GalleryElement;
  }
}
