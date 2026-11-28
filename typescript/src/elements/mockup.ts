/**
 * `<mockitdown-mockup>`: a mockup embedded in an HTML page (R-WEB-002, A-WEB-2).
 *
 *   <mockitdown-mockup pack="mui" device="phone" import-base="mockups/">
 *     <script type="text/mockitdown">
 *       VStack { Text("a < b && c > d") }
 *     </script>
 *   </mockitdown-mockup>
 *
 * The code is the text of the first `<script type="text/mockitdown">` child (ADR-19): the HTML
 * parser leaves a script's text untouched, so `<`, `>` and `&` need no escaping. The one sequence a
 * page cannot carry inside it is `</script` (it ends the script element); set such code through the
 * `code` property instead (R-WEB-002.C9). Other children are ignored and never shown.
 *
 * Attributes: the fence attributes (`pack`, `device`, `appearance`, `chrome`, `title`, `id`, `url`,
 * `width`, `height`, `caption`, `elements`, `source`, `window`, `windowed`, `menubar`, `app`) with the fence's
 * meanings, plus `import-base` and `asset-base` (URLs, default: the document's base URL) and the boolean `edit`,
 * which renders with the `edit` option (R-EDIT-004: `data-mkd-node` and `data-mkd-derived` on role roots;
 * R-WEB-002.C13) and, like the base URLs, is no fence attribute. A boolean attribute
 * present without a value is true, and so is `menubar` (R-DEV-009.C1). Note that `id` and `title` are also global HTML attributes: they
 * set the figure's id and title (and its caption) as well as the element's id and tooltip.
 *
 * The element renders into an open shadow root: the stylesheet of the packs used (one constructed
 * `CSSStyleSheet` per pack set, shared by every element through `adoptedStyleSheets`; a `<style>`
 * where constructed sheets are missing) and the rendered HTML. It re-renders when an attribute or
 * the script text changes, shows diagnostics in the error box as the Python fence does and
 * dispatches a bubbling, composed `mockitdown-diagnostics` event with `detail.diagnostics`.
 */

import {
  assetsLoaded, coerceFenceOptions, Diagnostic, errorHtml, evaluate, FENCE_OPTIONS, Location, parseBool, render, stylesheet,
  type Evaluation, type RenderResult,
} from "../core/index.js";
import { loadAssetsFromUrl } from "./assets.js";

export const MOCKUP_TAG = "mockitdown-mockup";
/** The `type` of the script child that holds the code. */
export const SCRIPT_TYPE = "text/mockitdown";
/** The attributes the element observes: the fence attributes, then the two base URLs and `edit`. */
export const MOCKUP_ATTRIBUTES: readonly string[] = [...FENCE_OPTIONS.keys(), "import-base", "asset-base", "edit"];
/** The event dispatched after a render that produced diagnostics. */
export const DIAGNOSTICS_EVENT = "mockitdown-diagnostics";

/** Rounds of fetching imports before a render gives up waiting for more (nested imports). */
const MAX_IMPORT_ROUNDS = 32;

/**
 * The code of a script child's text: a first line holding only whitespace (the line break after
 * `<script …>`) and a last line holding only whitespace (the indentation before `</script>`) are
 * dropped, then the leading whitespace common to every non-blank line is removed and blank lines are
 * emptied (Python's `textwrap.dedent`). The result is what a Markdown fence holding the same lines
 * passes to the renderer.
 */
export function scriptCode(text: string): string {
  let lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (lines.length > 1 && lines[0]!.trim() === "") lines = lines.slice(1);
  if (lines.length > 1 && lines[lines.length - 1]!.trim() === "") lines = lines.slice(0, -1);
  else if (lines.length === 1 && lines[0]!.trim() === "") return "";
  let margin: string | null = null;
  for (const line of lines) {
    if (line.trim() === "") continue;
    const indent = /^[ \t]*/.exec(line)![0];
    if (margin === null) margin = indent;
    else {
      let i = 0;
      while (i < margin.length && i < indent.length && margin[i] === indent[i]) i++;
      margin = margin.slice(0, i);
    }
  }
  const cut = margin ? margin.length : 0;
  return lines.map((line) => (line.trim() === "" ? "" : line.slice(cut))).join("\n");
}

/**
 * The pack stylesheet adapted to a shadow root. The token rules select the page (`body`, or an
 * ancestor with Material's `data-md-color-scheme`) to let `appearance: auto` follow it; a shadow
 * root has no such ancestors, so they are rewritten to `:host` and `:host-context(…)`.
 */
export function shadowCss(css: string): string {
  return css
    .replace(/body:not\(\[data-md-color-scheme\]\)\s+/g, ":host ")
    .replace(/\[data-md-color-scheme="slate"\]\s+(?=\.mkd-pack-)/g, ':host-context([data-md-color-scheme="slate"]) ');
}

const HOST_CSS = ":host{display:block}:host([hidden]){display:none}";

