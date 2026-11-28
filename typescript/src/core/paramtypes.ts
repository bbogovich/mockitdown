/**
 * Parameter and modifier types (R-PACK-017.C2): what kind of value a labelled argument or a modifier
 * argument takes, so that a design tool can choose a matching control. Rendering never reads them.
 *
 * In the shared data a type is written as its name (`"bool"`) or as an object (`{"type": "enum", "values":
 * [...]}`, `{"type": "array", "items": …}`, `{"type": "number", "min": 0, "max": 1}`); the lookups always
 * give the object form ({@link TypeSpec}).
 */

import { PyDict } from "./values.js";

export const PARAM_TYPES = ["text", "number", "bool", "color", "icon", "enum", "array"] as const;
export type ParamTypeName = (typeof PARAM_TYPES)[number];

/** A type in its object form. */
export type TypeSpec =
  | { readonly type: "text" | "bool" | "color" | "icon" }
  | { readonly type: "number"; readonly min?: number; readonly max?: number }
  | { readonly type: "enum"; readonly values: readonly string[] }
  | { readonly type: "array"; readonly items: TypeSpec };

/** The object form of a type as written in the shared data, or null when it is not a type of C2. */
export function normalizeType(raw: unknown): TypeSpec | null {
  const v = plain(raw);
  if (typeof v === "string") return (PARAM_TYPES as readonly string[]).includes(v) && v !== "enum" && v !== "array" ? Object.freeze({ type: v }) as TypeSpec : null;
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  switch (o.type) {
    case "text": case "bool": case "color": case "icon":
      return Object.freeze({ type: o.type });
    case "number": {
      const out: { type: "number"; min?: number; max?: number } = { type: "number" };
      if (typeof o.min === "number") out.min = o.min;
      if (typeof o.max === "number") out.max = o.max;
      return Object.freeze(out);
    }
    case "enum": {
      if (!Array.isArray(o.values) || !o.values.length || !o.values.every((x) => typeof x === "string")) return null;
      return Object.freeze({ type: "enum", values: Object.freeze([...o.values as string[]]) });
    }
    case "array": {
      const items = normalizeType(o.items);
      return items ? Object.freeze({ type: "array", items }) : null;
    }
    default:
      return null;
  }
}

/** A map of names to types, the entries that are not a type left out. */
export function typeMap(raw: unknown): Map<string, TypeSpec> {
  const out = new Map<string, TypeSpec>();
  const v = plain(raw);
  if (!v || typeof v !== "object" || Array.isArray(v)) return out;
  for (const [k, t] of Object.entries(v as Record<string, unknown>)) {
    const spec = normalizeType(t);
    if (spec) out.set(k, spec);
  }
  return out;
}

/** Plain JSON from a value that may hold the core's {@link PyDict}s (packs are parsed into them). */
function plain(v: unknown): unknown {
  if (v instanceof PyDict) return Object.fromEntries(v.items().map(([k, x]) => [String(k), plain(x)]));
  if (Array.isArray(v)) return v.map(plain);
  return v;
}
