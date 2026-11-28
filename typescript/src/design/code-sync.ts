/**
 * Two-way editing between a code view and a design session (R-TOOL-009): the rules that join a
 * `mockitdown-code` (or any object with the same few members, {@link CodeViewLike}) to the session's
 * active mockup, kept here beside the session so that the code view itself holds none (A-WEB-5.K2) and
 * stays free of the design tools (R-TOOL-008.C8).
 *
 *   const sync = new CodeSync(designer.session, codeView);   // the active mockup's code, both ways
 *   sync.flush();                                           // apply typed text now (else 300 ms after)
 *   sync.dispose();
 *
 * - Typing (C1): {@link CODE_SYNC_MS} after the view's last `input` event, or at once when the focus
 *   leaves it (`focusout`), its text goes to `session.setCode(mockup, text, {coalesce: "code"})`, one
 *   change whose single edit replaces what lies between the common prefix and suffix; a burst of typing
 *   is one undo step (R-EDIT-007.C5).
 * - Parsing (C2, C3) is the session's: a text that parses re-parses from the last valid tree, ids and
 *   selection kept; one that does not keeps the last valid tree, and the view shows the diagnostics.
 * - The caret (C4): a `mockitdown-caret` event of the view (the pointer or a navigation key moved the
 *   caret) selects the innermost view node holding it while the text is the session's and parses, and
 *   clears the selection outside every node. Typing never selects.
 * - Other components' changes (C5): their text edits are applied to the view (`applyEdits`), which keeps
 *   its caret and scroll outside the edited ranges; text typed and not yet applied is kept and the
 *   edits are moved past it, unless they overlap it, when the session's code wins.
 * - The selection (C6): its span is marked in the view (`mark`) without moving the focus.
 * - The active mockup: a new one is shown in the view, after any typed text is applied to the old one.
 */

import type { TextEdit } from "../core/syntax/tree.js";
import type { DesignNotification, DesignSession } from "./session.js";

/** How long after the last keystroke a code view's text is applied, in milliseconds (R-TOOL-009.C1). */
export const CODE_SYNC_MS = 300;
/** The coalescing key of typed code (R-EDIT-007.C5). */
export const CODE_COALESCE = "code";
/** The event a code view dispatches when the pointer or a navigation key moved its caret (C4). */
export const CARET_EVENT = "mockitdown-caret";

/** What the visual tools say while the code does not parse and they show its last valid version (C3). */
export const READ_ONLY_NOTE = "The code does not parse: the last valid version is shown, read-only.";

/** A range of a code view's text: UTF-16 offsets, end exclusive. */
export interface CodeSpan {
  start: number;
  end: number;
}

/** What {@link CodeSync} needs of a code view: `mockitdown-code` has it. */
export interface CodeViewLike {
  value: string;
  diagnostics: unknown;
  readonly selection: CodeSpan;
  /** Apply text edits (ascending, not overlapping) keeping the caret and scroll outside them; no `input` event. */
  applyEdits(edits: readonly TextEdit[]): void;
  /** Mark a range (or none) without moving the focus. */
  mark(range: CodeSpan | null): void;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

/** Options of a {@link CodeSync}. */
export interface CodeSyncOptions {
  /** The pause after the last keystroke, in milliseconds (default {@link CODE_SYNC_MS}). */
  delay?: number;
}

/** A code view joined to a design session's active mockup (R-TOOL-009). */
export class CodeSync {
  readonly session: DesignSession;
  readonly view: CodeViewLike;
  readonly delay: number;
  #mockup: string | null = null;
  /** The session code the view's text was last in step with. */
  #base = "";
  #timer: ReturnType<typeof setTimeout> | null = null;
  #pending = false;
  #unsubscribe: () => void;
  #onInput = (): void => this.#input();
  #onCaret = (): void => this.#caret();
  #onLeave = (): void => this.flush();

