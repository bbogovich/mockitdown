/**
 * `<mockitdown-outline>`: the element tree of a design session's active mockup (R-TOOL-002, A-WEB-5).
 *
 *   <mockitdown-outline></mockitdown-outline>
 *   <script type="module">outline.session = editor.session;</script>
 *
 * The rows follow the views of the mockup's edit-mode evaluation (R-EDIT-004): one row per view a view
 * node produced (`View.node`) or that was derived from one (`View.derived`), nested as the views are;
 * views no view node produced are skipped and their children take their place. A row shows the element
 * name, its main label (the first positional argument, when its value is a string) and an `#id` chip
 * for `.id(…)`, indented 14 CSS pixels per level. A derived row (a `ForEach` item, an `if` branch, a
 * struct's views) is italic with a link icon and stands for the node that produced it, as a click on
 * its element in the editor does (R-TOOL-001.C5).
 *
 * The tree is an ARIA tree (`role="tree"`, rows `role="treeitem"` with `aria-level`, `aria-expanded`
 * and `aria-selected`) that keeps the focus on itself and points at the current row with
 * `aria-activedescendant`. Selection follows the current row: a click, Up and Down, Home and End, Left
 * (collapse, else the parent row), Right (expand, else the first child) and typed characters (the next
 * row whose name starts with them) select its node in the session; Shift-click selects the siblings
 * from the selection's first node to the clicked one, Cmd/Ctrl-click adds or removes the clicked one
 * (R-EDIT-008.C8, `session.selectRange`, `session.toggleSelected`); the disclosure triangle expands and
 * collapses. Top-level rows start expanded, deeper ones collapsed; a selection made anywhere expands the
 * selected rows' ancestors and scrolls the first into view (`expandTo`). Hovering a row sets the
 * session's hovered node; the rows of the node hovered elsewhere are highlighted.
 *
 * Two tabs: Elements (the tree) and Mockups (the document's mockups by name, the active one marked with
 * `aria-current`). The session is joined as the editor joins one (R-EDIT-006.C11): the nearest
 * `mockitdown-designer`'s, else the host's `session` property, else one of its own over an empty
 * document, whose notifications it dispatches as DOM events (R-EDIT-006.C7, C8). The outline holds no
 * editing rule (A-WEB-5.K2).
 *
 * While the mockup's code does not parse (R-TOOL-009.C3), the rows stay those of its last valid version
 * (`session.validCode`), the tree carries `data-readonly` and dimmed rows, and the note of part
 * `readonly` says so; the session refuses every edit meanwhile.
 *
 * Drag and drop (R-TOOL-005, `./drag.ts`): a row of a view that is not derived drags its node (the
 * selection, when the row is one of several selected rows); over a row the outline shows where a
 * drop goes — before the row, inside it or after it, by the upper, middle or lower third of the row —
 * and marks a position the session refuses (`checkDrop`), whose reason the drag shows by the pointer.
 * Below the last row a drop goes to the end of the mockup's top level. A drop calls `session.drop`.
 */

import { assetsLoaded, ViewList, type Pack, type View } from "../core/index.js";
import type { ViewNode } from "../core/syntax/tree.js";
import { mockupOptions, newDesign } from "../design/document.js";
import { DESIGN_EVENTS, DesignSession, type DesignNotification, type DropPosition, type DropZone } from "../design/session.js";
import { READ_ONLY_NOTE } from "../design/code-sync.js";
import { loadAssetsFromUrl } from "./assets.js";
import { armDrag, registerDropTarget, type Drag, type DropAnswer } from "./drag.js";
import { baseUrls, evaluateWithImports } from "./mockup.js";

export const OUTLINE_TAG = "mockitdown-outline";
/** The attributes the outline observes: the base URL its mockups' imports resolve against. */
export const OUTLINE_ATTRIBUTES: readonly string[] = ["import-base"];
/** The indent of one level of the tree, in CSS pixels (C3). */
export const OUTLINE_INDENT = 14;
const DESIGNER_TAG = "mockitdown-designer";
/** Typed characters within this many milliseconds of each other form one search (C5). */
const TYPEAHEAD_MS = 600;

