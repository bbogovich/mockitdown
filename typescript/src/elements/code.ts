/**
 * `<mockitdown-code>`: the code view, a light editor for mockitdown code (R-TOOL-008, A-WEB-5).
 *
 *   <mockitdown-code></mockitdown-code>
 *   <script type="module">
 *     code.value = source;
 *     code.diagnostics = check(source);
 *     code.addEventListener("input", () => preview(code.value));
 *     code.reveal({ start: 12, end: 18 });
 *   </script>
 *
 * A plain `<textarea>` whose text is transparent lies over a copy of the text coloured from the core
 * lexer's tokens ({@link highlight}: keywords, element and type names, identifiers, modifiers, members,
 * strings, numbers, comments, punctuation and what the lexer cannot read), re-coloured on every change
 * (C2). A gutter numbers the lines (C3) and marks each line holding a diagnostic with its severity's
 * colour and the messages as its tooltip; the messages of the caret's line are shown as text in the
 * `message` part, which the text area names as its description (C4). With the caret next to a bracket
 * that bracket and its match are highlighted; an unmatched bracket is always marked (C5). Enter keeps
 * the line's indentation and adds one unit after a line ending in `{` or `(`; `}` typed first on a line
 * removes one unit; Tab and Shift+Tab indent and outdent the selected lines (Tab with no selection
 * inserts one unit); Esc then Tab or Shift+Tab moves the focus out (C6). The unit is the source's
 * (R-EDIT-002.C11). Every change by the user reaches the host as one bubbling, composed `input` event
 * per keystroke or command (C7): the text area's own for typing, and for the editing keys one the view
 * dispatches after the browser's (held back); setting `value` dispatches none. The editing keys go
 * through `document.execCommand("insertText")`, so the browser's own undo keeps them; where it is
 * refused the text is replaced with `setRangeText`.
 *
 * For the design tools (R-TOOL-009, joined to a session by `CodeSync` of `mockitdown/design`, which holds
 * the rules): `applyEdits(edits)` applies another component's text edits, keeping the caret and the
 * scroll position outside the edited ranges and dispatching no `input` event; `mark(range)` marks a
 * range (part `span`) behind the text without moving the focus, scrolling it into view; and a
 * `mockitdown-caret` event (bubbling, composed, `detail: {start, end}`) tells that the pointer or a
 * navigation key (arrows, Home, End, Page Up, Page Down) moved the caret.
 *
 * It imports only the core lexer: no editor library, no other component of the package, no find and
 * replace, folding or multiple cursors (C8).
 *
 * Attributes: `readonly` (the text cannot be changed; mirrored by `readOnly`), `appearance` (`light`,
 * `dark`, or the page's preference). Parts: `code`, `gutter`, `line` (with `data-line`, and
 * `data-severity` on a line holding a diagnostic), `highlight`, `mark`, `span`, `text`, `message`. Custom properties:
 * `--mkd-code-font`, `--mkd-code-background`, `--mkd-code-color`, `--mkd-code-gutter-background`,
 * `--mkd-code-gutter-color`, `--mkd-code-keyword`, `--mkd-code-name`, `--mkd-code-ident`,
 * `--mkd-code-modifier`, `--mkd-code-member`, `--mkd-code-string`, `--mkd-code-number`,
 * `--mkd-code-comment`, `--mkd-code-punct`, `--mkd-code-error`, `--mkd-code-warning`,
 * `--mkd-code-match`, `--mkd-code-selection`, `--mkd-code-span`; each colour has a light and a dark default.
 */

import { highlight, indentUnit, type Highlight } from "../core/syntax/lexer.js";

export const CODE_TAG = "mockitdown-code";
/** The attributes the code view observes. */
export const CODE_ATTRIBUTES: readonly string[] = ["readonly"];

/** The event the code view dispatches when the pointer or a navigation key moved the caret. */
export const CODE_CARET_EVENT = "mockitdown-caret";
/** The keys whose release reports a caret move. */
const NAVIGATION_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"]);

