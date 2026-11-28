/**
 * `<mockitdown-inspector>`: the properties of the design session's selection (R-TOOL-007, A-WEB-5).
 *
 *   <mockitdown-inspector></mockitdown-inspector>
 *   <script type="module">inspector.session = editor.session;</script>
 *
 * With one node selected it shows four groups (C1): Arguments (the element's positional parameters in
 * order, then the labelled arguments in use, with Add argument), Variant and state (`variant` with the
 * variants the element declares, and `selected`, `disabled`, `checked` and `value` where its types name
 * them), Modifiers (the chain grouped as the vocabulary groups modifiers, with Add modifier) and
 * Identity (`.id`, `.ref` and the comment). Each value is edited with the control of its type (C3): a
 * text field, a number field, a switch, a choice of the type's values, a colour field taking names and
 * `#hex`, a text field suggesting icon names, a list editor, or the value's code when the controls
 * cannot express it. A labelled argument the pack does not understand carries the note "not
 * understood by this pack" and a remove control (C7). With several nodes selected it shows their
 * number (C12); with none, the Mockup tab with the active mockup's options (C10).
 *
 * An edit is applied {@link INSPECTOR_DEBOUNCE_MS} (150 ms) after the last input in its control, or at
 * once when the control loses the focus (C8), through the model of `mockitdown/design`'s `inspect.ts`,
 * which coalesces it per node and field (R-EDIT-007.C5) and refuses a value its control cannot accept
 * or whose code would add a diagnostic at the node (C9): such a field keeps the typed text, gets
 * `aria-invalid="true"` and shows the reason (part `error`), and nothing is applied. The inspector
 * holds no editing rule of its own (A-WEB-5.K2) and joins a session as the outline does
 * (R-EDIT-006.C11); only its own session's notifications become its DOM events (C7, C8).
 *
 * When the node is derived (an `if`, a `ForEach`, a struct of the mockup) or has a value only a code
 * field shows, the header is followed by Edit in code (part `edit-in-code`, C11), which dispatches
 * `mockitdown-edit-in-code` (bubbling, composed, `detail: {mockup, node, range}`); the designer
 * switches to Code mode and reveals the range.
 *
 * Parts: `inspector`, `header`, `edit-in-code`, `tab`, `count`, `group` (with `data-group`), `heading`, `field` (with
 * `data-key`), `label`, `input`, `note`, `error`, `remove`, `modifier`, `add-argument`, `add-modifier`,
 * `add-item`. Custom properties: `--mkd-inspector-border`, `--mkd-inspector-field-background`,
 * `--mkd-inspector-label-color`, `--mkd-inspector-invalid-color`.
 */

import { assetsLoaded, evaluate } from "../core/index.js";
import { mockupOptions, newDesign } from "../design/document.js";
import {
  addArgument, addModifier, inspect, INSPECTOR_DEBOUNCE_MS, removeField, removeModifier, setField,
  type FieldResult, type Inspection, type InspectorField,
} from "../design/inspect.js";
import { DesignSession, type DesignNotification } from "../design/session.js";
import { SessionLink } from "./session-link.js";

export const INSPECTOR_TAG = "mockitdown-inspector";
/** The event Edit in code dispatches (C11): `detail: {mockup, node, range: {start, end}}`. */
export const EDIT_IN_CODE_EVENT = "mockitdown-edit-in-code";
export { INSPECTOR_DEBOUNCE_MS };

/** The headings of the vocabulary's modifier groups (R-PACK-017.C5). */
const GROUP_TITLES: Record<string, string> = {
  layout: "Layout", typography: "Typography", colour: "Colour", presentation: "Presentation", annotations: "Annotations", other: "Other",
};