/** One row of the tree: a view a view node produced or derived. */
export interface OutlineRow {
  /** Stable across rebuilds while the nodes keep their ids: keeps the row's expansion. */
  readonly key: string;
  /** 1 for a top-level row. */
  readonly level: number;
  /** The element name (`View.name`). */
  readonly name: string;
  /** The main label: the first positional argument when its value is a string, else "". */
  readonly label: string;
  /** The `.id(…)` value, else "". */
  readonly id: string;
  /** Whether the view was derived from a `ForEach`, an `if` or a struct call (R-EDIT-004.C5). */
  readonly derived: boolean;
  /** The node the row selects: the one that derived it, else its own; null when the tree has none. */
  readonly node: string | null;
  readonly parent: OutlineRow | null;
  readonly children: OutlineRow[];
}

/** The drop position an outline shows during a drag: its row (null: the end of the top level), zone and answer. */
interface DropMark {
  key: string | null;
  zone: DropZone | "end";
  position: DropPosition | null;
  allowed: boolean;
}

const LINK_SVG = '<svg class="mkd-outline__link" part="link" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">'
  + '<path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" '
  + 'd="M6.5 9.5l3-3M7 4.5l1.2-1.2a2.6 2.6 0 0 1 3.7 3.7L10.7 8.2M9 11.5l-1.2 1.2a2.6 2.6 0 0 1-3.7-3.7L5.3 7.8"/></svg>';

const OUTLINE_CSS = `:host([hidden]){display:none}
:host{display:flex;flex-direction:column;min-height:0;font:13px/1.4 system-ui,sans-serif;color:var(--mkd-outline-color,inherit);overflow:hidden}
.mkd-outline__tabs{display:flex;gap:2px;padding:4px 6px 0;border-bottom:1px solid var(--mkd-outline-border,#d0d0d7);flex:none}
.mkd-outline__tab{font:inherit;border:0;background:none;color:inherit;padding:4px 8px;border-bottom:2px solid transparent;cursor:pointer;opacity:.7}
.mkd-outline__tab[aria-selected="true"]{opacity:1;border-bottom-color:var(--mkd-selection-color,#ff8a00)}
.mkd-outline__panel{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
.mkd-outline__panel[hidden]{display:none}
.mkd-outline__tree{flex:1 1 auto;min-height:0;overflow:auto;padding:4px;outline:none}
.mkd-outline__tree[data-readonly] .mkd-outline__row{opacity:.55}
.mkd-outline__readonly{margin:4px 8px 0;font-size:12px;color:var(--mkd-readonly-color,#9a5b00)}
.mkd-outline__readonly[hidden]{display:none}
.mkd-outline__tree:focus-visible{box-shadow:inset 0 0 0 2px var(--mkd-selection-color,#ff8a00)}
.mkd-outline__row{display:flex;align-items:center;gap:4px;white-space:nowrap;padding:1px 6px 1px 0;border-radius:5px;cursor:default;user-select:none}
.mkd-outline__row--hover{background:var(--mkd-outline-hover-background,rgba(47,128,237,.12))}
.mkd-outline__row[aria-selected="true"]{background:var(--mkd-outline-selected-background,rgba(255,138,0,.22))}
.mkd-outline__tree:focus .mkd-outline__row--current{box-shadow:inset 0 0 0 1px var(--mkd-selection-color,#ff8a00)}
.mkd-outline__twisty{flex:none;width:12px;text-align:center;font-size:8px;opacity:.6;cursor:pointer}
.mkd-outline__twisty--open::before{content:"\\25BC"}
.mkd-outline__twisty--closed::before{content:"\\25B6"}
.mkd-outline__link{flex:none;opacity:.7}
.mkd-outline__name{font-weight:500}
.mkd-outline__row--derived .mkd-outline__name,.mkd-outline__row--derived .mkd-outline__label{font-style:italic}
.mkd-outline__label{opacity:.75;overflow:hidden;text-overflow:ellipsis}
.mkd-outline__label::before{content:"\\201C"}
.mkd-outline__label::after{content:"\\201D"}
.mkd-outline__chip{flex:none;font:11px/16px ui-monospace,monospace;padding:0 4px;border-radius:3px;background:var(--mkd-outline-chip-background,#eceef2)}
.mkd-outline__row--drop-before{box-shadow:inset 0 2px 0 var(--mkd-drop-color,#2f80ed)}
.mkd-outline__row--drop-after{box-shadow:inset 0 -2px 0 var(--mkd-drop-color,#2f80ed)}
.mkd-outline__row--drop-inside{box-shadow:inset 0 0 0 2px var(--mkd-drop-color,#2f80ed)}
.mkd-outline__row--drop-refused{--mkd-drop-color:var(--mkd-drop-refused-color,#d93025)}
.mkd-outline__tree--drop-end{box-shadow:inset 0 -2px 0 var(--mkd-drop-color,#2f80ed)}
.mkd-outline__tree--drop-end.mkd-outline__tree--drop-refused{--mkd-drop-color:var(--mkd-drop-refused-color,#d93025)}
.mkd-outline__mockups{list-style:none;margin:0;padding:4px;overflow:auto}
.mkd-outline__mockup{padding:2px 8px;border-radius:5px}
.mkd-outline__mockup[aria-current="true"]{font-weight:600;background:var(--mkd-outline-selected-background,rgba(255,138,0,.22))}
.mkd-outline__empty{padding:6px 8px;opacity:.6}`;