/** A text edit as `applyEdits` takes it: replace `[start, end)` of the current text with `text`. */
export interface CodeEdit {
  start: number;
  end: number;
  text: string;
}

/** A diagnostic as the code view reads it: the core's `Diagnostic`, or any object with these fields. */
export interface CodeDiagnostic {
  severity: string;
  message: string;
  location?: { line: number; col?: number };
  line?: number;
}

/** A range of the text: UTF-16 offsets, end exclusive. */
export interface CodeRange {
  start: number;
  end: number;
}

const OPEN: Readonly<Record<string, string>> = { "(": ")", "{": "}", "[": "]" };
const CLOSE: Readonly<Record<string, string>> = { ")": "(", "}": "{", "]": "[" };

const LIGHT = `--_bg:#fff;--_fg:#1f2328;--_gbg:#f6f7f9;--_gfg:#8a8f98;--_kw:#a626a4;--_name:#0b5cad;--_ident:#1f2328;
--_mod:#8250df;--_mem:#0a7f7f;--_str:#2f7d32;--_num:#b35900;--_com:#6e7781;--_punct:#57606a;--_err:#d12f2f;--_warn:#b07800;
--_match:rgba(255,170,0,.35);--_sel:rgba(64,128,255,.28);--_span:rgba(255,138,0,.14)`;
const DARK = `--_bg:#1e1f22;--_fg:#d4d7dd;--_gbg:#25262a;--_gfg:#6f747d;--_kw:#d68cf0;--_name:#6cb6ff;--_ident:#d4d7dd;
--_mod:#c4a7ff;--_mem:#56d4d4;--_str:#8fd68f;--_num:#f0a35e;--_com:#8b929b;--_punct:#a0a6ae;--_err:#ff6b6b;--_warn:#e3b341;
--_match:rgba(255,190,60,.3);--_sel:rgba(90,150,255,.35);--_span:rgba(255,160,40,.18)`;

const CODE_CSS = `:host{display:block;height:18em;min-height:3em;${LIGHT}}
@media (prefers-color-scheme:dark){:host(:not([appearance=light])){${DARK}}}
:host([appearance=dark]){${DARK}}
:host([hidden]){display:none}
.mkd-code{display:flex;height:100%;box-sizing:border-box;font:var(--mkd-code-font,12px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace);
background:var(--mkd-code-background,var(--_bg));color:var(--mkd-code-color,var(--_fg));overflow:hidden}
.mkd-code__wrap{display:flex;flex-direction:column;height:100%}
.mkd-code__gutter{flex:none;overflow:hidden;background:var(--mkd-code-gutter-background,var(--_gbg));color:var(--mkd-code-gutter-color,var(--_gfg));
text-align:right;user-select:none;-webkit-user-select:none;min-width:2.5em}
.mkd-code__lines{padding:8px 0}
.mkd-code__line{padding:0 8px 0 10px;border-left:3px solid transparent;white-space:pre}
.mkd-code__line[data-severity=error]{border-left-color:var(--mkd-code-error,var(--_err));color:var(--mkd-code-error,var(--_err));font-weight:600}
.mkd-code__line[data-severity=warning]{border-left-color:var(--mkd-code-warning,var(--_warn));color:var(--mkd-code-warning,var(--_warn))}
.mkd-code__body{position:relative;flex:1;min-width:0;overflow:hidden}
.mkd-code__highlight,.mkd-code__mark,.mkd-code__text{margin:0;padding:8px 10px;border:0;font:inherit;letter-spacing:inherit;white-space:pre;tab-size:4;
box-sizing:border-box;word-wrap:normal;overflow-wrap:normal}
.mkd-code__mark{position:absolute;top:0;left:0;min-width:100%;pointer-events:none;color:transparent}
.mkd-code__span{background:var(--mkd-code-span,var(--_span));border-radius:2px}
.mkd-code__highlight{position:absolute;top:0;left:0;min-width:100%;pointer-events:none;color:inherit}
.mkd-code__text{position:absolute;inset:0;width:100%;height:100%;resize:none;background:transparent;color:transparent;
caret-color:var(--mkd-code-color,var(--_fg));outline:none;overflow:auto}
.mkd-code__text::selection{background:var(--mkd-code-selection,var(--_sel));color:transparent}
.mkd-code__message{flex:none;font:12px/1.4 system-ui,sans-serif;padding:3px 8px;border-top:1px solid var(--mkd-code-gutter-background,var(--_gbg));
background:var(--mkd-code-gutter-background,var(--_gbg))}
.mkd-code__message:empty{display:none}
.mkd-code__message[data-severity=error]{color:var(--mkd-code-error,var(--_err))}
.mkd-code__message[data-severity=warning]{color:var(--mkd-code-warning,var(--_warn))}
.t-keyword{color:var(--mkd-code-keyword,var(--_kw))}
.t-name{color:var(--mkd-code-name,var(--_name))}
.t-ident{color:var(--mkd-code-ident,var(--_ident))}
.t-modifier{color:var(--mkd-code-modifier,var(--_mod))}
.t-member{color:var(--mkd-code-member,var(--_mem))}
.t-string{color:var(--mkd-code-string,var(--_str))}
.t-number{color:var(--mkd-code-number,var(--_num))}
.t-comment{color:var(--mkd-code-comment,var(--_com));font-style:italic}
.t-punct{color:var(--mkd-code-punct,var(--_punct))}
.t-error{color:var(--mkd-code-error,var(--_err));text-decoration:wavy underline}
.t-match{background:var(--mkd-code-match,var(--_match));border-radius:2px}
.t-unmatched{color:var(--mkd-code-error,var(--_err));text-decoration:wavy underline var(--mkd-code-error,var(--_err))}`;

