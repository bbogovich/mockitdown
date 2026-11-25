/**
 * Render options: what a fence, an element or the caller can set for one mockup (port of
 * `mockitdown.options`). Field names are those of the Python `RenderOptions` and of the
 * conformance corpus's `<name>.json` (R-REPO-004.C6), so a case's options apply unchanged.
 *
 * The Python options that name files (`asset_paths`, `pack_paths`, `embed_assets`,
 * `max_embed_bytes`) have no counterpart: the TypeScript core reads no files (A-WEB-1.K1), packs are
 * registered as data and no asset is embedded (R-WEB-001.C5, C7).
 */

import { strRepr } from "./values.js";

export const APPEARANCES = ["light", "dark", "auto", "both"] as const;

/** Logical device sizes in CSS points (width, height). A pack may override them. */
export const DEVICES: ReadonlyMap<string, readonly [number, number]> = new Map([
  ["phone", [393, 852]],
  ["phone-landscape", [852, 393]],
  ["tablet", [1180, 820]],
  ["tablet-portrait", [820, 1180]],
  ["desktop", [1280, 800]],
  ["wide", [1440, 900]],
] as const);

/** Fence attributes accepted on a mockitdown fence (and as element attributes), with their types. */
export const FENCE_OPTIONS: ReadonlyMap<string, "str" | "int" | "bool"> = new Map([
  ["pack", "str"], ["device", "str"], ["appearance", "str"], ["width", "int"], ["height", "int"],
  ["chrome", "str"], ["title", "str"], ["id", "str"], ["caption", "bool"], ["elements", "bool"],
  ["url", "str"], ["source", "bool"], ["window", "str"],
] as const);

/**
 * Supplies the text of a component file for `import "path"`, or null when there is none. Called
 * with each candidate path in turn (R-WEB-001.C6), after the registered components.
 */
export type ImportResolver = (path: string) => string | null | undefined;

export interface RenderOptions {
  /** Pack id; overrides `import <Module>` and `@Screen(pack:)`. */
  pack: string | null;
  /** Pack used when neither the options nor the source name one. */
  default_pack: string;
  device: string | null;
  /** Device used when neither the options nor `@Screen(device:)` name one (before the pack's default). */
  default_device: string | null;
  /** light | dark | auto (follow the page) | both (side by side). null: the source's or the default. */
  appearance: string | null;
  default_appearance: string;
  width: number | null;
  height: number | null;
  /** Chrome kind, or "auto" (the pack's chrome for the device), or "none". */
  chrome: string;
  title: string | null;
  id: string | null;
  caption: boolean;
  elements: boolean;
  /** Append the block's source in a collapsible `<details>` under the figure. */
  source: boolean;
  /** Window kind for packs that draw window frames (e.g. "dialog", "inactive"). */
  window: string | null;
  /** Address shown by browser chrome. */
  url: string | null;
  /** Search paths for `import "path"`, joined with the path as POSIX paths. */
  import_paths: readonly string[];
  /** The path the source came from (relative imports resolve against its directory), if any. */
  source_path: string | null;
  show_warnings: boolean;
  /** Loads component files the registered components do not hold (TypeScript only). */
  import_resolver: ImportResolver | null;
}

export const DEFAULT_OPTIONS: Readonly<RenderOptions> = Object.freeze({
  pack: null,
  default_pack: "base",
  device: null,
  default_device: null,
  appearance: null,
  default_appearance: "light",
  width: null,
  height: null,
  chrome: "auto",
  title: null,
  id: null,
  caption: true,
  elements: false,
  source: false,
  window: null,
  url: null,
  import_paths: [],
  source_path: null,
  show_warnings: false,
  import_resolver: null,
});

/**
 * Options with the given fields set, as Python's `RenderOptions().with_overrides(**values)`: unknown
 * keys and null/undefined values are ignored.
 */
export function renderOptions(...overrides: (Partial<RenderOptions> | Record<string, unknown> | null | undefined)[]): RenderOptions {
  const out: Record<string, unknown> = { ...DEFAULT_OPTIONS };
  for (const values of overrides) {
    if (!values) continue;
    for (const [k, v] of Object.entries(values)) {
      if (k in DEFAULT_OPTIONS && v !== null && v !== undefined) out[k] = v;
    }
  }
  return out as unknown as RenderOptions;
}

export function parseBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

/** Convert fence/element attribute strings to typed values. Returns [values, problems]. */
export function coerceFenceOptions(raw: Record<string, string>): [Record<string, unknown>, string[]] {
  const out: Record<string, unknown> = {};
  const problems: string[] = [];
  for (const [key, val] of Object.entries(raw)) {
    const kind = FENCE_OPTIONS.get(key);
    if (kind === undefined) {
      problems.push(`unknown fence option ${strRepr(key)} (known: ${[...FENCE_OPTIONS.keys()].join(", ")})`);
      continue;
    }
    if (kind === "bool") out[key] = parseBool(val);
    else if (kind === "int") {
      if (!/^\s*[+-]?\d+(_\d+)*\s*$/.test(val)) {
        problems.push(`fence option ${key}=${strRepr(val)} is not a valid int`);
        continue;
      }
      out[key] = Number(val.replace(/_/g, "").trim());
    } else out[key] = val;
  }
  if ("appearance" in out && !(APPEARANCES as readonly string[]).includes(out.appearance as string)) {
    problems.push(`appearance must be one of ${APPEARANCES.join(", ")}`);
    delete out.appearance;
  }
  return [out, problems];
}
