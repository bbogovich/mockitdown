/**
 * `<mockitdown-designer>`: the composite designer (R-TOOL-003, A-WEB-5). It owns a design session
 * (R-EDIT-006) that its components join, and lays the design tools out in panels:
 *
 *   ┌ toolbar: mode switch · Undo, Redo · panel toggles · mockup, pack and device ───────────┐
 *   │ outline (240 px)  │                                    │ properties (260 px)          │
 *   │ gallery           │ the editable view                  │                              │
 *   └ status bar: diagnostic count · breadcrumb ──────────────────────────────────────────────┘
 *
 *   <mockitdown-designer id="d"></mockitdown-designer>
 *   <script type="module">
 *     await d.open(await (await fetch("mail.mkdesign")).text());
 *     d.addEventListener("mockitdown-change", (e) => markEdited(e.detail.edits));
 *     save(writeDesign(d.toJSON()));
 *   </script>
 *
 * The side panels are resized by dragging their inner edges (or with the arrow keys on them) and
 * collapsed from the toolbar; `layout` reads and sets their sizes and collapsed states. The named slots
 * `toolbar`, `outline`, `gallery`, `view`, `inspector` and `status` replace a panel with the host's own
 * element, which is given the designer's session (`element.session = designer.session`); components
 * of the package anywhere inside the designer join it (R-EDIT-006.C11). Only the designer dispatches
 * the session's notifications as DOM events (R-EDIT-006.C7, C8): the components inside it never do.
 *
 * `open(json)` reads a design document with `readDesign` and starts a new session over it (rejecting
 * with a {@link DesignOpenError} and keeping the current document when it is not valid); `toJSON()` and
 * `document` return the session's live document with every edit applied. `mode` is `design` (the
 * default), `preview` (every mockup read-only through `mockitdown-mockup`, the side panels hidden, a
 * list of the mockups and a light, dark and both appearance toggle) or `code` (the active mockup's code in a
 * `mockitdown-code` in the centre, R-TOOL-008, with the outline, the gallery and the inspector kept live).
 * The code view is joined to the session by a `CodeSync` (R-TOOL-009): typing is applied 300 ms after
 * the last keystroke (or when the focus leaves it), the caret moved by the pointer or a navigation key
 * selects the innermost node holding it (so the gallery's Add inserts there), other components'
 * changes reach it as text edits, and the selection's span is marked in it. While the code does not
 * parse, the outline and the view keep its last valid version, read-only, and the status bar names the
 * first error. In Design mode the toolbar's Dock code toggle (part `dock`, the `docked` attribute and
 * property) shows the same code view below the view. The inspector's Edit in code
 * (`mockitdown-edit-in-code`) switches to Code mode and reveals the node's span (R-TOOL-007.C11). Delete and Backspace with the focus in the outline or the
 * view delete the selection through `session.delete()`; there too Cmd/Ctrl+D duplicates, Cmd/Ctrl+X, C
 * and V cut, copy and paste with the system clipboard holding the code as `text/plain`, and Alt+Up and
 * Alt+Down move the selection among its siblings (R-EDIT-008). Cmd/Ctrl+Z undoes, Shift+Cmd/Ctrl+Z and Ctrl+Y
 * redo (R-EDIT-007.C10) while the focus is in the designer but not in a text field, outside Preview
 * mode; the toolbar's Undo and Redo buttons are enabled by `session.canUndo` and `session.canRedo`.
 * The gallery panel holds `mockitdown-gallery`
 * (R-TOOL-004) and the properties panel `mockitdown-inspector` (R-TOOL-007). The designer holds no
 * editing rule of its own (A-WEB-5.K2).
 */

import { FENCE_OPTIONS, registry } from "../core/index.js";
import { mockupOptions, mockupPack, readDesign, newDesign, type DesignDocument, type DesignError } from "../design/document.js";
import { CodeSync } from "../design/code-sync.js";
import { DESIGN_EVENTS, DesignSession, WRAP_DEFAULT, type DesignNotification } from "../design/session.js";
import { CODE_TAG, type CodeElement } from "./code.js";
import { EDITOR_TAG } from "./editor.js";
import { GALLERY_TAG } from "./gallery.js";
import { EDIT_IN_CODE_EVENT, INSPECTOR_TAG } from "./inspector.js";
import { MOCKUP_TAG } from "./mockup.js";
import { OUTLINE_TAG } from "./outline.js";

export const DESIGNER_TAG = "mockitdown-designer";
/** The attributes the designer observes: `mode` and the two base URLs it passes to its components. */
export const DESIGNER_ATTRIBUTES: readonly string[] = ["mode", "docked", "import-base", "asset-base"];
/** The designer's modes (C8); any other value of `mode` means `design`. */
export const DESIGNER_MODES = ["design", "preview", "code"] as const;
export type DesignerMode = (typeof DESIGNER_MODES)[number];
/** The named slots, each replacing one panel (C4). */
export const DESIGNER_SLOTS: readonly string[] = ["toolbar", "outline", "gallery", "view", "inspector", "status"];
/** The preview appearances of the toggle (C9). */
export const PREVIEW_APPEARANCES = ["light", "dark", "both"] as const;
export type PreviewAppearance = (typeof PREVIEW_APPEARANCES)[number];

/** The sizes and collapsed states of the side panels (C3). */
export interface DesignerLayout {
  left: { size: number; collapsed: boolean };
  right: { size: number; collapsed: boolean };
}

