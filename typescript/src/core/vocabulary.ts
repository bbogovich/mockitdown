/**
 * Modifier vocabulary shared by every pack (port of `mockitdown.vocabulary`).
 *
 * - `RENDERED`: modifiers the HTML renderer interprets (layout, typography, colour, navigation …).
 * - `IGNORED`: behaviour-only SwiftUI modifiers accepted silently so real SwiftUI code can be pasted.
 * - `NEUTRAL_MODULES`: import names that select no pack but are legal in pasted Swift code.
 *
 * The lists are data, written once in the repository's `shared/language/vocabulary.json` and
 * copied into the package at build time; they reach the core through `loadAssets` (A-WEB-1.K1).
 */

import { parseJson } from "./json.js";
import { pyStr } from "./values.js";

export const RENDERED = new Set<string>();
export const IGNORED = new Set<string>();
export const NEUTRAL_MODULES = new Set<string>();

let loaded = false;

/** Install the vocabulary from the text (or parsed value) of `vocabulary.json`. */
export function setVocabulary(data: string | { rendered?: unknown; ignored?: unknown; neutral_modules?: unknown }): void {
  const raw = typeof data === "string" ? (toPlain(parseJson(data)) as Record<string, unknown>) : data;
  for (const [set, key] of [[RENDERED, "rendered"], [IGNORED, "ignored"], [NEUTRAL_MODULES, "neutral_modules"]] as const) {
    set.clear();
    const list = (raw as Record<string, unknown>)[key];
    if (Array.isArray(list)) for (const x of list) set.add(pyStr(x));
  }
  loaded = true;
}

export function vocabularyLoaded(): boolean {
  return loaded;
}

function toPlain(v: unknown): unknown {
  if (v && typeof v === "object" && "items" in v && typeof (v as { items: unknown }).items === "function") {
    return Object.fromEntries((v as { items(): [unknown, unknown][] }).items().map(([k, x]) => [String(k), toPlain(x)]));
  }
  return v;
}