const Base: typeof HTMLElement = (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) as typeof HTMLElement;

/** The views directly inside a view, in the order `walk` visits them: content, slots, modifier content, view-list attributes. */
function childViews(v: View): View[] {
  const out: View[] = [...v.children];
  for (const s of v.slots.values()) out.push(...s);
  for (const m of v.modifiers) {
    if (m.content) out.push(...m.content);
    for (const s of m.slots.values()) out.push(...s);
  }
  for (const a of v.attrs.values()) if (a instanceof ViewList) out.push(...a.views);
  return out;
}

/** The main label of a view (C3): its first argument when that is positional and its value a string. */
function mainLabel(v: View, node: ViewNode | null, pack: Pack): string {
  if (!node || node.kind !== "call" || node.syntax.kind !== "Call") return "";
  const first = node.syntax.args[0];
  if (!first || first.label !== null) return "";
  let value: unknown;
  const el = v.element;
  if (el && el.params.length) {
    const param = el.params[0]!;
    value = v.attrs.get(el.attrFor(param) ?? (pack.attrs.get(param, param) as string));
  } else {
    value = v.extra_args[0];
  }
  return typeof value === "string" ? value : "";
}

/** The `.id(…)` of a view, else "". */
function viewId(v: View): string {
  const value = v.mod("id")?.arg();
  return typeof value === "string" ? value : value === null || value === undefined ? "" : String(value);
}

export class OutlineElement extends Base {
  static get observedAttributes(): string[] {
    return [...OUTLINE_ATTRIBUTES];
  }