const Base: typeof HTMLElement = (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) as typeof HTMLElement;

function escapeHtml(text: string): string {
  return text.replace(/[&<>]/g, (c) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"));
}

/** A bracket token of the text and the index of its match among them (-1 when unmatched). */
interface Bracket {
  at: number;
  match: number;
}

/** The bracket tokens of the coloured ranges, paired by nesting (C5). */
function pairBrackets(text: string, ranges: readonly Highlight[]): Bracket[] {
  const out: Bracket[] = [];
  const stack: number[] = [];
  for (const h of ranges) {
    if (h.kind !== "punct" || h.end - h.start !== 1) continue;
    const ch = text[h.start];
    if (OPEN[ch]) {
      stack.push(out.length);
      out.push({ at: h.start, match: -1 });
    } else if (CLOSE[ch]) {
      const b: Bracket = { at: h.start, match: -1 };
      const top = stack[stack.length - 1];
      if (top !== undefined && text[out[top].at] === CLOSE[ch]) {
        stack.pop();
        b.match = top;
        out[top].match = out.length;
      }
      out.push(b);
    }
  }
  return out;
}

export class CodeElement extends Base {
  static get observedAttributes(): string[] {
    return [...CODE_ATTRIBUTES];
  }

  #root: ShadowRoot;
  #text: HTMLTextAreaElement;
  #highlight: HTMLElement;
  #markLayer: HTMLElement;
  /** The range {@link mark} marks, or null. */
  #marked: CodeRange | null = null;
  #gutter: HTMLElement;
  #lines: HTMLElement;
  #message: HTMLElement;
  #diagnostics: CodeDiagnostic[] = [];
  /** The messages of each line holding a diagnostic, by line number. */
  #byLine = new Map<number, CodeDiagnostic[]>();
  /** Offsets where the lines start. */
  #lineStarts: number[] = [0];
  #lineCount = 0;
  #gutterKey = "";
  #brackets: Bracket[] = [];
  #bracketAt = new Map<number, number>();
  #bracketEls: HTMLCollectionOf<Element> | null = null;
  #matched: Element[] = [];
  /** Esc was the last key: the next Tab moves the focus out (C6). */
  #escaped = false;
  /** A command is replacing text (see {@link #replace}). */
  #replacing = false;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#root.innerHTML = `<style>${CODE_CSS}</style><div class="mkd-code__wrap"><div class="mkd-code" part="code">`
      + `<div class="mkd-code__gutter" part="gutter" aria-hidden="true"><div class="mkd-code__lines"></div></div>`
      + `<div class="mkd-code__body"><pre class="mkd-code__mark" part="mark" aria-hidden="true"></pre><pre class="mkd-code__highlight" part="highlight" aria-hidden="true"></pre>`
      + `<textarea class="mkd-code__text" part="text" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off"`
      + ` aria-label="Code" aria-describedby="message"></textarea></div></div>`
      + `<div class="mkd-code__message" part="message" id="message" role="status" aria-live="polite"></div></div>`;
    this.#text = this.#root.querySelector("textarea")!;
    this.#highlight = this.#root.querySelector(".mkd-code__highlight")!;
    this.#markLayer = this.#root.querySelector(".mkd-code__mark")!;
    this.#gutter = this.#root.querySelector(".mkd-code__gutter")!;
    this.#lines = this.#root.querySelector(".mkd-code__lines")!;
    this.#message = this.#root.querySelector(".mkd-code__message")!;
    // While a command replaces text, the browser's own input events (Chrome sends two for a line feed
    // and its indentation) are held back, and one is dispatched when it is done (C7).
    this.#text.addEventListener("input", (e) => {
      if (this.#replacing) e.stopImmediatePropagation();
    }, true);
    this.#text.addEventListener("input", () => this.#render());
    this.#text.addEventListener("scroll", () => this.#scroll());
    this.#text.addEventListener("keydown", (e) => this.#keydown(e));
    for (const type of ["keyup", "mouseup", "focus", "select", "selectionchange"]) this.#text.addEventListener(type, () => this.#caret());
    this.#text.addEventListener("mouseup", () => this.#moved());
    this.#text.addEventListener("keyup", (e) => {
      if (NAVIGATION_KEYS.has(e.key)) this.#moved();
    });
    this.#render();
  }

  connectedCallback(): void {
    // The `textarea` reads the text the host was written with, unless a value was set first.
    if (!this.#text.value && this.textContent && this.textContent.trim()) this.value = dedent(this.textContent);
  }

  attributeChangedCallback(name: string): void {
    if (name === "readonly") this.#text.readOnly = this.hasAttribute("readonly");
  }

  // --- properties ---------------------------------------------------------------------------------

  /** The text (C1). Setting it re-colours the view and dispatches no event. */
  get value(): string {
    return this.#text.value;
  }

  set value(text: string) {
    const v = String(text ?? "");
    if (v === this.#text.value) return;
    this.#text.value = v;
    this.#render();
  }

  /** The diagnostics marked in the gutter (C1, C4), each placed by its `location.line` (or `line`). */
  get diagnostics(): CodeDiagnostic[] {
    return [...this.#diagnostics];
  }

  set diagnostics(list: readonly CodeDiagnostic[] | null) {
    this.#diagnostics = Array.isArray(list) ? [...list] : [];
    this.#byLine = new Map();
    for (const d of this.#diagnostics) {
      const line = d.location?.line ?? d.line ?? 0;
      if (!(line >= 1)) continue;
      const at = this.#byLine.get(line);
      if (at) at.push(d);
      else this.#byLine.set(line, [d]);
    }
    this.#drawGutter(true);
    this.#caret();
  }

  /** Whether the text cannot be changed (the `readonly` attribute). */
  get readOnly(): boolean {
    return this.hasAttribute("readonly");
  }

  set readOnly(on: boolean) {
    this.toggleAttribute("readonly", Boolean(on));
  }

  /** The selected range of the text. */
  get selection(): CodeRange {
    return { start: this.#text.selectionStart, end: this.#text.selectionEnd };
  }

  /** Focus the text area. */
  override focus(options?: FocusOptions): void {
    this.#text.focus(options);
  }

  /** Scroll the range `{start, end}` (offsets) into view and select it (C1). */
  reveal(range: CodeRange): void {
    const len = this.#text.value.length;
    const start = Math.max(0, Math.min(len, Math.floor(Number(range?.start) || 0)));
    const end = Math.max(start, Math.min(len, Math.floor(Number(range?.end ?? start) || 0)));
    this.#text.focus({ preventScroll: true });
    this.#text.setSelectionRange(start, end);
    this.#scrollTo(start);
    this.#caret();
  }

  /** The range {@link mark} marks, or null. */
  get marked(): CodeRange | null {
    return this.#marked ? { ...this.#marked } : null;
  }

  /**
   * Mark the range `{start, end}` behind the text (part `span`), or nothing for null, without moving
   * the focus or the caret; while the text area does not have the focus, a range out of view is
   * scrolled into it (R-TOOL-009.C6).
   */
  mark(range: CodeRange | null): void {
    const len = this.#text.value.length;
    let next: CodeRange | null = null;
    if (range) {
      const start = Math.max(0, Math.min(len, Math.floor(Number(range.start) || 0)));
      const end = Math.max(start, Math.min(len, Math.floor(Number(range.end ?? start) || 0)));
      next = end > start ? { start, end } : null;
    }
    const same = next === this.#marked || (!!next && !!this.#marked && next.start === this.#marked.start && next.end === this.#marked.end);
    this.#marked = next;
    this.#drawMark();
    // Scrolled into view only when the selection was made elsewhere: never under the typing caret.
    if (next && !same && this.#root.activeElement !== this.#text) this.#scrollTo(next.start);
  }

  /**
   * Apply text edits made elsewhere (R-TOOL-009.C5): ascending, not overlapping, offsets of the current
   * text. The caret and the selection keep their place outside the edited ranges (inside one they move
   * to its start), the scroll position keeps the lines in view, and no `input` event is dispatched.
   */
  applyEdits(edits: readonly CodeEdit[]): void {
    const ta = this.#text;
    const old = ta.value;
    const sorted = [...edits].sort((a, b) => a.start - b.start);
    let next = "";
    let pos = 0;
    for (const e of sorted) {
      if (e.start < pos || e.end < e.start || e.end > old.length) throw new RangeError("edits out of order, overlapping or outside the text");
      next += old.slice(pos, e.start) + e.text;
      pos = e.end;
    }
    next += old.slice(pos);
    if (next === old) return;
    const map = (offset: number): number => {
      let delta = 0;
      for (const e of sorted) {
        if (offset <= e.start) break;
        if (offset < e.end) return e.start + delta;
        delta += e.text.length - (e.end - e.start);
      }
      return offset + delta;
    };
    const { selectionStart: s, selectionEnd: f, selectionDirection: dir } = ta;
    const top = ta.scrollTop;
    const left = ta.scrollLeft;
    const style = getComputedStyle(ta);
    const lineHeight = parseFloat(style.lineHeight) || 18;
    const firstShown = Math.max(0, Math.floor((top - (parseFloat(style.paddingTop) || 0)) / lineHeight));
    const shownAt = this.#lineStarts[Math.min(firstShown, this.#lineStarts.length - 1)] ?? 0;
    let lines = 0;
    for (const e of sorted) {
      if (e.end > shownAt) break;
      lines += countLines(e.text) - countLines(old.slice(e.start, e.end));
    }
    ta.value = next;
    ta.setSelectionRange(map(s), map(f), dir ?? "none");
    this.#render();
    ta.scrollTop = Math.max(0, top + lines * lineHeight);
    ta.scrollLeft = left;
    this.#scroll();
  }

  /** Scroll so that the text at `start` is in view; nothing while the view is not laid out. */
  #scrollTo(start: number): void {
    if (!this.#text.clientHeight) return;
    const style = getComputedStyle(this.#text);
    const lineHeight = parseFloat(style.lineHeight) || 18;
    const padTop = parseFloat(style.paddingTop) || 0;
    const line = this.#lineOf(start);
    const top = padTop + line * lineHeight;
    const view = this.#text.clientHeight;
    if (top < this.#text.scrollTop || top + lineHeight > this.#text.scrollTop + view) {
      this.#text.scrollTop = Math.max(0, top - Math.max(0, (view - lineHeight) / 3));
    }
    const col = start - this.#lineStarts[line];
    const charWidth = this.#charWidth();
    const left = (parseFloat(style.paddingLeft) || 0) + col * charWidth;
    const width = this.#text.clientWidth;
    if (left < this.#text.scrollLeft || left + charWidth > this.#text.scrollLeft + width) {
      this.#text.scrollLeft = Math.max(0, left - width / 3);
    }
    this.#scroll();
  }

  /** Tell the host the pointer or a navigation key moved the caret. */
  #moved(): void {
    const { selectionStart: start, selectionEnd: end } = this.#text;
    this.dispatchEvent(new CustomEvent(CODE_CARET_EVENT, { bubbles: true, composed: true, detail: { start, end } }));
  }

  /** The marked range as a transparent copy of the text up to its end, the range in a `span` part. */
  #drawMark(): void {
    const m = this.#marked;
    const text = this.#text.value;
    if (!m || m.end > text.length) {
      if (this.#markLayer.firstChild) this.#markLayer.replaceChildren();
      return;
    }
    this.#markLayer.innerHTML = `${escapeHtml(text.slice(0, m.start))}<span class="mkd-code__span" part="span">${escapeHtml(text.slice(m.start, m.end))}</span>`;
  }

  // --- drawing ------------------------------------------------------------------------------------

  /** Re-colour the text, renumber the lines and re-pair the brackets (C2, C3, C5). */
  #render(): void {
    const text = this.#text.value;
    const ranges = highlight(text);
    const brackets = pairBrackets(text, ranges);
    const bracketAt = new Map<number, number>();
    brackets.forEach((b, i) => bracketAt.set(b.at, i));
    let html = "";
    let pos = 0;
    let bi = 0;
    for (const h of ranges) {
      if (h.start > pos) html += escapeHtml(text.slice(pos, h.start));
      const piece = escapeHtml(text.slice(h.start, h.end));
      if (bi < brackets.length && brackets[bi].at === h.start) {
        const unmatched = brackets[bi].match < 0 ? " t-unmatched" : "";
        html += `<span class="t-punct t-bracket${unmatched}" data-at="${h.start}">${piece}</span>`;
        bi += 1;
      } else {
        html += `<span class="t-${h.kind}">${piece}</span>`;
      }
      pos = h.end;
    }
    html += escapeHtml(text.slice(pos)) + " ";
    this.#highlight.innerHTML = html;
    this.#brackets = brackets;
    this.#bracketAt = bracketAt;
    this.#bracketEls = this.#highlight.getElementsByClassName("t-bracket");
    this.#matched = [];
    const starts = [0];
    for (let i = text.indexOf("\n"); i >= 0; i = text.indexOf("\n", i + 1)) starts.push(i + 1);
    this.#lineStarts = starts;
    this.#drawMark();
    this.#drawGutter(false);
    this.#scroll();
    this.#caret();
  }

  /** The line numbers, and the diagnostic marks of C4. */
  #drawGutter(force: boolean): void {
    const count = this.#lineStarts.length;
    if (!force && count === this.#lineCount && this.#gutterKey) return;
    this.#lineCount = count;
    this.#gutterKey = "drawn";
    let html = "";
    for (let n = 1; n <= count; n++) {
      const ds = this.#byLine.get(n);
      if (!ds) {
        html += `<div class="mkd-code__line" part="line" data-line="${n}">${n}</div>`;
        continue;
      }
      const severity = ds.some((d) => d.severity === "error") ? "error" : ds[0].severity;
      const title = ds.map((d) => `${d.severity}: ${d.message}`).join("\n").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      html += `<div class="mkd-code__line" part="line" data-line="${n}" data-severity="${escapeHtml(severity)}" title="${title}">${n}</div>`;
    }
    this.#lines.innerHTML = html;
  }

  #scroll(): void {
    const x = this.#text.scrollLeft;
    const y = this.#text.scrollTop;
    this.#highlight.style.transform = `translate(${-x}px, ${-y}px)`;
    this.#markLayer.style.transform = `translate(${-x}px, ${-y}px)`;
    this.#lines.style.transform = `translateY(${-y}px)`;
  }

  /** The bracket match at the caret (C5) and the messages of the caret's line (C4). */
  #caret(): void {
    for (const el of this.#matched) el.classList.remove("t-match");
    this.#matched = [];
    const ta = this.#text;
    const start = ta.selectionStart;
    if (start === ta.selectionEnd && this.#bracketEls) {
      let i = this.#bracketAt.get(start - 1);
      if (i === undefined) i = this.#bracketAt.get(start);
      if (i !== undefined) {
        const els = [this.#bracketEls[i]];
        const m = this.#brackets[i].match;
        if (m >= 0) els.push(this.#bracketEls[m]);
        for (const el of els) if (el) {
          el.classList.add("t-match");
          this.#matched.push(el);
        }
      }
    }
    const line = this.#lineOf(start) + 1;
    const ds = this.#byLine.get(line);
    const text = ds ? ds.map((d) => `Line ${line}: ${d.severity}: ${d.message}`).join("\n") : "";
    if (this.#message.textContent !== text) this.#message.textContent = text;
    if (ds) this.#message.dataset.severity = ds.some((d) => d.severity === "error") ? "error" : ds[0].severity;
    else delete this.#message.dataset.severity;
  }

  /** The 0-based line holding an offset. */
  #lineOf(offset: number): number {
    const s = this.#lineStarts;
    let lo = 0;
    let hi = s.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (s[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }

  #charWidth(): number {
    const probe = document.createElement("span");
    probe.textContent = "0000000000";
    probe.style.visibility = "hidden";
    this.#highlight.append(probe);
    const w = probe.getBoundingClientRect().width / 10;
    probe.remove();
    return w || 7;
  }

  // --- editing keys (C6) --------------------------------------------------------------------------

  #keydown(e: KeyboardEvent): void {
    const escaped = this.#escaped;
    this.#escaped = e.key === "Escape";
    if (e.key === "Escape" || this.#text.readOnly || e.isComposing) return;
    if (e.key === "Tab") {
      if (escaped || e.ctrlKey || e.metaKey || e.altKey) return; // the focus moves out
      e.preventDefault();
      if (e.shiftKey) this.#shiftLines(-1);
      else if (this.#text.selectionStart === this.#text.selectionEnd) this.#insert(this.#unit());
      else this.#shiftLines(1);
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter") {
      e.preventDefault();
      this.#newline();
    } else if (e.key === "}") {
      if (this.#closeBrace()) e.preventDefault();
    }
  }

  #unit(): string {
    return indentUnit(this.#text.value);
  }

  /** Enter: the current line's indentation, plus one unit after `{` or `(`. */
  #newline(): void {
    const ta = this.#text;
    const text = ta.value;
    const start = ta.selectionStart;
    const ls = text.lastIndexOf("\n", start - 1) + 1;
    const before = text.slice(ls, start);
    let indent = /^[ \t]*/.exec(before)![0];
    const last = before.trimEnd().slice(-1);
    if (last === "{" || last === "(") indent += this.#unit();
    this.#insert(`\n${indent}`);
  }

  /** `}` as a line's first character: one unit less indentation. Returns whether it was handled. */
  #closeBrace(): boolean {
    const ta = this.#text;
    const text = ta.value;
    const start = ta.selectionStart;
    if (start !== ta.selectionEnd) return false;
    const ls = text.lastIndexOf("\n", start - 1) + 1;
    const ws = text.slice(ls, start);
    if (!ws || !/^[ \t]*$/.test(ws)) return false;
    const unit = this.#unit();
    let keep = ws.length;
    if (ws.endsWith("\t")) keep -= 1;
    else {
      let n = 0;
      while (n < unit.length && keep > 0 && ws[keep - 1] === " ") {
        keep -= 1;
        n += 1;
      }
    }
    this.#replace(ls + keep, start, "}");
    return true;
  }

  /** Tab and Shift+Tab: indent (+1) or outdent (-1) every line the selection touches. */
  #shiftLines(dir: 1 | -1): void {
    const ta = this.#text;
    const text = ta.value;
    const selStart = ta.selectionStart;
    const selEnd = ta.selectionEnd;
    const collapsed = selStart === selEnd;
    const ls = text.lastIndexOf("\n", selStart - 1) + 1;
    // A selection ending at the start of a line does not take that line.
    const lastAt = !collapsed && selEnd > ls && text[selEnd - 1] === "\n" ? selEnd - 1 : selEnd;
    let le = text.indexOf("\n", lastAt);
    if (le < 0) le = text.length;
    const unit = this.#unit();
    const lines = text.slice(ls, le).split("\n");
    let firstDelta = 0;
    const out = lines.map((line, i) => {
      let next: string;
      if (dir > 0) next = /^[ \t\r]*$/.test(line) && lines.length > 1 ? line : unit + line;
      else if (line.startsWith("\t")) next = line.slice(1);
      else {
        let n = 0;
        while (n < unit.length && line[n] === " ") n += 1;
        next = line.slice(n);
      }
      if (i === 0) firstDelta = next.length - line.length;
      return next;
    });
    const block = out.join("\n");
    if (block === text.slice(ls, le)) return;
    if (collapsed) {
      const caret = Math.max(ls, selStart + firstDelta);
      this.#replace(ls, le, block, caret, caret);
    } else {
      this.#replace(ls, le, block, ls, ls + block.length);
    }
  }

  #insert(text: string): void {
    this.#replace(this.#text.selectionStart, this.#text.selectionEnd, text);
  }

  /**
   * Replace `[start, end)` with `text` as the user's own change (C7): through the browser's
   * insertText command, so that its undo keeps it, else with `setRangeText`; then one `input` event.
   * The selection then becomes `[selStart, selEnd)` when given, else the caret after the text.
   */
  #replace(start: number, end: number, text: string, selStart?: number, selEnd?: number): void {
    const ta = this.#text;
    ta.focus({ preventScroll: true });
    ta.setSelectionRange(start, end);
    const before = ta.value;
    let done = false;
    this.#replacing = true;
    try {
      if (text) done = document.execCommand("insertText", false, text);
    } catch {
      done = false;
    } finally {
      this.#replacing = false;
    }
    const expected = before.slice(0, start) + text + before.slice(end);
    if (!done || ta.value !== expected) {
      ta.value = before;
      ta.setRangeText(text, start, end, "end");
    }
    ta.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true, inputType: "insertText", data: text }));
    if (selStart !== undefined) ta.setSelectionRange(selStart, selEnd ?? selStart);
    this.#caret();
  }
}

/** The number of line feeds in a text. */
function countLines(text: string): number {
  let n = 0;
  for (let i = text.indexOf("\n"); i >= 0; i = text.indexOf("\n", i + 1)) n += 1;
  return n;
}

/** The text of the host's light DOM without the indentation its lines share. */
function dedent(text: string): string {
  const lines = text.replace(/^\n+/, "").replace(/\s+$/, "").split("\n");
  let common: number | null = null;
  for (const l of lines) {
    if (!l.trim()) continue;
    const n = /^[ \t]*/.exec(l)![0].length;
    common = common === null ? n : Math.min(common, n);
  }
  return lines.map((l) => l.slice(common ?? 0)).join("\n") + "\n";
}
