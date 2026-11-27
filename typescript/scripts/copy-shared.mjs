#!/usr/bin/env node
// Copy the shared assets the package publishes from the repository's shared/ into dist/shared/
// (R-WEB-001.C2), and the repository LICENSE beside package.json. The TypeScript counterpart of
// python/tools/sync_shared.py: shared/ is the only place these files are written (R-REPO-002).
//
//   node scripts/copy-shared.mjs           copy (run by `npm run build`)
//   node scripts/copy-shared.mjs --check   exit 1 and list what differs
//
// dist/shared/ layout (the same names as in the Python package):
//   page.css  icons.json  vocabulary.json  packs/<id>/pack.json  packs/<id>/pack.css
//   manifest.json   {"packs": [ids, sorted], "files": [every copied path]} for loaders
//
// Files are copied byte for byte, except a pack.css that includes stylesheet partials
// (`@import "../_partials/<name>.css";` lines at its top, R-PACK-018): its copy has each import
// replaced by the partial's text, the partial's placeholder scope `.mkd-scope` at the start of every
// selector replaced by the pack's `.mkd-pack-<id>`. sync_shared.py resolves partials by the same
// steps, so both packages hold byte-identical copies (C5); the partials themselves are not copied (C7).

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = join(PKG, "..", "shared");
const OUT = join(PKG, "dist", "shared");

const FIXED = { "css/page.css": "page.css", "icons/icons.json": "icons.json", "language/vocabulary.json": "vocabulary.json" };
const PACK_FILES = ["pack.json", "pack.css"];

// ---- stylesheet partials (R-PACK-018) --------------------------------------------------------------

/** An include line of a built-in pack's pack.css (C2), and the paths it may name. */
const IMPORT_LINE = /^[ \t]*@import[ \t]+"([^"]*)"[ \t]*;[ \t]*$/;
const PARTIAL_PATH = /^\.\.\/_partials\/([A-Za-z0-9_-]+)\.css$/;
/** The placeholder scope every selector of a partial starts with (C3). */
const SCOPE = ".mkd-scope";
/** White space as CSS defines it (the same set as sync_shared.WS). */
const WS = " \t\n\r\f";
/** Words a partial must not contain (C3). */
const FORBIDDEN = ["@import", "data-appearance", "prefers-color-scheme"];

/** A pack.css include that cannot be resolved, or a partial that breaks R-PACK-018.C3 (C6). */
export class PartialError extends Error {
  constructor(message) {
    super(message);
    this.name = "PartialError";
  }
}

function stripWs(s) {
  let a = 0;
  let b = s.length;
  while (a < b && WS.includes(s[a])) a++;
  while (b > a && WS.includes(s[b - 1])) b--;
  return s.slice(a, b);
}

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?(\*\/|$)/g, "");
}

/** The index after the comment or string starting at i, or i when none starts there. */
function skipCommentOrString(css, i) {
  if (css.startsWith("/*", i)) {
    const j = css.indexOf("*/", i + 2);
    return j < 0 ? css.length : j + 2;
  }
  if (css[i] === '"' || css[i] === "'") {
    const q = css[i];
    let j = i + 1;
    while (j < css.length && css[j] !== q) j += css[j] === "\\" ? 2 : 1;
    return Math.min(j + 1, css.length);
  }
  return i;
}

/**
 * [offset, text] of every selector in a stylesheet: each comma-separated part of a rule's prelude, at
 * its first character that is neither white space nor a comment. At-rule preludes (`@media …`) are not
 * selectors, and the frames of `@keyframes` are skipped.
 */