  #root: ShadowRoot;
  #session: DesignSession | null = null;
  #given: DesignSession | null = null;
  #own: DesignSession | null = null;
  #unsubscribe: (() => void) | null = null;
  #tree: HTMLElement | null = null;
  #mockupsPanel: HTMLElement | null = null;
  #treePanel: HTMLElement | null = null;
  #tabs: HTMLElement[] = [];
  #tab: "elements" | "mockups" = "elements";
  /** The rows of the shown mockup, top level first, and every row in document order. */
  #roots: OutlineRow[] = [];
  #all: OutlineRow[] = [];
  /** The mockup the rows belong to. */
  #rowsOf: string | null = null;
  /** Expansion by row key; a row not in it is expanded at level 1 only. */
  #expanded = new Map<string, boolean>();
  /** The key of the current (focused) row. */
  #current: string | null = null;
  /** The node whose rows to scroll into view after the next draw. */
  #reveal: string | null = null;
  /** The pack of the active mockup's evaluation, whose role rules a drop is checked by. */
  #pack = "";
  /** The drop position shown during a drag: the row (null: the end of the top level), the zone, the session's answer. */
  #drop: DropMark | null = null;
  #typed = "";
  #typedAt = 0;
  #generation = 0;
  #dirty = true;
  #queued = false;
  #running = false;
  #renderedOnce = false;
  #waiters: (() => void)[] = [];

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#root.innerHTML = `<style>${OUTLINE_CSS}</style><div class="mkd-outline__tabs" role="tablist" part="tabs">`
      + `<button type="button" class="mkd-outline__tab" role="tab" part="tab" id="tab-elements" aria-controls="panel-elements" data-tab="elements">Elements</button>`
      + `<button type="button" class="mkd-outline__tab" role="tab" part="tab" id="tab-mockups" aria-controls="panel-mockups" data-tab="mockups">Mockups</button></div>`
      + `<div class="mkd-outline__panel" role="tabpanel" id="panel-elements" aria-labelledby="tab-elements" part="elements">`
      + `<p class="mkd-outline__readonly" part="readonly" role="status" hidden>${READ_ONLY_NOTE}</p>`
      + `<div class="mkd-outline__tree" role="tree" part="tree" aria-label="Elements" tabindex="0"></div></div>`
      + `<div class="mkd-outline__panel" role="tabpanel" id="panel-mockups" aria-labelledby="tab-mockups" part="mockups" hidden>`
      + `<ul class="mkd-outline__mockups" role="list"></ul></div>`;
    this.#tree = this.#root.querySelector(".mkd-outline__tree");
    this.#treePanel = this.#root.querySelector("#panel-elements");
    this.#mockupsPanel = this.#root.querySelector("#panel-mockups");
    this.#tabs = Array.from(this.#root.querySelectorAll<HTMLElement>(".mkd-outline__tab"));
    for (const tab of this.#tabs) {
      tab.addEventListener("click", () => this.#showTab(tab.dataset.tab as "elements" | "mockups"));
      tab.addEventListener("keydown", (e) => this.#onTabKey(e));
    }
    this.#tree?.addEventListener("click", (e) => this.#onClick(e));
    this.#tree?.addEventListener("keydown", (e) => this.#onKey(e));
    this.#tree?.addEventListener("pointerover", (e) => this.#onPointer(e));
    this.#tree?.addEventListener("pointerleave", () => this.#setHover(null));
    this.#tree?.addEventListener("pointerdown", (e) => this.#onPointerDown(e));
    registerDropTarget(this, {
      over: (drag, x, y) => this.#dragOver(drag, x, y),
      leave: () => this.#showDrop(null),
      drop: (drag) => this.#dragDrop(drag),
    });
    this.#showTab("elements");
  }

  // --- properties ---------------------------------------------------------------------------------

  /** The design session the outline shows (R-EDIT-006.C11); setting it makes the host's session the outline's. */
  get session(): DesignSession {
    return this.#attach();
  }

  set session(value: DesignSession | null) {
    this.#given = value instanceof DesignSession ? value : null;
    this.#attach();
  }

  /** The rows of the active mockup's tree, in document order (visible or not). */
  get rows(): readonly OutlineRow[] {
    return [...this.#all];
  }

  /** A promise that resolves after the next rebuild of the rows, or at once when up to date; it never rejects. */
  get rendered(): Promise<void> {
    if (this.#renderedOnce && !this.#dirty && !this.#running && !this.#queued) return Promise.resolve();
    return new Promise((resolve) => this.#waiters.push(resolve));
  }

  /**
   * Expand the ancestors of the rows of a node of the active mockup and scroll the first into view
   * (C6). Rows not built yet are revealed once they are.
   */
  expandTo(nodeId: string): void {
    const rows = this.#all.filter((r) => r.node === nodeId);
    for (const r of rows) for (let p = r.parent; p; p = p.parent) this.#expanded.set(p.key, true);
    this.#reveal = nodeId;
    this.#draw();
  }

  // --- lifecycle ----------------------------------------------------------------------------------

  connectedCallback(): void {
    this.#attach();
    this.#schedule();
  }

  attributeChangedCallback(_name: string, old: string | null, value: string | null): void {
    if (old !== value) this.#schedule();
  }

  // --- the session --------------------------------------------------------------------------------

  #attach(): DesignSession {
    const next = this.#designerSession() ?? this.#given ?? (this.#own ??= new DesignSession(newDesign(OUTLINE_TAG)));
    if (next !== this.#session) {
      this.#unsubscribe?.();
      this.#session = next;
      this.#unsubscribe = next.subscribe((n) => this.#notified(n));
      this.#current = null;
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
        if (n.detail.kind === "mockups") this.#drawMockups();
        if (n.detail.mockup === session?.active && n.detail.kind !== "move") this.#schedule();
        break;
      case "active":
        this.#current = null;
        this.#schedule();
        this.#drawMockups();
        break;
      case "rename":
        this.#drawMockups();
        break;
      case "select": {
        if (n.detail.mockup === session?.active) {
          const cur = this.#currentRow();
          if (!cur || cur.node === null || !n.detail.nodes.includes(cur.node)) {
            const first = n.detail.nodes.length ? this.#all.find((r) => r.node === n.detail.nodes[0]) : undefined;
            this.#current = first?.key ?? this.#current;
          }
          for (const id of n.detail.nodes) this.expandTo(id);
          if (!n.detail.nodes.length) this.#draw();
        }
        break;
      }
      case "hover":
        this.#draw();
        break;
    }
    if (this.#session === this.#own && n.kind in DESIGN_EVENTS) {
      const type = DESIGN_EVENTS[n.kind as keyof typeof DESIGN_EVENTS];
      this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: n.detail }));
    }
  }