  constructor(session: DesignSession, view: CodeViewLike, options: CodeSyncOptions = {}) {
    this.session = session;
    this.view = view;
    this.delay = Math.max(0, options.delay ?? CODE_SYNC_MS);
    this.#unsubscribe = session.subscribe((n) => this.#notified(n));
    view.addEventListener("input", this.#onInput);
    view.addEventListener(CARET_EVENT, this.#onCaret);
    view.addEventListener("focusout", this.#onLeave);
    this.#show();
  }

  /** The mockup the view shows: the session's active one. */
  get mockup(): string | null {
    return this.#mockup;
  }

  /** Whether typed text waits for its pause. */
  get pending(): boolean {
    return this.#pending;
  }

  /** Apply the typed text now (C1): nothing when none waits. */
  flush(): void {
    if (this.#timer !== null) clearTimeout(this.#timer);
    this.#timer = null;
    if (!this.#pending) return;
    this.#pending = false;
    const name = this.#mockup;
    if (name === null || !this.session.mockup(name)) return;
    const text = this.view.value;
    this.session.setCode(name, text, { coalesce: CODE_COALESCE });
    this.#base = this.session.code(name) ?? text;
    this.#mark();
  }

  /** Leave the session: typed text is applied first; the view keeps its text. */
  dispose(): void {
    this.flush();
    this.#unsubscribe();
    this.view.removeEventListener("input", this.#onInput);
    this.view.removeEventListener(CARET_EVENT, this.#onCaret);
    this.view.removeEventListener("focusout", this.#onLeave);
  }

  // --- the view's events --------------------------------------------------------------------------

  #input(): void {
    if (this.#mockup === null) return;
    if (this.#timer !== null) clearTimeout(this.#timer);
    this.#timer = null;
    if (this.view.value === this.#base) {
      // Typed back to the session's code: nothing to apply.
      this.#pending = false;
      this.#mark();
      return;
    }
    this.#pending = true;
    this.view.mark(null);
    this.#timer = setTimeout(() => this.flush(), this.delay);
  }

  #caret(): void {
    const name = this.#mockup;
    if (name === null || this.#pending || name !== this.session.active || this.view.value !== this.session.code(name)) return;
    if (!this.session.parses(name)) return;
    const id = this.session.nodeAt(name, this.view.selection.start);
    const want = id === null ? [] : [id];
    const now = this.session.selection;
    if (want.length !== now.length || want.some((x, i) => x !== now[i])) this.session.select(want);
  }

  // --- the session's notifications ----------------------------------------------------------------

  #notified(n: DesignNotification): void {
    switch (n.kind) {
      case "active":
        this.flush();
        this.#show();
        break;
      case "change":
        if (n.detail.mockup === this.#mockup && n.detail.kind === "code") this.#changed(n.detail.edits, n.detail.code);
        break;
      case "diagnostics":
        if (n.detail.mockup === this.#mockup) this.view.diagnostics = n.detail.diagnostics;
        break;
      case "rename":
        // The shown mockup keeps its code under its new name (R-TOOL-012.C3).
        if (n.detail.from === this.#mockup) this.#mockup = n.detail.to;
        break;
      case "select":
        this.#mark();
        break;
    }
  }

  /** Show the active mockup's code and diagnostics. */
  #show(): void {
    const name = this.session.active;
    this.#mockup = name;
    this.#pending = false;
    const code = name === null ? "" : this.session.code(name) ?? "";
    this.#base = code;
    this.view.value = code;
    this.view.diagnostics = name === null ? [] : this.session.diagnostics(name);
    this.#mark();
  }

  /** A change of the shown mockup's code, made here (its text is the view's) or elsewhere (C5). */
  #changed(edits: readonly TextEdit[], code: string): void {
    const base = this.#base;
    this.#base = code;
    const view = this.view;
    if (view.value === code) {
      this.#pending = false;
      if (this.#timer !== null) clearTimeout(this.#timer);
      this.#timer = null;
      return;
    }
    const sorted = [...edits].sort((a, b) => a.start - b.start);
    const consistent = applyTo(base, sorted) === code;
    if (!this.#pending) {
      if (consistent && view.value === base) view.applyEdits(sorted);
      else view.value = code;
      this.#mark();
      return;
    }
    // Typed text waits: move the edits past it, unless they overlap it.
    const typed = singleDiff(base, view.value);
    const moved = consistent && typed ? shiftPast(sorted, typed) : null;
    if (moved) {
      view.applyEdits(moved);
      return;
    }
    if (this.#timer !== null) clearTimeout(this.#timer);
    this.#timer = null;
    this.#pending = false;
    view.value = code;
    this.#mark();
  }

  /** Mark the selection's span (C6), only while the view shows the session's parsed code. */
  #mark(): void {
    const name = this.#mockup;
    const ok = name !== null && name === this.session.active && !this.#pending && this.view.value === this.session.code(name);
    this.view.mark(ok ? this.session.selectionSpan() : null);
  }
}

// --- helpers --------------------------------------------------------------------------------------

/** Apply ascending, non-overlapping edits to a text; null when they are not. */
export function applyTo(text: string, edits: readonly TextEdit[]): string | null {
  let out = "";
  let pos = 0;
  for (const e of edits) {
    if (e.start < pos || e.end < e.start || e.end > text.length) return null;
    out += text.slice(pos, e.start) + e.text;
    pos = e.end;
  }
  return out + text.slice(pos);
}

/** The single edit between the common prefix and suffix of two texts (C1), null when they are equal. */
function singleDiff(a: string, b: string): TextEdit | null {
  if (a === b) return null;
  let start = 0;
  const max = Math.min(a.length, b.length);
  while (start < max && a.charCodeAt(start) === b.charCodeAt(start)) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a.charCodeAt(endA - 1) === b.charCodeAt(endB - 1)) {
    endA--;
    endB--;
  }
  return { start, end: endA, text: b.slice(start, endB) };
}

/** Edits of the base text moved onto the typed text, or null when one overlaps the typed edit. */
function shiftPast(edits: readonly TextEdit[], typed: TextEdit): TextEdit[] | null {
  const delta = typed.text.length - (typed.end - typed.start);
  const out: TextEdit[] = [];
  for (const e of edits) {
    if (e.end < typed.start || (e.end === typed.start && e.start < e.end)) out.push(e);
    else if (e.start > typed.end || (e.start === typed.end && typed.start < typed.end)) out.push({ start: e.start + delta, end: e.end + delta, text: e.text });
    else return null;
  }
  return out;
}