/** What a host may set as `layout`: any part of a {@link DesignerLayout}. */
export interface DesignerLayoutUpdate {
  left?: Partial<DesignerLayout["left"]>;
  right?: Partial<DesignerLayout["right"]>;
}

/** The default layout (C2): a 240 px left column and a 260 px right panel. */
export const DEFAULT_LAYOUT: DesignerLayout = { left: { size: 240, collapsed: false }, right: { size: 260, collapsed: false } };
/** The sizes a side panel may be dragged to, in CSS pixels. */
export const PANEL_MIN = 120;
export const PANEL_MAX = 640;
/** One arrow-key step on a panel edge, in CSS pixels. */
const KEY_STEP = 16;
const EDGE = 5;

/** Why `open` refused a document: the problems `readDesign` found (R-EDIT-005.C2). */
export class DesignOpenError extends Error {
  readonly errors: DesignError[];
  constructor(errors: DesignError[]) {
    super(`not a valid design document: ${errors.map((e) => (e.path ? `${e.path}: ${e.message}` : e.message)).join("; ")}`);
    this.name = "DesignOpenError";
    this.errors = errors;
  }
}

/** The components whose focus makes Delete and Backspace delete the selection (C11). */
const COMPONENT_TAGS = new Set([EDITOR_TAG, OUTLINE_TAG]);
/** The package's components that join the designer's session (R-EDIT-006.C11). */
const SESSION_TAGS = new Set([EDITOR_TAG, OUTLINE_TAG, GALLERY_TAG, INSPECTOR_TAG]);

const DESIGNER_CSS = `:host{display:block;position:relative;height:32rem;font:13px/1.4 system-ui,sans-serif;color:var(--mkd-designer-color,#1d1d22);background:var(--mkd-designer-background,#fff)}
:host([hidden]){display:none}
.mkd-designer{display:grid;grid-template-rows:auto minmax(0,1fr) auto;height:100%;min-height:0}
.mkd-designer__toolbar{display:flex;align-items:center;gap:8px;padding:4px 8px;border-bottom:1px solid var(--mkd-designer-border,#d0d0d7);background:var(--mkd-designer-bar-background,#f6f6f8);min-height:32px;box-sizing:border-box}
.mkd-designer__toolbar button{font:inherit;color:inherit;background:none;border:1px solid transparent;border-radius:5px;padding:2px 8px;cursor:pointer}
.mkd-designer__toolbar button:hover{border-color:var(--mkd-designer-border,#d0d0d7)}
.mkd-designer__toolbar button:disabled{opacity:.4;cursor:default;border-color:transparent}
.mkd-designer__history{display:flex;gap:2px}
.mkd-designer__toolbar button[aria-checked="true"],.mkd-designer__toolbar button[aria-pressed="true"]{background:var(--mkd-designer-pressed-background,#e2e4ea)}
.mkd-designer__modes,.mkd-designer__appearance{display:flex;gap:2px}
.mkd-designer__appearance[hidden]{display:none}
.mkd-designer__spacer{flex:1 1 auto}
.mkd-designer__name{font-weight:600}
.mkd-designer__pack,.mkd-designer__device{font:11px/18px ui-monospace,monospace;padding:0 6px;border-radius:3px;background:var(--mkd-designer-chip-background,#eceef2)}
.mkd-designer__main{display:grid;min-height:0;min-width:0}
.mkd-designer__left,.mkd-designer__right{display:flex;flex-direction:column;min-height:0;min-width:0;overflow:hidden;box-sizing:border-box}
.mkd-designer__left[hidden],.mkd-designer__right[hidden],.mkd-designer__resizer[hidden]{display:none}
.mkd-designer__outline{flex:3 1 0;min-height:0;display:flex;flex-direction:column}
.mkd-designer__gallery{flex:2 1 0;min-height:0;border-top:1px solid var(--mkd-designer-border,#d0d0d7);display:flex;flex-direction:column;overflow:hidden}
.mkd-designer__gallery>slot{display:contents}
.mkd-designer__gallery ::slotted(*),.mkd-designer__gallery>slot>mockitdown-gallery{flex:1 1 auto;min-height:0}
.mkd-designer__outline ::slotted(*),.mkd-designer__outline>slot>mockitdown-outline{flex:1 1 auto;min-height:0}
.mkd-designer__outline>slot{display:contents}
.mkd-designer__right{overflow:auto}
.mkd-designer__resizer{background:var(--mkd-designer-border,#d0d0d7);background-clip:content-box;padding:0 2px;cursor:col-resize;touch-action:none;outline:none}
.mkd-designer__resizer:hover,.mkd-designer__resizer:focus-visible,.mkd-designer__resizer--dragging{background-color:var(--mkd-selection-color,#ff8a00)}
.mkd-designer__center{position:relative;display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden;background:var(--mkd-designer-canvas-background,#f0f1f4)}
.mkd-designer__view{flex:1 1 auto;min-height:0;overflow:auto;padding:24px}
.mkd-designer__view[hidden],.mkd-designer__code[hidden],.mkd-designer__preview[hidden]{display:none}
.mkd-designer__view mockitdown-editor{display:block;max-width:100%}
.mkd-designer__code{display:block;flex:1 1 auto;height:auto;min-height:0;--mkd-code-background:var(--mkd-designer-background,#fff)}
.mkd-designer__code--docked{flex:0 0 40%;border-top:1px solid var(--mkd-designer-border,#d0d0d7)}
.mkd-designer__preview{flex:1 1 auto;min-height:0;overflow:auto;display:grid;grid-template-columns:auto minmax(0,1fr);align-items:start}
.mkd-designer__status-message{color:var(--mkd-designer-error-color,#d12f2f);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.mkd-designer__status-message:empty{display:none}
.mkd-designer__preview-list{display:flex;flex-direction:column;gap:2px;padding:8px;border-right:1px solid var(--mkd-designer-border,#d0d0d7);background:var(--mkd-designer-background,#fff)}
.mkd-designer__preview-list button{font:inherit;color:inherit;text-align:left;background:none;border:0;border-radius:5px;padding:3px 10px;cursor:pointer;white-space:nowrap}
.mkd-designer__preview-list button[aria-current="true"]{font-weight:600;background:var(--mkd-outline-selected-background,rgba(255,138,0,.22))}
.mkd-designer__frames{display:flex;flex-direction:column;gap:24px;padding:24px}
.mkd-designer__frame{margin:0}
.mkd-designer__frame>figcaption{font-weight:600;margin:0 0 6px}
.mkd-designer__status{display:flex;align-items:center;gap:12px;padding:2px 8px;border-top:1px solid var(--mkd-designer-border,#d0d0d7);background:var(--mkd-designer-bar-background,#f6f6f8);min-height:24px;box-sizing:border-box;font-size:12px}
.mkd-designer__breadcrumb{display:flex;align-items:center;gap:2px;min-width:0;overflow:hidden}
.mkd-designer__crumb{font:inherit;color:inherit;background:none;border:0;border-radius:4px;padding:0 4px;cursor:pointer}
.mkd-designer__crumb:hover{background:var(--mkd-designer-pressed-background,#e2e4ea)}
.mkd-designer__crumb[aria-current="true"]{font-weight:600}
.mkd-designer__sep{opacity:.5}`;

