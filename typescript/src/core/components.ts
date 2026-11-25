/**
 * Component files for `import "path"`, as data (R-WEB-001.C6, A-WEB-1.K1).
 *
 * The Python variant resolves an import against the importing file's directory, then each import
 * search path, trying each candidate as written and then with `.mockitdown`, and reads the file it
 * finds. Here the candidates are the same POSIX paths, and a candidate's text comes from the
 * components an application registered with {@link registerComponents} or, failing that, from the
 * render options' `import_resolver` (which the custom elements back with URLs under an import base).
 * With neither a source path nor search paths, the path is tried as written.
 */

import { parse } from "./syntax/parser.js";
import type * as A from "./syntax/ast.js";
import type { ImportResolver } from "./options.js";

/** Normalise a POSIX path: no empty or `.` segments, `..` folded where it can be. */
export function normalizePath(p: string): string {
  const abs = p.startsWith("/");
  const out: string[] = [];
  for (const seg of p.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === ".." && out.length && out[out.length - 1] !== "..") out.pop();
    else if (seg === ".." && abs) continue;
    else out.push(seg);
  }
  const body = out.join("/");
  return abs ? "/" + body : body || ".";
}

/** `Path(a) / b`, normalised. */
export function joinPath(dir: string, p: string): string {
  if (p.startsWith("/")) return normalizePath(p);
  return normalizePath(dir ? `${dir}/${p}` : p);
}

export function dirname(p: string): string {
  const n = normalizePath(p);
  const i = n.lastIndexOf("/");
  if (i < 0) return ".";
  return i === 0 ? "/" : n.slice(0, i);
}

export function basename(p: string): string {
  const n = normalizePath(p);
  return n.slice(n.lastIndexOf("/") + 1);
}

/** Python's `str(Path(p))`: `.` for an empty path, no trailing or doubled slashes. */
export function pathStr(p: string): string {
  if (p === "") return ".";
  let s = p.replace(/\/{2,}/g, "/");
  s = s.split("/").filter((seg, i, all) => seg !== "." || all.length === 1).join("/") || (p.startsWith("/") ? "/" : ".");
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

const registered = new Map<string, string>();

/**
 * Register a component file's source under a path (`"components/pill.mockitdown"`), so that
 * `import "components/pill"` finds it. Registering a path again replaces its source.
 */
export function registerComponents(name: string, source: string): void {
  registered.set(normalizePath(name), source);
}

/** Forget every registered component file. */
export function clearComponents(): void {
  registered.clear();
}

/** The text of a candidate path: a registered component, else what the resolver supplies. */
export function readComponent(candidate: string, resolver: ImportResolver | null): string | null {
  const key = normalizePath(candidate);
  const hit = registered.get(key);
  if (hit !== undefined) return hit;
  if (resolver) {
    const text = resolver(key);
    if (typeof text === "string") return text;
  }
  return null;
}

const cache = new Map<string, [string, A.Module]>();

/** Parse a component file, reusing the last parse of the same text (Python's `ImportCache`). */
export function loadComponent(path: string, text: string): A.Module {
  const hit = cache.get(path);
  if (hit && hit[0] === text) return hit[1];
  const mod = parse(text, path);
  cache.set(path, [text, mod]);
  return mod;
}