/** Fetched import files by absolute URL: their text, or null when the fetch failed. */
const importTexts = new Map<string, string | null>();
const importFetches = new Map<string, Promise<void>>();

function fetchImport(url: string): Promise<void> {
  let p = importFetches.get(url);
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(url);
        importTexts.set(url, res.ok ? await res.text() : null);
      } catch {
        importTexts.set(url, null);
      }
    })();
    importFetches.set(url, p);
  }
  return p;
}

/** Forget the fetched import files, so that the next render fetches them again. */
export function clearImportCache(): void {
  importTexts.clear();
  importFetches.clear();
}

const constructable = typeof CSSStyleSheet !== "undefined" && "replaceSync" in CSSStyleSheet.prototype
  && typeof ShadowRoot !== "undefined" && "adoptedStyleSheets" in ShadowRoot.prototype;
/** One constructed sheet per pack set: [css text, sheet]. */
const sheets = new Map<string, [string, CSSStyleSheet]>();
let hostSheet: CSSStyleSheet | null = null;

function sheetFor(packs: readonly string[], css: string): CSSStyleSheet {
  const key = packs.join(",");
  const hit = sheets.get(key);
  if (hit) {
    if (hit[0] !== css) {
      hit[1].replaceSync(css);
      hit[0] = css;
    }
    return hit[1];
  }
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  sheets.set(key, [css, sheet]);
  return sheet;
}

function directoryUrl(href: string): string {
  return href.endsWith("/") ? href : href + "/";
}

/** The base URLs of an element (R-WEB-002.C3): its `import-base` (a directory URL) and `asset-base`, default the document's. */
export function baseUrls(el: Element): { importBase: string; assetBase: string } {
  const base = document.baseURI;
  const importAttr = el.getAttribute("import-base");
  const importBase = importAttr !== null ? directoryUrl(new URL(importAttr, base).href) : base;
  const assetAttr = el.getAttribute("asset-base");
  const assetBase = assetAttr !== null ? new URL(assetAttr, base).href : new URL(".", base).href;
  return { importBase, assetBase };
}

/**
 * Run `run` (a render or an evaluation) with imports fetched from `importBase`. The core resolves
 * imports synchronously: run, fetch the import files it asked for and did not have, and run again
 * until it asks for nothing new. Null when `stale()` turned true while fetching.
 */
async function withImports<T>(
  run: (resolver: (path: string) => string | null | undefined) => T, importBase: string, stale: () => boolean,
): Promise<T | null> {
  let result: T | null = null;
  for (let round = 0; round < MAX_IMPORT_ROUNDS; round++) {
    const missing = new Set<string>();
    result = run((path: string) => {
      const url = new URL(path, importBase).href;
      if (importTexts.has(url)) return importTexts.get(url);
      missing.add(url);
      return null;
    });
    if (!missing.size) break;
    await Promise.all([...missing].map(fetchImport));
    if (stale()) return null;
  }
  return result;
}

/**
 * Render code with imports fetched from `importBase` and images resolved against `assetBase`
 * ({@link withImports}). Null when `stale()` turned true while fetching.
 */
export function renderWithImports(
  code: string, options: Record<string, unknown>, importBase: string, assetBase: string, stale: () => boolean = () => false,
): Promise<RenderResult | null> {
  return withImports((resolver) => render(code, { ...options, asset_base: assetBase, import_resolver: resolver }), importBase, stale);
}

/**
 * Evaluate code (the view tree, without rendering) with imports fetched from `importBase`, as
 * {@link renderWithImports} renders it: the design tools that show the views of a rendering (the
 * outline, R-TOOL-002.C2) evaluate with the same options. Null when `stale()` turned true while fetching.
 */
export function evaluateWithImports(
  code: string, options: Record<string, unknown>, importBase: string, stale: () => boolean = () => false,
): Promise<Evaluation | null> {
  return withImports((resolver) => evaluate(code, { ...options, import_resolver: resolver }), importBase, stale);
}

/**
 * Put rendered HTML into a shadow root with the stylesheet of its packs (shared constructed sheets
 * where the browser has them, else a `<style>`), plus `extraCss` (the element's own rules); `wrap` turns
 * the rendered HTML into what the root holds (the editor adds its view container and overlay layer).
 */
export function showInShadow(root: ShadowRoot, packs: readonly string[], html: string, extraCss = "", wrap?: (html: string) => string): void {
  let css = "";
  try {
    css = shadowCss(stylesheet(packs));
  } catch {
    // no assets: the error box shows the reason, unstyled
  }
  const body = wrap ? wrap(html) : html;
  if (constructable) {
    hostSheet ??= (() => {
      const s = new CSSStyleSheet();
      s.replaceSync(HOST_CSS);
      return s;
    })();
    const own = extraCss ? [extraSheet(extraCss)] : [];
    root.adoptedStyleSheets = css ? [hostSheet, sheetFor(packs, css), ...own] : [hostSheet, ...own];
    root.innerHTML = body;
  } else {
    root.innerHTML = `<style>${HOST_CSS}${css}${extraCss}</style>${body}`;
  }
}

