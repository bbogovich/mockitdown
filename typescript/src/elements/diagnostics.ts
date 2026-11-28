/**
 * `<mockitdown-diagnostics>`: the diagnostics list of a design session's active mockup (R-TOOL-010,
 * A-WEB-5).
 *
 *   <mockitdown-diagnostics></mockitdown-diagnostics>
 *   <script type="module">
 *     list.session = designer.session;
 *     list.addEventListener("mockitdown-reveal", (e) => codeView.reveal(e.detail.range));
 *   </script>
 *
 * It lists the diagnostics in the session's order, each as a button (part `entry`, with
 * `data-severity` and `data-index`) holding its severity (part `severity`), message (part `message`)
 * and `line:col` (part `location`); with none it shows "No problems" (part `empty`) (C1). Activating
 * an entry by click or Enter selects the innermost node holding its location, else dispatches
 * `mockitdown-reveal` (bubbling, composed, `detail: {mockup, range: {start, end}}`) for the host to
 * reveal the place in its code view (C2); the designer does that. It redraws on every `diagnostics` and
 * `active` notification of its session (C3). The rules are `mockitdown/design`'s diagnostics.ts
 * (A-WEB-5.K2); the list joins a session as the inspector does (R-EDIT-006.C11), and only its own
 * session's notifications become its DOM events.
 *
 * Parts: `panel`, `list`, `entry`, `severity`, `message`, `location`, `empty`. Custom properties:
 * `--mkd-diagnostics-error`, `--mkd-diagnostics-warning`, `--mkd-diagnostics-hover-background`.
 */

import { newDesign } from "../design/document.js";
import { activateDiagnostic, diagnosticEntries, NO_PROBLEMS, REVEAL_EVENT } from "../design/diagnostics.js";
import { DESIGN_EVENTS, DesignSession, type DesignNotification } from "../design/session.js";

export const DIAGNOSTICS_TAG = "mockitdown-diagnostics";
export { NO_PROBLEMS, REVEAL_EVENT };
const DESIGNER_TAG = "mockitdown-designer";

const DIAGNOSTICS_CSS = `:host{display:block;font:12px/1.4 system-ui,sans-serif;color:inherit;min-width:0}
:host([hidden]){display:none}
.mkd-diagnostics{margin:0;padding:4px 0;list-style:none}
.mkd-diagnostics__entry{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:baseline;width:100%;font:inherit;color:inherit;text-align:left;background:none;border:0;padding:3px 10px;cursor:pointer}
.mkd-diagnostics__entry:hover,.mkd-diagnostics__entry:focus-visible{background:var(--mkd-diagnostics-hover-background,#eceef2);outline:none}
.mkd-diagnostics__severity{font-weight:600;text-transform:capitalize}
.mkd-diagnostics__entry[data-severity="error"] .mkd-diagnostics__severity{color:var(--mkd-diagnostics-error,#d12f2f)}
.mkd-diagnostics__entry[data-severity="warning"] .mkd-diagnostics__severity{color:var(--mkd-diagnostics-warning,#b26b00)}
.mkd-diagnostics__message{overflow-wrap:anywhere}
.mkd-diagnostics__location{font:11px/1.4 ui-monospace,monospace;opacity:.7}
.mkd-diagnostics__empty{margin:0;padding:6px 10px;opacity:.7}`;

const Base: typeof HTMLElement = (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) as typeof HTMLElement;

export class DiagnosticsElement extends Base {
  #root: ShadowRoot;
  #body: HTMLElement;
  #session: DesignSession | null = null;
  #given: DesignSession | null = null;
  #own: DesignSession | null = null;
  #unsubscribe: (() => void) | null = null;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#root.innerHTML = `<style>${DIAGNOSTICS_CSS}</style><div part="panel"></div>`;
    this.#body = this.#root.querySelector("[part=panel]")!;
    this.#body.addEventListener("click", (e) => {
      const b = (e.target as Element).closest?.(".mkd-diagnostics__entry") as HTMLElement | null;
      if (b) this.activate(Number(b.dataset.index));
    });
  }

  /** The design session whose active mockup it lists (R-EDIT-006.C11); setting it gives the host's. */
  get session(): DesignSession {
    return this.#attach();
  }

  set session(value: DesignSession | null) {
    this.#given = value instanceof DesignSession ? value : null;
    this.#attach();
  }

  /** Resolves once the list shows the session's state: it draws synchronously. */
  get rendered(): Promise<void> {
    return Promise.resolve();
  }

  /** Activate the entry at `index` (C2): select its node, or dispatch `mockitdown-reveal`. */
  activate(index: number): void {
    const target = activateDiagnostic(this.session, index);
    if (target?.kind === "code") {
      this.dispatchEvent(new CustomEvent(REVEAL_EVENT, { bubbles: true, composed: true, detail: { mockup: target.mockup, range: target.range } }));
    }
  }

  /** Focus the first entry, if any (the designer does when it opens the list). */
  override focus(options?: FocusOptions): void {
    const first = this.#body.querySelector<HTMLElement>(".mkd-diagnostics__entry");
    if (first) first.focus(options);
    else super.focus(options);
  }

  connectedCallback(): void {
    this.#attach();
    this.#draw();
  }

  #attach(): DesignSession {
    const next = this.#designerSession() ?? this.#given ?? (this.#own ??= new DesignSession(newDesign(DIAGNOSTICS_TAG)));
    if (next !== this.#session) {
      this.#unsubscribe?.();
      this.#session = next;
      this.#unsubscribe = next.subscribe((n) => this.#notified(n));
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
    if (n.kind === "active" || (n.kind === "diagnostics" && n.detail.mockup === this.#session?.active)) this.#draw();
    if (this.#session === this.#own && n.kind in DESIGN_EVENTS) {
      const type = DESIGN_EVENTS[n.kind as keyof typeof DESIGN_EVENTS];
      this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: n.detail }));
    }
  }

  #draw(): void {
    if (!this.#session) return;
    const doc = this.#root.ownerDocument ?? document;
    const entries = diagnosticEntries(this.#session);
    const focused = (this.#root.activeElement as HTMLElement | null)?.dataset?.index;
    if (!entries.length) {
      const p = doc.createElement("p");
      p.className = "mkd-diagnostics__empty";
      p.setAttribute("part", "empty");
      p.setAttribute("role", "status");
      p.textContent = NO_PROBLEMS;
      this.#body.replaceChildren(p);
      return;
    }
    const list = doc.createElement("ul");
    list.className = "mkd-diagnostics";
    list.setAttribute("part", "list");
    list.setAttribute("aria-label", "Problems");
    for (const e of entries) {
      const li = doc.createElement("li");
      const b = doc.createElement("button");
      b.type = "button";
      b.className = "mkd-diagnostics__entry";
      b.setAttribute("part", "entry");
      b.dataset.severity = e.severity;
      b.dataset.index = String(e.index);
      const part = (name: string, text: string): HTMLElement => {
        const s = doc.createElement("span");
        s.className = `mkd-diagnostics__${name}`;
        s.setAttribute("part", name);
        s.textContent = text;
        return s;
      };
      b.append(part("severity", e.severity), part("message", e.message), part("location", e.where));
      li.append(b);
      list.append(li);
    }
    this.#body.replaceChildren(list);
    if (focused !== undefined) (this.#body.querySelector(`[data-index="${focused}"]`) as HTMLElement | null)?.focus();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mockitdown-diagnostics": DiagnosticsElement;
  }
}