const INSPECTOR_CSS = `:host{display:block;font:13px/1.4 system-ui,sans-serif;color:inherit;min-width:0}
:host([hidden]){display:none}
.mkd-inspector{padding:6px 10px 16px}
.mkd-inspector__header{display:flex;align-items:baseline;gap:6px;margin:2px 0 6px}
.mkd-inspector__header strong{font-size:14px}
.mkd-inspector__header span{opacity:.6;font:11px ui-monospace,monospace}
.mkd-inspector__tab{display:inline-block;font-weight:600;border-bottom:2px solid var(--mkd-selection-color,#ff8a00);padding:2px 0;margin:2px 0 8px}
.mkd-inspector__empty,.mkd-inspector__count{opacity:.7;margin:8px 0}
.mkd-inspector__group{border-top:1px solid var(--mkd-inspector-border,#d0d0d7);padding:6px 0 8px}
.mkd-inspector__group>h3{font-size:11px;letter-spacing:.04em;text-transform:uppercase;margin:2px 0 6px;opacity:.7;font-weight:600}
.mkd-inspector__subgroup>h4{font-size:11px;margin:6px 0 2px;opacity:.6;font-weight:600}
.mkd-inspector__modifier{border:1px solid var(--mkd-inspector-border,#d0d0d7);border-radius:6px;padding:4px 6px 6px;margin:4px 0}
.mkd-inspector__modifier-head{display:flex;align-items:center;justify-content:space-between;font:12px ui-monospace,monospace}
.mkd-inspector__field{display:flex;flex-direction:column;gap:2px;margin:4px 0}
.mkd-inspector__label{display:flex;align-items:center;justify-content:space-between;gap:4px;font-size:11px;color:var(--mkd-inspector-label-color,#6b6b76)}
.mkd-inspector__field input:not([type=checkbox]),.mkd-inspector__field select,.mkd-inspector__field textarea,.mkd-inspector__add{box-sizing:border-box;width:100%;font:inherit;color:inherit;padding:3px 6px;border:1px solid var(--mkd-inspector-border,#d0d0d7);border-radius:4px;background:var(--mkd-inspector-field-background,#fff)}
.mkd-inspector__field textarea{min-height:3.2em;resize:vertical}
.mkd-inspector__field--code input{font:12px ui-monospace,monospace}
.mkd-inspector__field [aria-invalid="true"]{border-color:var(--mkd-inspector-invalid-color,#d12f2f);outline-color:var(--mkd-inspector-invalid-color,#d12f2f)}
.mkd-inspector__error{color:var(--mkd-inspector-invalid-color,#d12f2f);font-size:11px}
.mkd-inspector__error:empty{display:none}
.mkd-inspector__note{font-size:11px;font-style:italic;color:var(--mkd-inspector-invalid-color,#b05a00)}
.mkd-inspector__remove{font:inherit;font-size:11px;color:inherit;background:none;border:0;padding:0 2px;cursor:pointer;opacity:.6}
.mkd-inspector__remove:hover{opacity:1}
.mkd-inspector__swatch{display:inline-block;width:12px;height:12px;border-radius:3px;border:1px solid var(--mkd-inspector-border,#d0d0d7);vertical-align:middle}
.mkd-inspector__colour{display:flex;align-items:center;gap:4px}
.mkd-inspector__items{display:flex;flex-direction:column;gap:2px}
.mkd-inspector__item{display:flex;gap:2px}
.mkd-inspector__add-item{font:inherit;font-size:11px;align-self:flex-start;background:none;border:1px dashed var(--mkd-inspector-border,#d0d0d7);border-radius:4px;padding:0 6px;cursor:pointer}
.mkd-inspector__add{margin-top:4px}
.mkd-inspector__code{font:inherit;font-size:12px;color:inherit;background:none;border:1px solid var(--mkd-inspector-border,#d0d0d7);border-radius:4px;padding:1px 8px;margin:0 0 6px;cursor:pointer}`;

const Base: typeof HTMLElement = (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) as typeof HTMLElement;

/** The focused control before a redraw: its field, its list item and its caret. */
interface FocusState {
  node: string | null;
  key: string;
  item: string | null;
  start: number | null;
  end: number | null;
}

/** A typed value waiting for its debounce, or refused. */
interface Pending {
  node: string | null;
  raw: unknown;
  timer: ReturnType<typeof setTimeout> | null;
  error: string | null;
}

