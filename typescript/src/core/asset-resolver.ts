/**
 * Image references (port of `mockitdown.assets.AssetResolver`, R-ASSET-001, R-WEB-001.C7).
 *
 * - `http(s)://`, protocol-relative `//` and `data:image/…` references pass through unchanged;
 * - another `data:` URI, or any other scheme (`javascript:`, `file:` …), is refused with a warning;
 * - a local path resolves against the asset base URL, when there is one; nothing is embedded — the
 *   browser loads the file. Without an asset base URL a local path cannot be found, and is reported
 *   as the Python renderer reports it when no asset path holds it.
 */

import type { Diagnostics, Location } from "./diagnostics.js";
import { strRepr } from "./values.js";

const REMOTE = /^(https?:)?\/\//i;
const DATA = /^data:image\/[a-z0-9.+-]+(;[a-z0-9=.+-]+)*,/i;
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const WS_CLASS = "[\\t\\n\\v\\f\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]";
const WS = new RegExp(`^${WS_CLASS}+|${WS_CLASS}+$`, "g");

/** `base` joined with a relative `ref` as URL paths (`base` is a directory URL). */
export function joinUrl(base: string, ref: string): string {
  if (ref.startsWith("/")) return ref;
  return (base.endsWith("/") ? base : base + "/") + ref.replace(/^\.\//, "");
}

export class AssetResolver {
  readonly base: string | null;
  readonly diags: Diagnostics;

  constructor(base: string | null, diags: Diagnostics) {
    this.base = base;
    this.diags = diags;
  }

  /** A URL for `ref` to put in `src`, or null when it is refused or cannot be found. */
  resolve(refIn: string, loc: Location | null = null): string | null {
    const ref = refIn.replace(WS, "");
    if (!ref) return null;
    if (REMOTE.test(ref)) return ref;
    if (ref.toLowerCase().startsWith("data:")) {
      if (DATA.test(ref)) return ref;
      this.diags.warning("only data:image/… URIs are accepted", loc, "asset");
      return null;
    }
    if (SCHEME.test(ref)) {
      this.diags.warning(`unsupported asset scheme in ${strRepr(ref)}`, loc, "asset");
      return null;
    }
    if (this.base) return joinUrl(this.base, ref);
    this.diags.warning(`asset ${strRepr(ref)} not found (searched (no asset paths))`, loc, "asset");
    return null;
  }
}
