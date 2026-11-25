/**
 * Stylesheet assembly (port of `mockitdown.styles`).
 *
 * The stylesheet for a set of packs is `page.css`, then for each pack, root first, its `pack.css`
 * with px lengths scaled and its token rules.
 *
 * **Scaling.** Inside a frame every length is expressed in the frame unit `--u`; lengths above
 * 1px are rewritten to `calc(N * var(--u))`, so hairlines stay crisp.
 *
 * **Tokens.** `pack.json` tokens become `--mkd-<name>` custom properties on the pack's frames; dark
 * tokens apply to `data-appearance="dark"` frames, and to `"auto"` frames when the page is dark.
 */

import { pageCss } from "./assets.js";
import { registry as defaultRegistry, type Pack, type PackRegistry } from "./packs/registry.js";
import { PyDict, pyStr } from "./values.js";

// Python's `(?<![\w.#-])(-?\d*\.?\d+)px\b`, with Python's Unicode \w, \d and \b.
const PX = /(?<![\p{L}\p{N}_.#-])(-?\p{Nd}*\.?\p{Nd}+)px(?![\p{L}\p{N}_])/gu;

function digitsToAscii(s: string): string {
  return s.replace(/\p{Nd}/gu, (d) => {
    const cp = d.codePointAt(0)!;
    if (cp <= 0x39) return d;
    let start = cp;
    while (start > 0 && /\p{Nd}/u.test(String.fromCodePoint(start - 1))) start--;
    return String((cp - start) % 10);
  });
}

export function scalePx(css: string): string {
  return css.replace(PX, (m: string, g1: string) => {
    const n = Number(digitsToAscii(g1));
    if (Math.abs(n) <= 1) return m;
    return `calc(${g1} * var(--u))`;
  });
}

function decls(tokens: PyDict<unknown>): string {
  const out: string[] = [];
  for (const [k, v] of tokens.items()) {
    const key = pyStr(k);
    const val = pyStr(v);
    if (!/^[A-Za-z0-9_-]+$/.test(key) || /[{};<>]/.test(val)) continue;
    out.push(`--mkd-${key}:${scalePx(val)};`);
  }
  return out.join("");
}

export function tokenCss(pack: Pack): string {
  const scope = `.mkd-pack-${pack.id} .mkd-frame`;
  const lightTokens = pack.tokens.get("light") ?? new PyDict();
  const light = decls(lightTokens);
  const darkTokens = lightTokens.copy();
  for (const [k, v] of (pack.tokens.get("dark") ?? new PyDict()).items()) darkTokens.set(k, v);
  const dark = decls(darkTokens);
  return (
    `${scope}{color-scheme:light;${light}}\n`
    + `${scope}[data-appearance="dark"]{color-scheme:dark;${dark}}\n`
    + `[data-md-color-scheme="slate"] ${scope}[data-appearance="auto"]{color-scheme:dark;${dark}}\n`
    + "@media (prefers-color-scheme: dark){body:not([data-md-color-scheme]) "
    + `${scope}[data-appearance="auto"]{color-scheme:dark;${dark}}}\n`
  );
}

const packCssCache = new Map<string, [string, string]>();

export function packCss(pack: Pack): string {
  const css = pack.cssText();
  if (!css) return "";
  const hit = packCssCache.get(pack.id);
  if (hit && hit[0] === css) return hit[1];
  const out = `/* mockitdown pack: ${pack.id} */\n` + scalePx(css);
  packCssCache.set(pack.id, [css, out]);
  return out;
}

export function minifyCss(css: string): string {
  let out = css.replace(/\/\*[\s\S]*?\*\//g, "");
  out = out.replace(/[\s\x1c-\x1f\x85]+/g, " ");
  out = out.replace(/\s*([{};,>])\s*/g, "$1");
  out = out.split(";}").join("}");
  return out.trim();
}

/** The complete CSS for the given pack ids (their ancestors included once, in order). */
export function buildStylesheet(packIds: readonly string[], registry: PackRegistry = defaultRegistry,
  { minify = true }: { minify?: boolean } = {}): string {
  const seen: string[] = [];
  const parts = [pageCss()];
  for (const pid of packIds) {
    for (const p of registry.get(pid).lineage()) {
      if (seen.includes(p.id)) continue;
      seen.push(p.id);
      parts.push(packCss(p));
      parts.push(tokenCss(p));
    }
  }
  const css = parts.join("\n");
  return minify ? minifyCss(css) : css;
}