  // --- building the rows --------------------------------------------------------------------------

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

  /** Evaluate the active mockup in edit mode and make its rows; the last rows stay when it does not evaluate. */
  async #build(generation: number): Promise<void> {
    const stale = (): boolean => generation !== this.#generation;
    const session = this.session;
    const name = session.active;
    let roots: OutlineRow[] | null = null;
    try {
      if (name !== null && session.mockup(name)) {
        if (!assetsLoaded()) await loadAssetsFromUrl();
        if (stale()) return;
        const options = { ...(mockupOptions(session.document, name) ?? {}), edit: true };
        // The last valid version while the code does not parse (R-TOOL-009.C3).
        const result = await evaluateWithImports(session.validCode(name) ?? "", options, baseUrls(this).importBase, stale);
        if (result === null) return;
        if (result.screen) {
          roots = this.#rowsFrom(session, name, result.screen.views, result.screen.pack);
          this.#pack = result.screen.pack.id;
        }
      } else {
        roots = [];
      }
    } catch {
      // A mockup that does not evaluate keeps its last rows, as the session keeps its last valid tree.
    }
    if (stale()) return;
    if (roots === null) roots = name === this.#rowsOf ? this.#roots : [];
    this.#roots = roots;
    this.#rowsOf = name;
    this.#all = [];
    const flat = (rows: OutlineRow[]): void => {
      for (const r of rows) {
        this.#all.push(r);
        flat(r.children);
      }
    };
    flat(roots);
    this.#renderedOnce = true;
    for (const id of session.selection) this.expandTo(id);
    this.#draw();
    this.#drawMockups();
  }

  #rowsFrom(session: DesignSession, mockup: string, views: readonly View[], pack: Pack): OutlineRow[] {
    const tree = session.tree(mockup);
    const seen = new Map<string, number>();
    const roots: OutlineRow[] = [];
    const visit = (list: readonly View[], level: number, parent: OutlineRow | null): void => {
      for (const v of list) {
        if (!v.node && !v.derived) {
          visit(childViews(v), level, parent);
          continue;
        }
        const own = v.node ? session.nodeFor(mockup, v.node) : null;
        const by = v.derived ? session.nodeFor(mockup, v.derived) : null;
        const base = `${own ?? "-"}/${by ?? "-"}`;
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        const row: OutlineRow = {
          key: `${base}#${count}`,
          level,
          name: v.name,
          label: mainLabel(v, own !== null && tree ? tree.byId(own) : null, pack),
          id: viewId(v),
          derived: !!v.derived,
          node: by ?? own,
          parent,
          children: [],
        };
        (parent ? parent.children : roots).push(row);
        visit(childViews(v), level + 1, row);
      }
    };
    visit(views, 1, null);
    return roots;
  }

  // --- drawing ------------------------------------------------------------------------------------

  #isExpanded(row: OutlineRow): boolean {
    return this.#expanded.get(row.key) ?? row.level === 1;
  }

  /** The rows whose ancestors are all expanded, in document order. */
  #visible(): OutlineRow[] {
    const out: OutlineRow[] = [];
    const add = (rows: readonly OutlineRow[]): void => {
      for (const r of rows) {
        out.push(r);
        if (r.children.length && this.#isExpanded(r)) add(r.children);
      }
    };
    add(this.#roots);
    return out;
  }

  #currentRow(): OutlineRow | undefined {
    return this.#current === null ? undefined : this.#all.find((r) => r.key === this.#current);
  }

  #draw(): void {
    const tree = this.#tree;
    const session = this.#session;
    if (!tree || !session) return;
    const name = session.active;
    const shown = name !== null && name === this.#rowsOf;
    const selection = shown ? session.selection : [];
    const hovered = shown ? session.hovered : null;
    const visible = shown ? this.#visible() : [];
    if (this.#current !== null && !visible.some((r) => r.key === this.#current)) {
      // The current row was collapsed away: its nearest visible ancestor becomes current.
      let r = this.#currentRow()?.parent ?? null;
      while (r && !visible.includes(r)) r = r.parent;
      this.#current = r?.key ?? null;
    }
    const doc = tree.ownerDocument;
    const items: HTMLElement[] = visible.map((row, i) => {
      const el = doc.createElement("div");
      el.id = `row-${i}`;
      el.className = "mkd-outline__row";
      el.setAttribute("part", "row");
      el.setAttribute("role", "treeitem");
      el.setAttribute("aria-level", String(row.level));
      el.setAttribute("aria-selected", String(row.node !== null && selection.includes(row.node)));
      if (row.children.length) el.setAttribute("aria-expanded", String(this.#isExpanded(row)));
      if (row.derived) el.classList.add("mkd-outline__row--derived");
      if (hovered !== null && row.node === hovered) el.classList.add("mkd-outline__row--hover");
      if (row.key === this.#current) el.classList.add("mkd-outline__row--current");
      el.dataset.key = row.key;
      el.style.paddingInlineStart = `${(row.level - 1) * OUTLINE_INDENT}px`;
      const twisty = doc.createElement("span");
      twisty.className = `mkd-outline__twisty${row.children.length ? this.#isExpanded(row) ? " mkd-outline__twisty--open" : " mkd-outline__twisty--closed" : ""}`;
      twisty.setAttribute("part", "twisty");
      twisty.setAttribute("aria-hidden", "true");
      el.append(twisty);
      if (row.derived) el.insertAdjacentHTML("beforeend", LINK_SVG);
      const nameEl = doc.createElement("span");
      nameEl.className = "mkd-outline__name";
      nameEl.setAttribute("part", "name");
      nameEl.textContent = row.name;
      el.append(nameEl);
      if (row.label) {
        const label = doc.createElement("span");
        label.className = "mkd-outline__label";
        label.setAttribute("part", "label");
        label.textContent = row.label;
        el.append(label);
      }
      if (row.id) {
        const chip = doc.createElement("span");
        chip.className = "mkd-outline__chip";
        chip.setAttribute("part", "chip");
        chip.textContent = `#${row.id}`;
        el.append(chip);
      }
      return el;
    });
    // R-TOOL-009.C3: the last valid tree, read-only, while the code does not parse.
    const readOnly = name !== null && !!session.mockup(name) && !session.parses(name);
    const note = this.#root.querySelector<HTMLElement>(".mkd-outline__readonly");
    if (note) note.hidden = !readOnly;
    if (readOnly) tree.setAttribute("data-readonly", "");
    else tree.removeAttribute("data-readonly");
    if (items.length) tree.replaceChildren(...items);
    else {
      const empty = doc.createElement("div");
      empty.className = "mkd-outline__empty";
      empty.textContent = name === null ? "No mockup" : "No elements";
      tree.replaceChildren(empty);
    }
    this.#markDrop();
    const current = items.find((el) => el.dataset.key === this.#current);
    if (current) tree.setAttribute("aria-activedescendant", current.id);
    else tree.removeAttribute("aria-activedescendant");
    if (this.#reveal !== null) {
      const id = this.#reveal;
      this.#reveal = null;
      const index = visible.findIndex((r) => r.node === id);
      const el = index < 0 ? undefined : items[index];
      if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  #drawMockups(): void {
    const list = this.#mockupsPanel?.querySelector("ul");
    const session = this.#session;
    if (!list || !session) return;
    const doc = list.ownerDocument;
    list.replaceChildren(...session.document.mockups.map((m) => {
      const li = doc.createElement("li");
      li.className = "mkd-outline__mockup";
      li.setAttribute("part", "mockup");
      li.textContent = m.name;
      if (m.name === session.active) li.setAttribute("aria-current", "true");
      return li;
    }));
  }

  #showTab(tab: "elements" | "mockups"): void {
    this.#tab = tab;
    for (const t of this.#tabs) {
      const on = t.dataset.tab === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    }
    if (this.#treePanel) this.#treePanel.hidden = tab !== "elements";
    if (this.#mockupsPanel) this.#mockupsPanel.hidden = tab !== "mockups";
  }

  #onTabKey(e: KeyboardEvent): void {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = this.#tab === "elements" ? "mockups" : "elements";
    this.#showTab(next);
    this.#tabs.find((t) => t.dataset.tab === next)?.focus();
  }

  // --- pointer and keys ---------------------------------------------------------------------------

  #rowAt(e: Event): OutlineRow | undefined {
    const el = e.composedPath().find((t): t is HTMLElement => t instanceof HTMLElement && t.getAttribute("role") === "treeitem");
    return el ? this.#all.find((r) => r.key === el.dataset.key) : undefined;
  }

  #onClick(e: MouseEvent): void {
    const row = this.#rowAt(e);
    this.#tree?.focus({ preventScroll: true });
    if (!row) return;
    const onTwisty = e.composedPath().some((t) => t instanceof HTMLElement && t.classList.contains("mkd-outline__twisty"));
    if (onTwisty && row.children.length) {
      this.#expanded.set(row.key, !this.#isExpanded(row));
      this.#draw();
      return;
    }
    this.#choose(row, e.shiftKey ? "range" : e.metaKey || e.ctrlKey ? "toggle" : "replace");
  }

  /**
   * Make a row current and select its node: alone, or (R-EDIT-008.C8) with Shift the siblings from the
   * selection's first node to it (`session.selectRange`), with Cmd/Ctrl added to or removed from the
   * selection (`session.toggleSelected`).
   */
  #choose(row: OutlineRow, how: "replace" | "range" | "toggle" = "replace"): void {
    this.#current = row.key;
    const session = this.session;
    if (row.node !== null && session.active === this.#rowsOf) {
      if (how === "range") session.selectRange(row.node);
      else if (how === "toggle") session.toggleSelected(row.node);
      else session.select([row.node]);
    }
    this.#reveal = row.node;
    this.#draw();
    const el = this.#tree?.querySelector<HTMLElement>(`[data-key="${CSS.escape(row.key)}"]`);
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  #onKey(e: KeyboardEvent): void {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const visible = this.#visible();
    if (!visible.length) return;
    const cur = this.#currentRow();
    const index = cur ? visible.indexOf(cur) : -1;
    const go = (row: OutlineRow | undefined): void => {
      e.preventDefault();
      if (row) this.#choose(row);
    };
    switch (e.key) {
      case "ArrowDown":
        return go(visible[index < 0 ? 0 : Math.min(index + 1, visible.length - 1)]);
      case "ArrowUp":
        return go(visible[index < 0 ? 0 : Math.max(index - 1, 0)]);
      case "Home":
        return go(visible[0]);
      case "End":
        return go(visible[visible.length - 1]);
      case "ArrowRight":
        if (!cur) return go(visible[0]);
        if (cur.children.length && !this.#isExpanded(cur)) {
          e.preventDefault();
          this.#expanded.set(cur.key, true);
          this.#draw();
          return;
        }
        return go(cur.children[0]);
      case "ArrowLeft":
        if (!cur) return go(visible[0]);
        if (cur.children.length && this.#isExpanded(cur)) {
          e.preventDefault();
          this.#expanded.set(cur.key, false);
          this.#draw();
          return;
        }
        return go(cur.parent ?? undefined);
    }
    if (e.key.length === 1 && e.key.trim() !== "") {
      e.preventDefault();
      const now = Date.now();
      this.#typed = now - this.#typedAt > TYPEAHEAD_MS ? e.key : this.#typed + e.key;
      this.#typedAt = now;
      const prefix = this.#typed.toLowerCase();
      // A new search starts after the current row; a longer one may stay on it.
      const start = this.#typed.length === 1 ? index + 1 : Math.max(index, 0);
      for (let k = 0; k < visible.length; k++) {
        const row = visible[(start + k) % visible.length]!;
        if (row.name.toLowerCase().startsWith(prefix)) {
          this.#choose(row);
          return;
        }
      }
    }
  }

  // --- drag and drop (R-TOOL-005) -----------------------------------------------------------------

  /** C1: a row of a view that is not derived drags its node, or the selection it is part of. */
  #onPointerDown(e: PointerEvent): void {
    const row = this.#rowAt(e);
    if (!row || row.derived || row.node === null) return;
    if (e.composedPath().some((t) => t instanceof HTMLElement && t.classList.contains("mkd-outline__twisty"))) return;
    const mockup = this.#rowsOf;
    const node = row.node;
    armDrag(e, () => {
      const session = this.session;
      if (mockup === null || session.active !== mockup) return null;
      const sel = session.selection;
      const nodes = sel.length > 1 && sel.includes(node) ? [...sel] : [node];
      const label = nodes.length > 1 ? `${row.name} + ${nodes.length - 1}` : row.name;
      return { session, source: { kind: "nodes", mockup, nodes }, label };
    });
  }

  /** C2, C4: the drop position at a point — before, inside or after the row by its thirds — and the session's answer. */
  #dragOver(drag: Drag, x: number, y: number): DropAnswer | null {
    const session = this.#session;
    if (!session || drag.session !== session || session.active === null || session.active !== this.#rowsOf || this.#tab !== "elements") {
      this.#showDrop(null);
      return null;
    }
    const root = this.#root as ShadowRoot & { elementsFromPoint?: (x: number, y: number) => Element[] };
    const hits = typeof root.elementsFromPoint === "function" ? root.elementsFromPoint(x, y) : [];
    const el = hits.find((h): h is HTMLElement => h instanceof HTMLElement && h.getAttribute("role") === "treeitem");
    const row = el ? this.#all.find((r) => r.key === el.dataset.key) : undefined;
    let state: DropMark;
    let reason: string | undefined;
    if (row && el && row.node !== null) {
      const r = el.getBoundingClientRect();
      const zone: DropZone = y < r.top + r.height / 3 ? "before" : y > r.top + (2 * r.height) / 3 ? "after" : "inside";
      const position = session.dropPosition(row.node, zone);
      if ("error" in position) {
        state = { key: row.key, zone, position: null, allowed: false };
        reason = position.error;
      } else {
        const check = session.checkDrop(drag.source, position, this.#pack);
        state = { key: row.key, zone, position, allowed: check.ok };
        if (!check.ok) reason = check.reason;
      }
    } else if (hits.includes(this.#tree!) && !row) {
      const position: DropPosition = { parent: null, index: "end" };
      const check = session.checkDrop(drag.source, position, this.#pack);
      state = { key: null, zone: "end", position, allowed: check.ok };
      if (!check.ok) reason = check.reason;
    } else {
      this.#showDrop(null);
      return null;
    }
    this.#showDrop(state);
    return state.allowed ? { allowed: true } : { allowed: false, reason };
  }

  #dragDrop(drag: Drag): void {
    const state = this.#drop;
    this.#showDrop(null);
    if (!state?.allowed || !state.position) return;
    // C5, C6: one session operation — an insert, selected, or a move of the dragged nodes.
    this.session.drop(drag.source, state.position, this.#pack);
  }

  #showDrop(state: DropMark | null): void {
    this.#drop = state;
    this.#markDrop();
  }

  /** Mark the row (or the tree's end) where the drop goes. */
  #markDrop(): void {
    const tree = this.#tree;
    if (!tree) return;
    const zones = ["before", "inside", "after"];
    for (const el of Array.from(tree.querySelectorAll<HTMLElement>("[data-drop]"))) {
      el.removeAttribute("data-drop");
      for (const z of zones) el.classList.remove(`mkd-outline__row--drop-${z}`);
      el.classList.remove("mkd-outline__row--drop-refused");
    }
    tree.classList.remove("mkd-outline__tree--drop-end", "mkd-outline__tree--drop-refused");
    tree.removeAttribute("data-drop");
    const d = this.#drop;
    if (!d) return;
    if (d.key === null) {
      tree.dataset.drop = d.allowed ? "end" : "end refused";
      tree.classList.add("mkd-outline__tree--drop-end");
      if (!d.allowed) tree.classList.add("mkd-outline__tree--drop-refused");
      return;
    }
    const el = tree.querySelector<HTMLElement>(`[data-key="${CSS.escape(d.key)}"]`);
    if (!el) return;
    el.dataset.drop = d.allowed ? d.zone : `${d.zone} refused`;
    el.classList.add(`mkd-outline__row--drop-${d.zone}`);
    if (!d.allowed) el.classList.add("mkd-outline__row--drop-refused");
  }

  #onPointer(e: Event): void {
    const row = this.#rowAt(e);
    this.#setHover(row?.node ?? null);
  }

  #setHover(id: string | null): void {
    const session = this.#session;
    if (!session || session.active === null || session.active !== this.#rowsOf) return;
    if (session.hovered !== id) session.hover(id);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mockitdown-outline": OutlineElement;
  }
}