const SHADOW_HTML = `<style>${DESIGNER_CSS}</style><div class="mkd-designer" part="designer">`
  + `<div class="mkd-designer__toolbar" part="toolbar"><slot name="toolbar">`
  + `<div class="mkd-designer__modes" role="radiogroup" aria-label="Mode">`
  + DESIGNER_MODES.map((m) => `<button type="button" role="radio" part="mode" data-mode="${m}" aria-checked="false">${m[0]!.toUpperCase()}${m.slice(1)}</button>`).join("")
  + `</div>`
  + `<div class="mkd-designer__history" role="group" aria-label="History">`
  + `<button type="button" class="mkd-designer__undo" part="undo" title="Undo (Cmd/Ctrl+Z)" disabled>Undo</button>`
  + `<button type="button" class="mkd-designer__redo" part="redo" title="Redo (Shift+Cmd/Ctrl+Z)" disabled>Redo</button>`
  + `</div>`
  + `<button type="button" class="mkd-designer__toggle" part="toggle" data-panel="left" aria-pressed="true" title="Show or hide the outline and the gallery">Outline</button>`
  + `<button type="button" class="mkd-designer__toggle" part="toggle" data-panel="right" aria-pressed="true" title="Show or hide the properties">Properties</button>`
  + `<button type="button" class="mkd-designer__dock" part="dock" aria-pressed="false" title="Show or hide the code below the view">Dock code</button>`
  + `<div class="mkd-designer__appearance" role="group" aria-label="Appearance" hidden>`
  + PREVIEW_APPEARANCES.map((a) => `<button type="button" part="appearance" data-appearance="${a}" aria-pressed="false">${a[0]!.toUpperCase()}${a.slice(1)}</button>`).join("")
  + `</div><span class="mkd-designer__spacer"></span>`
  + `<span class="mkd-designer__name" part="name"></span>`
  + `<span class="mkd-designer__pack" part="pack" title="Pack"></span><span class="mkd-designer__device" part="device" title="Device"></span>`
  + `</slot></div>`
  + `<div class="mkd-designer__main" part="main">`
  + `<div class="mkd-designer__left" part="left">`
  + `<div class="mkd-designer__outline"><slot name="outline"><mockitdown-outline part="outline"></mockitdown-outline></slot></div>`
  + `<div class="mkd-designer__gallery" part="gallery"><slot name="gallery"><mockitdown-gallery></mockitdown-gallery></slot></div>`
  + `</div>`
  + `<div class="mkd-designer__resizer mkd-designer__resizer--left" part="resizer" role="separator" aria-orientation="vertical" aria-label="Resize the outline" tabindex="0" data-panel="left"></div>`
  + `<div class="mkd-designer__center" part="center">`
  + `<div class="mkd-designer__view" part="view"><slot name="view"><mockitdown-editor part="editor"></mockitdown-editor></slot></div>`
  + `<${CODE_TAG} class="mkd-designer__code" part="code" hidden></${CODE_TAG}>`
  + `<div class="mkd-designer__preview" part="preview" hidden><nav class="mkd-designer__preview-list" part="mockups" aria-label="Mockups"></nav><div class="mkd-designer__frames"></div></div>`
  + `</div>`
  + `<div class="mkd-designer__resizer mkd-designer__resizer--right" part="resizer" role="separator" aria-orientation="vertical" aria-label="Resize the properties" tabindex="0" data-panel="right"></div>`
  + `<div class="mkd-designer__right" part="right"><slot name="inspector"><mockitdown-inspector part="inspector"></mockitdown-inspector></slot></div>`
  + `</div>`
  + `<div class="mkd-designer__status" part="status"><slot name="status">`
  + `<span class="mkd-designer__diagnostics" part="diagnostics"></span>`
  + `<span class="mkd-designer__status-message" part="status-message" role="status"></span>`
  + `<nav class="mkd-designer__breadcrumb" part="breadcrumb" aria-label="Path"></nav>`
  + `</slot></div></div>`;

