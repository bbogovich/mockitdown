/**
 * Built-in icon set (port of `mockitdown.icons`): 24×24 line glyphs with aliases for the icon names
 * of SF Symbols, Material Symbols, Fluent UI System Icons and SAP icons. The glyphs and aliases are
 * the shared icon table `icons.json`, handed to the core by `loadAssets` (A-WEB-1.K1).
 */

import { iconTable } from "./assets.js";
import { PyDict, pyStr } from "./values.js";

const DROP = new Set(["16", "20", "24", "28", "32", "48", "regular", "filled", "outline", "outlined", "rounded", "sharp",
  "ic", "fluent", "symbol", "symbols", "light", "color"]);

let cached: { table: PyDict<unknown>; glyphs: Map<string, string>; aliases: Map<string, string> } | null = null;

function tables(): { glyphs: Map<string, string>; aliases: Map<string, string> } {
  const table = iconTable();
  if (cached && cached.table === table) return cached;
  const toMap = (d: unknown): Map<string, string> => {
    const m = new Map<string, string>();
    if (d instanceof PyDict) for (const [k, v] of d.items()) m.set(pyStr(k), pyStr(v));
    return m;
  };
  cached = { table, glyphs: toMap(table.get("glyphs")), aliases: toMap(table.get("aliases")) };
  return cached;
}

// Python's \s (Unicode whitespace) inside a character class.
const PY_WS = "\\s\\x1c-\\x1f\\x85";

/** `ChevronRight24Regular` → `chevron.right`; `more_vert` → `more.vert`. */
export function normalize(name: string): string {
  let s = name.replace(new RegExp(`^[${PY_WS}]+|[${PY_WS}]+$`, "gu"), "");
  if (s.toLowerCase().startsWith("sap-icon://")) s = Array.from(s).slice("sap-icon://".length).join("");
  s = s.replace(/(?<=[a-z0-9])(?=[A-Z])/g, ".");
  s = s.replace(/(?<=[A-Za-z])(?=\p{Nd})/gu, ".");
  const tokens = s.toLowerCase().split(new RegExp(`[._\\-${PY_WS}/]+`, "u")).filter((t) => t && !DROP.has(t));
  return tokens.join(".");
}

function removeSuffix(s: string, suffix: string): string {
  return s.endsWith(suffix) && suffix ? s.slice(0, s.length - suffix.length) : s;
}

/** The names of the built-in glyphs, sorted: what a design tool suggests for an `icon` value (R-TOOL-007.C3). */
export function iconNames(): string[] {
  return [...tables().glyphs.keys()].sort();
}

/** The canonical glyph for `name`, or null when nothing matches. */
export function resolveIcon(name: string): string | null {
  const { glyphs, aliases } = tables();
  if (glyphs.has(name)) return name;
  if (aliases.has(name)) return aliases.get(name)!;
  const key = normalize(name);
  for (const cand of [key, removeSuffix(key, ".fill"), removeSuffix(key, ".circle"), removeSuffix(key, ".fill.circle")]) {
    if (glyphs.has(cand)) return cand;
    if (aliases.has(cand)) return aliases.get(cand)!;
  }
  const head = key ? key.split(".")[0] : "";
  if (glyphs.has(head)) return head;
  if (aliases.has(head)) return aliases.get(head)!;
  return null;
}

/** `[<svg …>, found]`. An unknown name renders a neutral placeholder glyph. */
export function iconSvg(name: string, cls = "mkd-icon"): [string, boolean] {
  const { glyphs } = tables();
  const glyph = resolveIcon(name);
  const body = glyph ? glyphs.get(glyph) : glyphs.get("questionmark");
  return [
    `<svg class="${cls}" data-icon="${glyph || "unknown"}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" `
    + `stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${body ?? ""}</svg>`,
    glyph !== null,
  ];
}
