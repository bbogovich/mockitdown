/**
 * Modifier vocabulary shared by every pack (port of `mockitdown.vocabulary`).
 *
 * - `RENDERED`: modifiers the HTML renderer interprets (layout, typography, colour, navigation …).
 * - `modifierTypes()`: the group and argument types of each rendered modifier (R-PACK-017.C5, C6),
 *   for the design tools; rendering never reads them.
 * - `IGNORED`: behaviour-only SwiftUI modifiers accepted silently so real SwiftUI code can be pasted.
 * - `NEUTRAL_MODULES`: import names that select no pack but are legal in pasted Swift code.
 * - `MENUBAR`: the standard menus of the macOS menu bar and its clock (R-DEV-009).
 *
 * The lists are data, written once in the repository's `shared/language/vocabulary.json` and
 * copied into the package at build time; they reach the core through `loadAssets` (A-WEB-1.K1).
 */

import { parseJson } from "./json.js";
import { normalizeType, type TypeSpec } from "./paramtypes.js";
import { pyStr } from "./values.js";

export const RENDERED = new Set<string>();
export const IGNORED = new Set<string>();
export const NEUTRAL_MODULES = new Set<string>();

/** One standard menu item: its title (`{app}` stands for the application name), shortcut, submenu flag. */
export interface MenubarItem { title: string; key?: string; modifiers?: string[]; submenu?: boolean }
/** A standard menu: a separator ("-") or a group of items at a placement (none: fixed items). */
export type MenubarEntry = "-" | { placement?: string; items?: MenubarItem[] };
export interface MenubarData { clock: string; menus: { title: string; id?: string; entries: MenubarEntry[] }[] }
/** The macOS menu bar's standard menus and clock (R-DEV-009.C3, C6). */
export const MENUBAR: MenubarData = { clock: "", menus: [] };

/** The groups a rendered modifier belongs to (R-PACK-017.C5). */
export const MODIFIER_GROUPS = ["layout", "typography", "colour", "presentation", "annotations", "other"] as const;
export type ModifierGroup = (typeof MODIFIER_GROUPS)[number];
/** A rendered modifier's group and arguments: each argument's label (null: positional) and type. */
export interface ModifierType {
  readonly group: ModifierGroup;
  readonly args: readonly { readonly label: string | null; readonly type: TypeSpec }[];
}
let modifiers: Readonly<Record<string, ModifierType>> = Object.freeze({});

let loaded = false;

/** Install the vocabulary from the text (or parsed value) of `vocabulary.json`. */
export function setVocabulary(data: string | { rendered?: unknown; ignored?: unknown; neutral_modules?: unknown; menubar?: unknown; modifiers?: unknown }): void {
  const raw = typeof data === "string" ? (toPlain(parseJson(data)) as Record<string, unknown>) : data;
  for (const [set, key] of [[RENDERED, "rendered"], [IGNORED, "ignored"], [NEUTRAL_MODULES, "neutral_modules"]] as const) {
    set.clear();
    const list = (raw as Record<string, unknown>)[key];
    if (Array.isArray(list)) for (const x of list) set.add(pyStr(x));
  }
  // The menu bar's data holds strings, flags and lists only: plain JSON.
  const menubar = (typeof data === "string" ? JSON.parse(data) : data).menubar as Partial<MenubarData> | undefined;
  MENUBAR.clock = typeof menubar?.clock === "string" ? menubar.clock : "";
  MENUBAR.menus = Array.isArray(menubar?.menus) ? menubar.menus : [];
  modifiers = readModifiers((typeof data === "string" ? JSON.parse(data) : data).modifiers);
  loaded = true;
}

/**
 * The vocabulary's `modifiers` (R-PACK-017.C6): rendered modifier → its group and argument types, each
 * type in its object form. Empty before the vocabulary is loaded.
 */
export function modifierTypes(): Readonly<Record<string, ModifierType>> {
  return modifiers;
}

function readModifiers(raw: unknown): Readonly<Record<string, ModifierType>> {
  const out: Record<string, ModifierType> = {};
  if (!raw || typeof raw !== "object") return Object.freeze(out);
  for (const [name, spec] of Object.entries(raw as Record<string, { group?: unknown; args?: unknown }>)) {
    const group = (MODIFIER_GROUPS as readonly string[]).includes(String(spec?.group)) ? spec.group as ModifierGroup : "other";
    const args: { label: string | null; type: TypeSpec }[] = [];
    for (const a of Array.isArray(spec?.args) ? spec.args as { label?: unknown; type?: unknown }[] : []) {
      const type = normalizeType(a?.type);
      if (type) args.push(Object.freeze({ label: typeof a.label === "string" ? a.label : null, type }));
    }
    out[name] = Object.freeze({ group, args: Object.freeze(args) });
  }
  return Object.freeze(out);
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