export function selectorStarts(css) {
  const out = [];
  let i = 0;
  let seg = 0;
  let depth = 0;
  const n = css.length;
  while (i < n) {
    const j = skipCommentOrString(css, i);
    if (j !== i) {
      i = j;
      continue;
    }
    const c = css[i];
    if (c === "(") depth++;
    else if (c === ")") depth = Math.max(depth - 1, 0);
    else if (c === "{") {
      const prelude = stripWs(stripComments(css.slice(seg, i)));
      if (/^@(-[a-z]+-)?keyframes\b/.test(prelude)) {
        let level = 1;
        i++;
        while (i < n && level) {
          const k = skipCommentOrString(css, i);
          if (k !== i) {
            i = k;
            continue;
          }
          if (css[i] === "{") level++;
          else if (css[i] === "}") level--;
          i++;
        }
        seg = i;
        depth = 0;
        continue;
      }
      if (!prelude.startsWith("@")) out.push(...parts(css, seg, i));
      seg = i + 1;
      depth = 0;
    } else if (c === "}" || (c === ";" && depth === 0)) {
      seg = i + 1;
      depth = 0;
    }
    i++;
  }
  return out;
}

/** The selectors of the prelude css[start:end], split at commas outside brackets. */
function parts(css, start, end) {
  const bounds = [];
  let i = start;
  let depth = 0;
  let first = start;
  while (i < end) {
    const j = skipCommentOrString(css, i);
    if (j !== i) {
      i = j;
      continue;
    }
    const c = css[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (c === "," && depth === 0) {
      bounds.push([first, i]);
      first = i + 1;
    }
    i++;
  }
  bounds.push([first, end]);
  const out = [];
  for (let [a, b] of bounds) {
    while (a < b) {
      const j = css.startsWith("/*", a) ? skipCommentOrString(css, a) : a;
      if (j !== a) a = j;
      else if (WS.includes(css[a])) a++;
      else break;
    }
    out.push([a, stripWs(stripComments(css.slice(a, b)))]);
  }
  return out;
}

/** The partial's text with every selector's leading `.mkd-scope` replaced by `.mkd-pack-<id>`. */
export function scopePartial(css, packId, where) {
  for (const word of FORBIDDEN) {
    if (css.includes(word)) throw new PartialError(`${where}: a partial must not contain ${word}`);
  }
  const starts = selectorStarts(css);
  for (const [, sel] of starts) {
    if (!(sel === SCOPE || (sel.startsWith(SCOPE) && WS.includes(sel[SCOPE.length])))) {
      throw new PartialError(`${where}: selector "${sel}" does not start with ${SCOPE}`);
    }
  }
  for (const [off] of [...starts].reverse()) {
    css = css.slice(0, off) + `.mkd-pack-${packId}` + css.slice(off + SCOPE.length);
  }
  return css;
}

/**
 * A built-in pack's stylesheet with its partials included (R-PACK-018.C4); unchanged when it includes
 * none. A PartialError names the pack and the path when an include cannot be resolved (C6).
 */
export function resolveCss(css, packId, partials) {
  if (!css.includes("@import")) return css;
  const out = [];
  let inComment = false;
  let prelude = true;
  const lines = css.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  lines.forEach((line, idx) => {
    const no = idx + 1;
    const startsInComment = inComment;
    let code = "";
    let k = 0;
    while (k < line.length) {
      if (inComment) {
        const j = line.indexOf("*/", k);
        if (j < 0) k = line.length;
        else {
          inComment = false;
          k = j + 2;
        }
      } else if (line.startsWith("/*", k)) {
        inComment = true;
        k += 2;
      } else {
        code += line[k];
        k++;
      }
    }
    const bare = line.replace(/[\r\n]+$/, "");
    const m = startsInComment ? null : IMPORT_LINE.exec(bare);
    if (m === null) {
      if (code.includes("@import")) {
        const where = prelude ? "not on a line of its own" : "after the first rule";
        throw new PartialError(`pack '${packId}': line ${no}: @import ${where}: ${stripWs(line)}`);
      }
      if (stripWs(code)) prelude = false;
      out.push(line);
      return;
    }
    const path = m[1];
    if (!prelude) throw new PartialError(`pack '${packId}': line ${no}: @import "${path}" after the first rule`);
    const pm = PARTIAL_PATH.exec(path);
    if (pm === null) {
      throw new PartialError(`pack '${packId}': line ${no}: @import "${path}" names a path outside ../_partials/`);
    }
    const f = join(partials, `${pm[1]}.css`);
    if (!existsSync(f) || !statSync(f).isFile()) {
      throw new PartialError(`pack '${packId}': line ${no}: @import "${path}": no such partial`);
    }
    let body = scopePartial(readFileSync(f, "utf8"), packId, `pack '${packId}': partial "${path}"`);
    const ending = line.slice(bare.length);
    if (ending && !(body.endsWith("\n") || body.endsWith("\r"))) body += ending;
    out.push(body);
  });
  return out.join("");
}

/** The package copy of `<packs>/<id>/pack.css`, partials resolved from `<packs>/_partials/`. */
export function resolvePackCss(packs, id) {
  return resolveCss(readFileSync(join(packs, id, "pack.css"), "utf8"), id, join(packs, "_partials"));
}

/** What the package copy of a shared file holds: its bytes, or for a pack.css its resolved text. */
export function copyBytes(src) {
  const raw = readFileSync(src);
  if (basename(src) === "pack.css" && raw.includes("@import")) {
    return Buffer.from(resolvePackCss(dirname(dirname(src)), basename(dirname(src))), "utf8");
  }
  return raw;
}

/** copyBytes as text (the copies are UTF-8). */
export function copyText(src) {
  return copyBytes(src).toString("utf8");
}

// ---- the copy --------------------------------------------------------------------------------------

function pairs() {
  const out = [[join(PKG, "..", "LICENSE"), join(PKG, "LICENSE")]];
  for (const [src, dst] of Object.entries(FIXED)) out.push([join(SHARED, src), join(OUT, dst)]);
  for (const id of packIds()) {
    for (const name of PACK_FILES) {
      const src = join(SHARED, "packs", id, name);
      if (existsSync(src)) out.push([src, join(OUT, "packs", id, name)]);
    }
  }
  return out;
}

/** The pack ids of a packs folder: its directories holding a pack.json (so never `_partials`, C1). */
export function packIds(packs = join(SHARED, "packs")) {
  return readdirSync(packs)
    .filter((d) => existsSync(join(packs, d, "pack.json")))
    .sort();
}

function manifest() {
  const files = pairs().filter(([, d]) => d.startsWith(OUT)).map(([, d]) => d.slice(OUT.length + 1).split("\\").join("/"));
  return JSON.stringify({ packs: packIds(), files }, null, 2) + "\n";
}

function same(data, b) {
  return existsSync(b) && data.equals(readFileSync(b));
}

function main() {
  if (!existsSync(SHARED) || !statSync(SHARED).isDirectory()) {
    console.error(`no shared/ at ${SHARED}`);
    return 2;
  }
  if (process.argv.includes("--check")) {
    const bad = pairs().filter(([s, d]) => !same(copyBytes(s), d)).map(([, d]) => d);
    const m = join(OUT, "manifest.json");
    if (!existsSync(m) || readFileSync(m, "utf8") !== manifest()) bad.push(m);
    for (const p of bad) console.log(`differs or missing: ${p}`);
    return bad.length ? 1 : 0;
  }
  // Remove packs that left shared/, then copy what differs.
  if (existsSync(join(OUT, "packs"))) {
    const keep = new Set(packIds());
    for (const d of readdirSync(join(OUT, "packs"))) if (!keep.has(d)) rmSync(join(OUT, "packs", d), { recursive: true });
  }
  let n = 0;
  for (const [src, dst] of pairs()) {
    const data = copyBytes(src);
    if (!same(data, dst)) {
      mkdirSync(dirname(dst), { recursive: true });
      if (data.equals(readFileSync(src))) copyFileSync(src, dst);
      else writeFileSync(dst, data);
      n++;
    }
  }
  writeFileSync(join(OUT, "manifest.json"), manifest());
  console.log(`copied ${n} file(s) from shared/ into dist/shared/ (${packIds().length} packs)`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main();
  } catch (e) {
    if (!(e instanceof PartialError)) throw e;
    console.error(`error: ${e.message}`);
    process.exitCode = 1;
  }
}