export class InspectorElement extends Base {
  #root: ShadowRoot;
  #body: HTMLElement;
  readonly #link = new SessionLink(this, {
    own: () => new DesignSession(newDesign(INSPECTOR_TAG)),
    notified: (n) => this.#notified(n),
    leaving: () => this.flush(),
    joined: () => {
      this.#pending.clear();
      this.#draw();
    },
  });
  #view: Inspection | null = null;
  /** Typed values by field key: waiting for their debounce, or refused (C8, C9). */
  #pending = new Map<string, Pending>();
  #packCache: { key: string; pack: string | null } | null = null;
  /** Why the last Add or Remove was refused, shown under the header until the next draw of another state. */
  #notice: string | null = null;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#root.innerHTML = `<style>${INSPECTOR_CSS}</style><div class="mkd-inspector" part="inspector"></div><datalist id="mkd-icons"></datalist>`;
    this.#body = this.#root.querySelector(".mkd-inspector")!;
  }

  // --- properties ---------------------------------------------------------------------------------

  /** The design session the inspector edits (R-EDIT-006.C11); setting it makes the host's session the inspector's. */
  get session(): DesignSession {
    return this.#link.attach();
  }

  set session(value: DesignSession | null) {
    this.#link.give(value);
  }

  /** What the inspector shows now: the model of `inspect` (C1, C10, C12). */
  get inspection(): Inspection {
    return this.#view ?? inspect(this.session, this.#pack());
  }

  /** Resolves once the inspector shows the session's state: it draws synchronously. */
  get rendered(): Promise<void> {
    return Promise.resolve();
  }

  /** Apply every typed value still waiting for its debounce (C8). */
  flush(): void {
    for (const [key, p] of [...this.#pending]) {
      if (p.timer !== null) this.#commit(key);
    }
  }

  // --- lifecycle ----------------------------------------------------------------------------------

  connectedCallback(): void {
    this.#link.attach();
    this.#draw();
  }

  disconnectedCallback(): void {
    this.flush();
  }

  // --- the session --------------------------------------------------------------------------------

  #notified(n: DesignNotification): void {
    switch (n.kind) {
      case "select":
      case "active":
        // A value typed for another node or mockup is dropped once its node is no longer shown.
        for (const [key, p] of [...this.#pending]) {
          if (p.timer === null) this.#pending.delete(key);
        }
        this.#notice = null;
        this.#draw();
        break;
      case "change":
      case "diagnostics":
        // Deleting the last mockup leaves none active and notifies no `active` (R-TOOL-013.C2).
        if (n.detail.mockup === this.#link.current?.active || (n.kind === "change" && n.detail.kind === "mockups" && this.#link.current?.active === null)) this.#draw();
        break;
      case "rename":
        this.#draw();
        break;
    }
    this.#link.forward(n);
  }

  /** The pack the active mockup renders in: the one its evaluation selects, else its document pack. */
  #pack(): string | null {
    const session = this.session;
    const name = session.active;
    if (name === null) return null;
    const options = mockupOptions(session.document, name) ?? {};
    const code = session.code(name) ?? "";
    const key = `${JSON.stringify(options)}\n${code}`;
    if (this.#packCache?.key === key) return this.#packCache.pack;
    let pack = typeof options.pack === "string" ? options.pack : null;
    if (assetsLoaded()) {
      try {
        pack = evaluate(code, { ...options, edit: true }).screen?.pack.id ?? pack;
      } catch {
        /* the document's pack */
      }
    }
    this.#packCache = { key, pack };
    return pack;
  }

  // --- editing ------------------------------------------------------------------------------------

  /** A control's input: kept as typed, applied after the debounce (C8). */
  #input(field: InspectorField, raw: unknown): void {
    const p = this.#pending.get(field.key);
    if (p?.timer) clearTimeout(p.timer);
    const node = this.session.selection[0] ?? null;
    const timer = setTimeout(() => this.#commit(field.key), INSPECTOR_DEBOUNCE_MS);
    this.#pending.set(field.key, { node, raw, timer, error: p?.error ?? null });
  }

  /** Apply a typed value now, to the field of that key the selection shows now. */
  #commit(key: string): void {
    const p = this.#pending.get(key);
    if (!p) return;
    if (p.timer) clearTimeout(p.timer);
    p.timer = null;
    const view = inspect(this.session, this.#pack());
    if ((view.node?.id ?? null) !== p.node) {
      this.#pending.delete(key);
      return;
    }
    const field = allFields(view).find((f) => f.key === key);
    if (!field) {
      this.#pending.delete(key);
      return;
    }
    const r = setField(this.session, field, p.raw);
    this.#settle(key, r, p);
  }

  #settle(key: string, r: FieldResult, p?: Pending): void {
    if (r.ok) this.#pending.delete(key);
    else this.#pending.set(key, { node: p?.node ?? this.session.selection[0] ?? null, raw: p?.raw ?? null, timer: null, error: r.error });
    this.#draw();
  }

  /** An Add or Remove: applied at once; a refusal is shown with the field, else under the header. */
  #now(key: string, run: () => FieldResult): void {
    this.#pending.delete(key);
    this.#notice = null;
    const r = run();
    if (!r.ok) {
      if (this.#view && allFields(this.#view).some((f) => f.key === key)) {
        this.#pending.set(key, { node: this.session.selection[0] ?? null, raw: null, timer: null, error: r.error });
      } else this.#notice = r.error;
    }
    this.#draw();
  }

  // --- drawing ------------------------------------------------------------------------------------

  #draw(): void {
    if (!this.#link.current) return;
    const view = inspect(this.#link.current, this.#pack());
    this.#view = view;
    const focus = this.#focusState();
    const doc = this.#body.ownerDocument;
    const out: Node[] = [];
    if (view.view === "empty") {
      out.push(el(doc, "p", { class: "mkd-inspector__empty" }, "No mockup"));
    } else if (view.view === "multiple") {
      out.push(el(doc, "p", { class: "mkd-inspector__count", part: "count" }, `${view.count} selected`));
    } else if (view.view === "mockup") {
      out.push(el(doc, "div", { class: "mkd-inspector__tab", part: "tab", role: "heading", "aria-level": "2" }, "Mockup"));
      const group = this.#group(doc, "mockup", null);
      for (const f of view.options) group.append(this.#field(doc, f));
      out.push(group);
    } else if (view.node) {
      const header = el(doc, "div", { class: "mkd-inspector__header", part: "header" });
      header.append(el(doc, "strong", {}, view.node.name), el(doc, "span", {}, view.node.ordinal));
      out.push(header);
      if (view.editInCode) {
        // C11: the host (the designer) switches to Code mode and reveals the span.
        const range = { ...view.editInCode };
        const detail = { mockup: view.mockup, node: view.node.id, range };
        const button = el(doc, "button", { type: "button", class: "mkd-inspector__code", part: "edit-in-code" }, "Edit in code");
        button.addEventListener("click", () => this.dispatchEvent(new CustomEvent(EDIT_IN_CODE_EVENT, { bubbles: true, composed: true, detail })));
        out.push(button);
      }
      if (this.#notice) out.push(el(doc, "p", { class: "mkd-inspector__error", part: "error", role: "alert" }, this.#notice));
      if (view.node.kind !== "if") {
        const args = this.#group(doc, "arguments", "Arguments");
        for (const f of view.arguments) args.append(this.#field(doc, f));
        if (view.addArguments.length) args.append(this.#adder(doc, "add-argument", "Add argument…", view.addArguments, (label) => addArgument(this.session, label, view.pack)));
        out.push(args);
        const state = this.#group(doc, "state", "Variant and state");
        for (const f of view.state) state.append(this.#field(doc, f));
        if (!view.state.length) state.append(el(doc, "p", { class: "mkd-inspector__empty" }, "None for this element"));
        out.push(state);
        const mods = this.#group(doc, "modifiers", "Modifiers");
        for (const g of view.modifiers) {
          const sub = el(doc, "div", { class: "mkd-inspector__subgroup", "data-modifier-group": g.group });
          sub.append(el(doc, "h4", {}, GROUP_TITLES[g.group] ?? g.group));
          for (const m of g.modifiers) {
            const box = el(doc, "div", { class: "mkd-inspector__modifier", part: "modifier", "data-modifier": m.name, "data-index": String(m.index) });
            const head = el(doc, "div", { class: "mkd-inspector__modifier-head" });
            const remove = el(doc, "button", { type: "button", class: "mkd-inspector__remove", part: "remove", "aria-label": `Remove .${m.name}` }, "Remove");
            remove.addEventListener("click", () => this.#now(`modifier:${m.name}:${m.index}`, () => removeModifier(this.session, m.name, m.index)));
            head.append(el(doc, "span", {}, `.${m.name}`), remove);
            box.append(head);
            for (const f of m.fields) box.append(this.#field(doc, f));
            sub.append(box);
          }
          mods.append(sub);
        }
        if (view.addModifiers.length) mods.append(this.#adder(doc, "add-modifier", "Add modifier…", view.addModifiers, (name) => addModifier(this.session, name)));
        out.push(mods);
      }
      const identity = this.#group(doc, "identity", "Identity");
      for (const f of view.identity) identity.append(this.#field(doc, f));
      out.push(identity);
    }
    this.#body.replaceChildren(...out);
    const list = this.#root.getElementById("mkd-icons");
    if (list && !list.childElementCount) {
      const icons = allFields(view).find((f) => f.control === "icon")?.choices ?? [];
      for (const name of icons) list.append(el(doc, "option", { value: name }));
    }
    this.#restoreFocus(focus, view);
  }

  #group(doc: Document, name: string, title: string | null): HTMLElement {
    const g = el(doc, "section", { class: "mkd-inspector__group", part: "group", "data-group": name });
    if (title) g.append(el(doc, "h3", { part: "heading" }, title));
    return g;
  }

  #adder(doc: Document, part: string, prompt: string, options: readonly string[], run: (value: string) => FieldResult): HTMLElement {
    const s = el(doc, "select", { class: "mkd-inspector__add", part, "aria-label": prompt.replace("…", "") }) as HTMLSelectElement;
    s.append(el(doc, "option", { value: "" }, prompt));
    for (const o of options) s.append(el(doc, "option", { value: o }, part === "add-modifier" ? `.${o}` : o));
    s.addEventListener("change", () => {
      const v = s.value;
      if (v) this.#now(`${part}:${v}`, () => run(v));
    });
    return s;
  }

  /** One field: its label, note and remove control, its control, and its error (C3, C7, C9). */
  #field(doc: Document, f: InspectorField): HTMLElement {
    const pending = this.#pending.get(f.key);
    const wrap = el(doc, "div", { class: `mkd-inspector__field mkd-inspector__field--${f.control}`, part: "field", "data-key": f.key, "data-control": f.control });
    const id = `f-${f.key.replace(/[^A-Za-z0-9_-]/g, "_")}`;
    const label = el(doc, "div", { class: "mkd-inspector__label", part: "label" });
    label.append(el(doc, "label", { for: id }, f.label));
    if (f.removable && f.present) {
      const rm = el(doc, "button", { type: "button", class: "mkd-inspector__remove", part: "remove", "aria-label": `Remove ${f.label}` }, "Remove");
      rm.addEventListener("click", () => this.#now(f.key, () => removeField(this.session, f)));
      label.append(rm);
    }
    wrap.append(label);
    if (f.note) wrap.append(el(doc, "span", { class: "mkd-inspector__note", part: "note" }, f.note));
    const shown = pending && pending.raw !== null ? pending.raw : f.value;
    const control = this.#control(doc, f, id, shown);
    wrap.append(control);
    const error = el(doc, "span", { class: "mkd-inspector__error", part: "error", id: `${id}-error`, role: "alert" }, pending?.error ?? "");
    wrap.append(error);
    if (pending?.error) {
      for (const input of wrap.querySelectorAll("input,select,textarea")) {
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", `${id}-error`);
      }
    }
    return wrap;
  }

  #control(doc: Document, f: InspectorField, id: string, value: unknown): HTMLElement {
    const text = value === null || value === undefined ? "" : Array.isArray(value) ? "" : String(value);
    const blur = (): void => {
      if (this.#pending.get(f.key)?.timer) this.#commit(f.key);
    };
    switch (f.control) {
      case "readonly":
        return el(doc, "output", { id, part: "input" }, text);
      case "switch": {
        const c = el(doc, "input", { id, type: "checkbox", role: "switch", part: "input" }) as HTMLInputElement;
        c.checked = value === true || value === "true";
        c.addEventListener("change", () => this.#input(f, c.checked));
        return c;
      }
      case "choice": {
        const s = el(doc, "select", { id, part: "input" }) as HTMLSelectElement;
        const choices = [...(f.choices ?? [])];
        if (text && !choices.includes(text)) choices.push(text);
        for (const c of choices) s.append(el(doc, "option", { value: c }, c === "" ? "(default)" : c));
        s.value = text;
        s.addEventListener("change", () => this.#input(f, s.value));
        s.addEventListener("blur", blur);
        return s;
      }
      case "comment": {
        const t = el(doc, "textarea", { id, part: "input" }) as HTMLTextAreaElement;
        t.value = text;
        t.addEventListener("input", () => this.#input(f, t.value));
        t.addEventListener("blur", blur);
        return t;
      }
      case "list": {
        const items = el(doc, "div", { class: "mkd-inspector__items", id, role: "list", part: "input" });
        const values = Array.isArray(value) ? [...value as unknown[]].map(String) : [];
        const read = (): string[] => [...items.querySelectorAll<HTMLInputElement>("input")].map((i) => i.value);
        const row = (v: string, i: number): HTMLElement => {
          const r = el(doc, "div", { class: "mkd-inspector__item", role: "listitem" });
          const input = el(doc, "input", { type: "text", "data-item": String(i), "aria-label": `${f.label} ${i + 1}` }) as HTMLInputElement;
          input.value = v;
          input.addEventListener("input", () => this.#input(f, read()));
          input.addEventListener("blur", blur);
          const rm = el(doc, "button", { type: "button", class: "mkd-inspector__remove", part: "remove", "aria-label": `Remove ${f.label} ${i + 1}` }, "×");
          rm.addEventListener("click", () => {
            const next = read();
            next.splice(i, 1);
            this.#now(f.key, () => setField(this.session, f, next));
          });
          r.append(input, rm);
          return r;
        };
        values.forEach((v, i) => items.append(row(v, i)));
        const add = el(doc, "button", { type: "button", class: "mkd-inspector__add-item", part: "add-item" }, "Add item");
        add.addEventListener("click", () => {
          const r = row("", items.querySelectorAll("input").length);
          items.insertBefore(r, add);
          (r.querySelector("input") as HTMLInputElement).focus();
        });
        items.append(add);
        return items;
      }
      default: {
        const input = el(doc, "input", { id, type: "text", part: "input", spellcheck: "false" }) as HTMLInputElement;
        input.value = text;
        if (f.control === "number") input.inputMode = "decimal";
        if (f.control === "icon") input.setAttribute("list", "mkd-icons");
        if (f.control === "color") input.placeholder = "name or #hex";
        input.addEventListener("input", () => this.#input(f, input.value));
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") blur();
        });
        input.addEventListener("blur", blur);
        if (f.control !== "color") return input;
        const box = el(doc, "div", { class: "mkd-inspector__colour" });
        const swatch = el(doc, "span", { class: "mkd-inspector__swatch", "aria-hidden": "true" });
        swatch.style.background = text;
        box.append(swatch, input);
        return box;
      }
    }
  }

  /** The focused control before a redraw: its field, its list item and its caret. */
  #focusState(): FocusState | null {
    const active = this.#root.activeElement as HTMLElement | null;
    const field = active?.closest?.("[data-key]") as HTMLElement | null;
    if (!active || !field) return null;
    const input = active as HTMLInputElement;
    let start: number | null = null;
    let end: number | null = null;
    try {
      start = input.selectionStart ?? null;
      end = input.selectionEnd ?? null;
    } catch {
      /* a control without a caret */
    }
    return { node: this.#view?.node?.id ?? null, key: field.dataset.key!, item: active.dataset.item ?? null, start, end };
  }

  /** After a redraw, the same control of the same node gets the focus and the caret back. */
  #restoreFocus(state: FocusState | null, view: Inspection): void {
    if (!state || (view.node?.id ?? null) !== state.node) return;
    const field = [...this.#body.querySelectorAll<HTMLElement>("[data-key]")].find((x) => x.dataset.key === state.key);
    if (!field) return;
    const target = (state.item !== null
      ? field.querySelector(`[data-item="${state.item}"]`)
      : field.querySelector("input,select,textarea")) as HTMLInputElement | null;
    if (!target) return;
    target.focus();
    if (state.start !== null && typeof target.setSelectionRange === "function") {
      try {
        target.setSelectionRange(state.start, state.end ?? state.start);
      } catch {
        /* not a text control */
      }
    }
  }
}

function allFields(view: Inspection): InspectorField[] {
  return [...view.arguments, ...view.state, ...view.modifiers.flatMap((g) => g.modifiers.flatMap((m) => m.fields)), ...view.identity, ...view.options];
}

function el(doc: Document, tag: string, attrs: Record<string, string> = {}, text?: string): HTMLElement {
  const e = doc.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text !== undefined) e.textContent = text;
  return e;
}

declare global {
  interface HTMLElementTagNameMap {
    "mockitdown-inspector": InspectorElement;
  }
}