const extraSheets = new Map<string, CSSStyleSheet>();
function extraSheet(css: string): CSSStyleSheet {
  let sheet = extraSheets.get(css);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    extraSheets.set(css, sheet);
  }
  return sheet;
}

// In Node (or any host without custom elements) the class is defined over a stand-in, so the package
// entry can be imported there; it is only registered where `customElements` exists.
const Base: typeof HTMLElement = (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) as typeof HTMLElement;

export class MockupElement extends Base {
  static get observedAttributes(): string[] {
    return [...MOCKUP_ATTRIBUTES];
  }

  #root: ShadowRoot;
  #observer: MutationObserver | null = null;
  #diagnostics: Diagnostic[] = [];
  #generation = 0;
  #dirty = true;
  #queued = false;
  #running = false;
  #renderedOnce = false;
  #waiters: (() => void)[] = [];

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
  }

  /** The code: the dedented text of the script child (see {@link scriptCode}); "" without one. */
  get code(): string {
    const script = this.#script();
    return script ? scriptCode(script.textContent ?? "") : "";
  }

  /** Replace the script child's text (creating the child when there is none) and re-render. */
  set code(value: string) {
    let script = this.#script();
    if (!script) {
      script = document.createElement("script");
      script.type = SCRIPT_TYPE;
      this.append(script);
    }
    script.textContent = String(value);
    this.#observer?.takeRecords();
    this.#schedule();
  }

  /** The last render's diagnostics (the render's, then the attribute problems). */
  get diagnostics(): Diagnostic[] {
    return [...this.#diagnostics];
  }

  /**
   * A promise that resolves after the next render — the one a change made so far has scheduled — or
   * at once when the element is connected, rendered and up to date. It never rejects.
   */
  get rendered(): Promise<void> {
    if (this.#observer && this.#observer.takeRecords().length) this.#schedule();
    if (this.#renderedOnce && !this.#dirty && !this.#running && !this.#queued) return Promise.resolve();
    return new Promise((resolve) => this.#waiters.push(resolve));
  }

  connectedCallback(): void {
    if (!this.#observer) {
      this.#observer = new MutationObserver(() => this.#schedule());
    }
    this.#observer.observe(this, { childList: true, characterData: true, subtree: true });
    this.#schedule();
  }

  disconnectedCallback(): void {
    this.#observer?.disconnect();
  }

  attributeChangedCallback(_name: string, old: string | null, value: string | null): void {
    if (old !== value) this.#schedule();
  }

  #script(): HTMLScriptElement | null {
    for (const child of Array.from(this.children)) {
      if (child.localName === "script" && (child.getAttribute("type") ?? "").trim().toLowerCase() === SCRIPT_TYPE) {
        return child as HTMLScriptElement;
      }
    }
    return null;
  }

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
    let html: string;
    let packs: string[] = [];
    let diagnostics: Diagnostic[];
    try {
      if (!assetsLoaded()) await loadAssetsFromUrl();
      if (stale()) return;
      const raw: Record<string, string> = {};
      for (const name of FENCE_OPTIONS.keys()) {
        const value = this.getAttribute(name);
        if (value === null) continue;
        raw[name] = value === "" && FENCE_OPTIONS.get(name) === "bool" ? "true" : value;
      }
      const [typed, problems] = coerceFenceOptions(raw);
      const { importBase, assetBase } = baseUrls(this);
      const editAttr = this.getAttribute("edit");
      const edit = editAttr !== null && (editAttr === "" || parseBool(editAttr));
      const result = await renderWithImports(this.code, { ...typed, edit }, importBase, assetBase, stale);
      if (result === null) return;
      const fence = problems.map((p) => new Diagnostic("error", p, new Location(), "fence"));
      diagnostics = [...result.diagnostics, ...fence];
      html = (fence.length ? errorHtml(fence) : "") + result.html;
      packs = result.packs;
    } catch (e) {
      if (stale()) return;
      const message = e instanceof Error ? e.message : String(e);
      diagnostics = [new Diagnostic("error", `cannot render: ${message}`, new Location(), "element")];
      html = errorHtml(diagnostics);
    }
    if (stale()) return;
    this.#show(packs, html);
    this.#diagnostics = diagnostics;
    this.#renderedOnce = true;
    if (diagnostics.length) {
      this.dispatchEvent(new CustomEvent(DIAGNOSTICS_EVENT, {
        bubbles: true, composed: true, detail: { diagnostics: [...diagnostics] },
      }));
    }
  }

  #show(packs: readonly string[], html: string): void {
    showInShadow(this.#root, packs, html);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mockitdown-mockup": MockupElement;
  }
}