const Base: typeof HTMLElement = (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) as typeof HTMLElement;

/** A mode attribute's value as a mode: an unknown value (or none) is `design` (C8). */
export function designerMode(value: string | null | undefined): DesignerMode {
  const v = (value ?? "").trim().toLowerCase();
  return (DESIGNER_MODES as readonly string[]).includes(v) ? (v as DesignerMode) : "design";
}

const clamp = (n: number): number => Math.min(PANEL_MAX, Math.max(PANEL_MIN, Math.round(n)));

export class DesignerElement extends Base {
  static get observedAttributes(): string[] {
    return [...DESIGNER_ATTRIBUTES];
  }

  #root: ShadowRoot;
  #session: DesignSession;
  #unsubscribe: (() => void) | null = null;
  /** The code view's join to the session (R-TOOL-009). */
  #sync: CodeSync | null = null;
  #layout: DesignerLayout = structuredCloneLayout(DEFAULT_LAYOUT);
  #appearance: PreviewAppearance | null = null;
  /** The text the designer copied or cut last (R-EDIT-008.C3), pasted when the clipboard cannot be read. */
  #copied = "";
  #previewsFor: DesignSession | null = null;
  #previewsDirty = true;
  /** The appearance each preview's own options give it, which the toggle overrides. */
  #ownAppearance = new WeakMap<Element, string>();
  #el: {
    main: HTMLElement; left: HTMLElement; right: HTMLElement; leftEdge: HTMLElement; rightEdge: HTMLElement;
    view: HTMLElement; code: HTMLElement; preview: HTMLElement; previewList: HTMLElement; frames: HTMLElement;
    appearance: HTMLElement; name: HTMLElement; pack: HTMLElement; device: HTMLElement;
    undo: HTMLButtonElement; redo: HTMLButtonElement;
    diagnostics: HTMLElement; statusMessage: HTMLElement; breadcrumb: HTMLElement; dock: HTMLElement;
    editor: HTMLElement; outline: HTMLElement; gallery: HTMLElement; inspector: HTMLElement;
  };

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#root.innerHTML = SHADOW_HTML;
    const q = <T extends HTMLElement>(sel: string): T => this.#root.querySelector(sel) as T;
    this.#el = {
      main: q(".mkd-designer__main"), left: q(".mkd-designer__left"), right: q(".mkd-designer__right"),
      leftEdge: q(".mkd-designer__resizer--left"), rightEdge: q(".mkd-designer__resizer--right"),
      view: q(".mkd-designer__view"), code: q(".mkd-designer__code"), preview: q(".mkd-designer__preview"),
      previewList: q(".mkd-designer__preview-list"), frames: q(".mkd-designer__frames"),
      appearance: q(".mkd-designer__appearance"), name: q(".mkd-designer__name"), pack: q(".mkd-designer__pack"),
      device: q(".mkd-designer__device"), diagnostics: q(".mkd-designer__diagnostics"),
      undo: q(".mkd-designer__undo"), redo: q(".mkd-designer__redo"),
      breadcrumb: q(".mkd-designer__breadcrumb"), statusMessage: q(".mkd-designer__status-message"), dock: q(".mkd-designer__dock"),
      editor: q("mockitdown-editor"), outline: q("mockitdown-outline"), gallery: q("mockitdown-gallery"),
      inspector: q("mockitdown-inspector"),
    };
    this.#session = new DesignSession(newDesign(DESIGNER_TAG));
    this.#subscribe();
    for (const b of this.#root.querySelectorAll<HTMLElement>(".mkd-designer__modes [role=radio]")) {
      b.addEventListener("click", () => {
        this.mode = designerMode(b.dataset.mode);
      });
    }
    this.#root.querySelector(".mkd-designer__modes")?.addEventListener("keydown", (e) => this.#onModeKey(e as KeyboardEvent));
    for (const b of this.#root.querySelectorAll<HTMLElement>(".mkd-designer__toggle")) {
      b.addEventListener("click", () => {
        const side = b.dataset.panel as "left" | "right";
        this.layout = { [side]: { collapsed: !this.#layout[side].collapsed } };
      });
    }
    for (const b of this.#root.querySelectorAll<HTMLElement>(".mkd-designer__appearance button")) {
      b.addEventListener("click", () => {
        const a = b.dataset.appearance as PreviewAppearance;
        this.#appearance = this.#appearance === a ? null : a;
        this.#drawAppearance();
      });
    }
    this.#el.dock.addEventListener("click", () => {
      this.docked = !this.docked;
    });
    this.addEventListener(EDIT_IN_CODE_EVENT, (e) => this.#editInCode(e as CustomEvent));
    this.#el.undo.addEventListener("click", () => this.#history("undo"));
    this.#el.redo.addEventListener("click", () => this.#history("redo"));
    for (const edge of [this.#el.leftEdge, this.#el.rightEdge]) this.#makeResizable(edge);
    for (const slot of this.#root.querySelectorAll("slot")) slot.addEventListener("slotchange", () => this.#giveSlotted(slot));
    this.addEventListener("keydown", (e) => this.#onKey(e));
    this.#el.breadcrumb.addEventListener("click", (e) => {
      const crumb = (e.target as Element).closest?.(".mkd-designer__crumb") as HTMLElement | null;
      if (crumb?.dataset.node) this.#session.select([crumb.dataset.node]);
    });
    this.#el.previewList.addEventListener("click", (e) => {
      const b = (e.target as Element).closest?.("button") as HTMLElement | null;
      if (b) this.#showPreview(b.dataset.mockup ?? "");
    });
    this.#drawLayout();
    this.#drawMode();
    this.#drawState();
  }

  // --- properties ---------------------------------------------------------------------------------

  /** The design session the designer owns and its components join (C1); a new one with each `open`. */
  get session(): DesignSession {
    return this.#session;
  }

  /** The opened document with every edit applied (C6): what {@link toJSON} returns; setting it opens it. */
  get document(): DesignDocument {
    return this.toJSON();
  }

  set document(value: string | object) {
    this.#open(value);
  }

  /** The mode (C8): `design`, `preview` or `code`, from the `mode` attribute (an unknown value is `design`). */
  get mode(): DesignerMode {
    return designerMode(this.getAttribute("mode"));
  }

  set mode(value: string) {
    this.setAttribute("mode", designerMode(value));
  }

  /** Whether Design mode shows the code view below the view (R-TOOL-009.C8): the `docked` attribute. */
  get docked(): boolean {
    return this.hasAttribute("docked");
  }

  set docked(on: boolean) {
    this.toggleAttribute("docked", Boolean(on));
  }

  /** The code view (R-TOOL-008) of Code mode and of the dock. */
  get codeView(): CodeElement {
    return this.#el.code as unknown as CodeElement;
  }

  /** The side panels' sizes and collapsed states (C3); setting it changes the parts it names. */
  get layout(): DesignerLayout {
    return structuredCloneLayout(this.#layout);
  }

  set layout(value: DesignerLayoutUpdate) {
    for (const side of ["left", "right"] as const) {
      const v = value?.[side];
      if (!v || typeof v !== "object") continue;
      if (typeof v.size === "number" && Number.isFinite(v.size)) this.#layout[side].size = clamp(v.size);
      if (typeof v.collapsed === "boolean") this.#layout[side].collapsed = v.collapsed;
    }
    this.#drawLayout();
  }

  /** A promise that resolves once the outline, the view and, in Preview mode, the previews are rendered. */
  get rendered(): Promise<void> {
    const parts: Promise<void>[] = [];
    for (const el of [this.#el.editor, this.#el.outline, this.#el.gallery]) {
      const r = (el as unknown as { rendered?: Promise<void> }).rendered;
      if (r) parts.push(r);
    }
    if (this.mode === "preview") {
      for (const m of this.#el.frames.querySelectorAll(MOCKUP_TAG)) {
        const r = (m as unknown as { rendered?: Promise<void> }).rendered;
        if (r) parts.push(r);
      }
    }
    return Promise.all(parts).then(() => undefined);
  }

  /**
   * Open a design document (C5): JSON text or an object (written as JSON text first), read with
   * `readDesign`, in a new session whose active mockup is the one `view.active` names, else the first.
   * Rejects with a {@link DesignOpenError} holding `readDesign`'s errors, keeping the current document.
   */
  async open(json: string | object): Promise<void> {
    this.#open(json);
  }

  /** The opened document with every edit applied (C7): the session's live document. */
  toJSON(): DesignDocument {
    return this.#session.document;
  }

  // --- lifecycle ----------------------------------------------------------------------------------

  connectedCallback(): void {
    this.#rejoin();
    for (const slot of this.#root.querySelectorAll("slot")) this.#giveSlotted(slot);
  }

  disconnectedCallback(): void {
    /* the session stays: a designer moved in the page keeps its document */
  }

  attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    if (old === value) return;
    if (name === "mode" || name === "docked") this.#drawMode();
    else this.#passBases();
  }

  // --- the session --------------------------------------------------------------------------------

  #open(json: string | object): void {
    const text = typeof json === "string" ? json : JSON.stringify(json);
    const read = readDesign(text);
    if ("errors" in read) throw new DesignOpenError(read.errors);
    this.#unsubscribe?.();
    this.#session = new DesignSession(read.document);
    this.#subscribe();
    this.#previewsDirty = true;
    this.#rejoin();
    for (const slot of this.#root.querySelectorAll("slot")) this.#giveSlotted(slot);
    this.#drawState();
    if (this.mode === "preview") this.#drawPreviews();
  }

  #subscribe(): void {
    const session = this.#session;
    this.#unsubscribe = session.subscribe((n) => this.#notified(session, n));
    // The code view joins the new session; text typed for the old one is applied to it first.
    this.#sync?.dispose();
    this.#sync = null;
    const code = this.#el.code;
    const registry = (globalThis as { customElements?: CustomElementRegistry }).customElements;
    // The shadow root's elements are upgraded when the designer is connected; the code view is needed now.
    if (registry?.get(CODE_TAG)) registry.upgrade(code);
    if (typeof (code as unknown as Partial<CodeElement>).mark === "function") this.#sync = new CodeSync(session, code as unknown as CodeElement);
    else registry?.whenDefined(CODE_TAG).then(() => {
      if (this.#session !== session || this.#sync) return;
      registry.upgrade(code);
      this.#sync = new CodeSync(session, code as unknown as CodeElement);
    });
  }

  /** Edit in code (R-TOOL-007.C11): Code mode, the node's span revealed in the code view. */
  #editInCode(e: CustomEvent): void {
    const d = e.detail as { mockup?: string | null; range?: { start: number; end: number } } | null;
    if (!d?.range || (d.mockup ?? null) !== this.#session.active) return;
    this.mode = "code";
    (this.#el.code as unknown as CodeElement).reveal(d.range);
  }

  /** The package's components inside the designer re-join its session: reading `session` re-attaches them. */
  #rejoin(): void {
    const parts: Element[] = [this.#el.editor, this.#el.outline, this.#el.gallery, this.#el.inspector];
    for (const el of this.querySelectorAll("*")) if (SESSION_TAGS.has(el.localName)) parts.push(el);
    for (const el of parts) void (el as unknown as { session?: unknown }).session;
  }

  /** Give the elements a slot holds the designer's session (C4), once their class is defined. */
  #giveSlotted(slot: HTMLSlotElement): void {
    for (const el of slot.assignedElements()) {
      const name = el.localName;
      const registry = (globalThis as { customElements?: CustomElementRegistry }).customElements;
      if (name.includes("-") && registry && !registry.get(name)) {
        void registry.whenDefined(name).then(() => this.#give(el));
      } else if (name.includes("-") || "session" in el) this.#give(el);
    }
  }

  #give(el: Element): void {
    if (el.parentNode !== this) return;
    try {
      (el as unknown as { session: DesignSession }).session = this.#session;
    } catch {
      /* an element whose session cannot be set keeps its own */
    }
  }

  #notified(session: DesignSession, n: DesignNotification): void {
    if (session !== this.#session) return;
    switch (n.kind) {
      case "change":
        if (n.detail.kind !== "move") this.#previewsDirty = true;
        this.#drawState();
        if (this.mode === "preview" && n.detail.kind !== "move") this.#drawPreviews();
        break;
      case "active":
      case "select":
      case "diagnostics":
      case "rename":
        this.#drawState();
        break;
    }
    if (n.kind in DESIGN_EVENTS) {
      const type = DESIGN_EVENTS[n.kind as keyof typeof DESIGN_EVENTS];
      this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: n.detail }));
    }
  }

  // --- keys ---------------------------------------------------------------------------------------

  /**
   * Delete or Backspace with the focus in the outline or the view deletes the selection (C11);
   * Cmd/Ctrl+Z undoes, Shift+Cmd/Ctrl+Z and Ctrl+Y redo anywhere in the designer (R-EDIT-007.C10).
   * With the focus in the outline or the view (R-EDIT-008.C9): Cmd/Ctrl+D duplicates, Cmd/Ctrl+X, C and
   * V cut, copy and paste through the clipboard, Alt+Up and Alt+Down move the selection, and
   * Cmd/Ctrl+G wraps it in a `VStack` and Shift+Cmd/Ctrl+G unwraps it (R-EDIT-009.C9). None of them
   * in a text field, nor in Preview mode.
   */
  #onKey(e: KeyboardEvent): void {
    if (e.defaultPrevented) return;
    if (this.mode === "preview") return;
    const path = e.composedPath();
    const first = path[0];
    if (first instanceof HTMLElement && (first.isContentEditable || first.localName === "input" || first.localName === "textarea" || first.localName === "select")) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const command = e.ctrlKey || e.metaKey;
    const inTools = (): boolean => path.some((t) => t instanceof Element && COMPONENT_TAGS.has(t.localName)
      && (t as unknown as { session?: unknown }).session === this.#session);
    const session = this.#session;
    if (e.altKey) {
      if (command || e.shiftKey || (key !== "ArrowUp" && key !== "ArrowDown") || !inTools() || !session.selection.length) return;
      e.preventDefault();
      if (key === "ArrowUp") session.moveUp();
      else session.moveDown();
      return;
    }
    if (command && key === "z") {
      e.preventDefault();
      this.#history(e.shiftKey ? "redo" : "undo");
      return;
    }
    if (e.ctrlKey && !e.metaKey && !e.shiftKey && key === "y") {
      e.preventDefault();
      this.#history("redo");
      return;
    }
    if (command && key === "g") {
      if (!inTools() || !session.selection.length) return;
      e.preventDefault();
      if (e.shiftKey) session.unwrap();
      else session.wrap(WRAP_DEFAULT);
      return;
    }
    if (command && !e.shiftKey && ["d", "x", "c", "v"].includes(key)) {
      if (!inTools()) return;
      if (key === "v") {
        e.preventDefault();
        void this.#paste(session);
        return;
      }
      if (!session.selection.length) return;
      e.preventDefault();
      if (key === "d") session.duplicate();
      else if (key === "c") this.#toClipboard(session.copy());
      else {
        const r = session.cut();
        if (!("error" in r)) this.#toClipboard(r.text);
      }
      return;
    }
    if (command || e.shiftKey) return;
    if (e.key !== "Delete" && e.key !== "Backspace") return;
    if (!inTools() || !session.selection.length) return;
    e.preventDefault();
    session.delete();
  }

  /**
   * Write copied code to the system clipboard as `text/plain` (R-EDIT-008.C3). The designer keeps the
   * text too, for a paste where the clipboard cannot be read.
   */
  #toClipboard(text: string): void {
    this.#copied = text;
    const clipboard = typeof navigator === "undefined" ? undefined : navigator.clipboard;
    clipboard?.writeText(text).catch(() => undefined);
  }

  /**
   * Paste the clipboard's text into the session (R-EDIT-008.C5): the system clipboard's, else, when it
   * cannot be read or is empty, the text this designer copied last.
   */
  async #paste(session: DesignSession): Promise<void> {
    let text = "";
    try {
      text = (await navigator.clipboard?.readText()) ?? "";
    } catch {
      text = "";
    }
    if (!text) text = this.#copied;
    if (text && session === this.#session) session.paste(text);
  }

  /** Undo or redo one step of the session's history (R-EDIT-007.C3); nothing in Preview mode. */
  #history(which: "undo" | "redo"): void {
    if (this.mode === "preview") return;
    if (which === "undo") this.#session.undo();
    else this.#session.redo();
  }

  #onModeKey(e: KeyboardEvent): void {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = DESIGNER_MODES.indexOf(this.mode);
    this.mode = DESIGNER_MODES[(i + step + DESIGNER_MODES.length) % DESIGNER_MODES.length]!;
    (this.#root.querySelector(`[data-mode="${this.mode}"]`) as HTMLElement | null)?.focus();
  }

  // --- layout -------------------------------------------------------------------------------------

  #makeResizable(edge: HTMLElement): void {
    const side = edge.dataset.panel as "left" | "right";
    let start: { x: number; size: number } | null = null;
    edge.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      edge.setPointerCapture?.(e.pointerId);
      start = { x: e.clientX, size: this.#layout[side].size };
      edge.classList.add("mkd-designer__resizer--dragging");
    });
    edge.addEventListener("pointermove", (e) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      this.#layout[side].size = clamp(side === "left" ? start.size + dx : start.size - dx);
      this.#drawLayout();
    });
    const end = (e: PointerEvent): void => {
      if (!start) return;
      start = null;
      edge.releasePointerCapture?.(e.pointerId);
      edge.classList.remove("mkd-designer__resizer--dragging");
    };
    edge.addEventListener("pointerup", end);
    edge.addEventListener("pointercancel", end);
    edge.addEventListener("keydown", (e) => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      this.layout = { [side]: { size: this.#layout[side].size + (side === "left" ? dir : -dir) * KEY_STEP } };
    });
  }

  #drawLayout(): void {
    const preview = this.mode === "preview";
    const shown = (side: "left" | "right"): boolean => !preview && !this.#layout[side].collapsed;
    const l = shown("left") ? `${this.#layout.left.size}px ${EDGE}px ` : "";
    const r = shown("right") ? ` ${EDGE}px ${this.#layout.right.size}px` : "";
    this.#el.main.style.gridTemplateColumns = `${l}minmax(0,1fr)${r}`;
    this.#el.left.hidden = !shown("left");
    this.#el.leftEdge.hidden = !shown("left");
    this.#el.right.hidden = !shown("right");
    this.#el.rightEdge.hidden = !shown("right");
    for (const side of ["left", "right"] as const) {
      const edge = side === "left" ? this.#el.leftEdge : this.#el.rightEdge;
      edge.setAttribute("aria-valuenow", String(this.#layout[side].size));
      edge.setAttribute("aria-valuemin", String(PANEL_MIN));
      edge.setAttribute("aria-valuemax", String(PANEL_MAX));
      const toggle = this.#root.querySelector(`.mkd-designer__toggle[data-panel="${side}"]`);
      toggle?.setAttribute("aria-pressed", String(!this.#layout[side].collapsed));
    }
  }

  // --- modes --------------------------------------------------------------------------------------

  #drawMode(): void {
    const mode = this.mode;
    for (const b of this.#root.querySelectorAll<HTMLElement>(".mkd-designer__modes [role=radio]")) {
      const on = b.dataset.mode === mode;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    }
    const docked = mode === "design" && this.docked;
    this.#el.view.hidden = mode !== "design";
    this.#el.code.hidden = mode !== "code" && !docked;
    this.#el.code.classList.toggle("mkd-designer__code--docked", docked);
    this.#el.dock.hidden = mode !== "design";
    this.#el.dock.setAttribute("aria-pressed", String(this.docked));
    this.#el.preview.hidden = mode !== "preview";
    this.#el.appearance.hidden = mode !== "preview";
    for (const b of this.#root.querySelectorAll<HTMLElement>(".mkd-designer__toggle")) b.hidden = mode === "preview";
    this.#drawLayout();
    this.#drawHistory();
    if (mode === "preview") this.#drawPreviews();
    else this.#el.frames.replaceChildren();
    if (mode !== "preview") {
      this.#el.previewList.replaceChildren();
      this.#previewsFor = null;
    }
  }

  /** Preview mode (C9): every mockup read-only through a `mockitdown-mockup` with its options. */
  #drawPreviews(): void {
    if (!this.#previewsDirty && this.#previewsFor === this.#session && this.#el.frames.childElementCount) return;
    const session = this.#session;
    const doc = session.document;
    const list = this.#el.previewList;
    const frames = this.#el.frames;
    list.replaceChildren();
    frames.replaceChildren();
    for (const m of doc.mockups) {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.mockup = m.name;
      b.textContent = m.name;
      if (m.name === session.active) b.setAttribute("aria-current", "true");
      list.append(b);
      const figure = document.createElement("figure");
      figure.className = "mkd-designer__frame";
      figure.dataset.mockup = m.name;
      const caption = document.createElement("figcaption");
      caption.textContent = m.name;
      const mockup = document.createElement(MOCKUP_TAG) as HTMLElement & { code: string };
      const options = mockupOptions(doc, m.name) ?? {};
      for (const [key, value] of Object.entries(options)) {
        if (!FENCE_OPTIONS.has(key) || value === null || value === undefined) continue;
        mockup.setAttribute(key, typeof value === "string" ? value : String(value));
      }
      this.#ownAppearance.set(mockup, typeof options.appearance === "string" ? options.appearance : "");
      for (const base of ["import-base", "asset-base"]) {
        const v = this.getAttribute(base);
        if (v !== null) mockup.setAttribute(base, v);
      }
      mockup.code = m.code;
      figure.append(caption, mockup);
      frames.append(figure);
    }
    this.#previewsFor = session;
    this.#previewsDirty = false;
    this.#drawAppearance();
  }

  #drawAppearance(): void {
    for (const b of this.#el.appearance.querySelectorAll<HTMLElement>("button")) {
      b.setAttribute("aria-pressed", String(b.dataset.appearance === this.#appearance));
    }
    for (const m of this.#el.frames.querySelectorAll<HTMLElement>(MOCKUP_TAG)) {
      const own = this.#ownAppearance.get(m) ?? "";
      const value = this.#appearance ?? own;
      if (value) m.setAttribute("appearance", value);
      else m.removeAttribute("appearance");
    }
  }

  #showPreview(name: string): void {
    for (const b of this.#el.previewList.querySelectorAll<HTMLElement>("button")) {
      if (b.dataset.mockup === name) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    }
    const figure = Array.from(this.#el.frames.children).find((f) => (f as HTMLElement).dataset.mockup === name);
    if (figure && typeof (figure as HTMLElement).scrollIntoView === "function") (figure as HTMLElement).scrollIntoView({ block: "start" });
  }

  #passBases(): void {
    for (const base of ["import-base", "asset-base"]) {
      const v = this.getAttribute(base);
      const targets: Element[] = [this.#el.editor, ...this.#el.frames.querySelectorAll(MOCKUP_TAG)];
      if (base === "import-base") targets.push(this.#el.outline, this.#el.gallery);
      for (const t of targets) {
        if (v === null) t.removeAttribute(base);
        else t.setAttribute(base, v);
      }
    }
  }

  // --- toolbar and status bar ---------------------------------------------------------------------

  #drawState(): void {
    const session = this.#session;
    const name = session.active;
    // C10: the active mockup's pack and device.
    this.#el.name.textContent = name ?? "";
    const pack = name === null ? null : mockupPack(session.document, name);
    const options = name === null ? null : mockupOptions(session.document, name);
    let device = typeof options?.device === "string" ? options.device : null;
    if (device === null && pack !== null) {
      try {
        device = registry.get(pack).device;
      } catch {
        device = null;
      }
    }
    this.#el.pack.textContent = pack ?? "";
    this.#el.device.textContent = device ?? "";
    this.#el.pack.hidden = pack === null;
    this.#el.device.hidden = device === null;
    // C12: the diagnostic count and the breadcrumb of the selection.
    const count = name === null ? 0 : session.diagnostics(name).length;
    this.#el.diagnostics.textContent = `${count} diagnostic${count === 1 ? "" : "s"}`;
    // R-TOOL-009.C3: while the code does not parse, its first error.
    const error = name !== null && !session.parses(name) ? session.diagnostics(name).find((d) => d.severity === "error") : undefined;
    const line = error?.location?.line;
    this.#el.statusMessage.textContent = error ? `${line ? `Line ${line}: ` : ""}${error.message}` : "";
    const crumbs: Node[] = [];
    const tree = name === null ? null : session.tree(name);
    const sel = session.selection;
    const first = sel.length && tree ? tree.byId(sel[0]!) : null;
    const path = [];
    for (let n = first; n; n = n.parent) path.unshift(n);
    path.forEach((n, i) => {
      if (i) {
        const sep = document.createElement("span");
        sep.className = "mkd-designer__sep";
        sep.setAttribute("aria-hidden", "true");
        sep.textContent = "›";
        crumbs.push(sep);
      }
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mkd-designer__crumb";
      b.setAttribute("part", "crumb");
      b.dataset.node = n.id;
      b.textContent = n.name;
      if (i === path.length - 1) b.setAttribute("aria-current", "true");
      crumbs.push(b);
    });
    if (sel.length > 1) {
      const more = document.createElement("span");
      more.className = "mkd-designer__sep";
      more.textContent = `+${sel.length - 1}`;
      crumbs.push(more);
    }
    this.#el.breadcrumb.replaceChildren(...crumbs);
    this.#drawHistory();
  }

  /** The toolbar's Undo and Redo follow `canUndo` and `canRedo` (R-EDIT-007.C10); disabled in Preview mode. */
  #drawHistory(): void {
    const preview = this.mode === "preview";
    this.#el.undo.disabled = preview || !this.#session.canUndo;
    this.#el.redo.disabled = preview || !this.#session.canRedo;
  }
}

function structuredCloneLayout(l: DesignerLayout): DesignerLayout {
  return { left: { ...l.left }, right: { ...l.right } };
}

declare global {
  interface HTMLElementTagNameMap {
    "mockitdown-designer": DesignerElement;
  }
}
