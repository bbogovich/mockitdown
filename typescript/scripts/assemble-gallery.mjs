#!/usr/bin/env node
// Assembles the published pack gallery (R-WEB-004.C27-C29): the development server's URL layout
// (R-WEB-003.C5) as static files, so that every test page works unchanged.
//
//   node scripts/assemble-gallery.mjs <out>      e.g. public/gallery (run after `npm run build`)
//
//   <out>/index.html   a meta refresh and a link to pages/index.html, the gallery home page (C29, R-WEB-006)
//   <out>/pages/       typescript/pages/
//   <out>/dist/        typescript/dist/ (the built package, dist/shared/ included)
//   <out>/shared/      the reference/ and patterns/ folders of the repository's shared/
//
// assembleGallery(out) is exported for the unit test.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = resolve(PKG, "..", "shared");

/** The redirect page of `/gallery/` to the home page (C29). */
export const INDEX_HTML = '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n'
  + '  <title>mockitdown gallery</title>\n'
  + '  <meta http-equiv="refresh" content="0; url=pages/index.html">\n'
  + '  <link rel="canonical" href="pages/index.html">\n</head>\n<body>\n'
  + '  <p><a href="pages/index.html">mockitdown gallery</a></p>\n</body>\n</html>\n';

/** Copy the gallery into `out` (replacing what is there); the list of top-level entries written. */
export function assembleGallery(out) {
  const target = resolve(out);
  if (!existsSync(join(PKG, "dist", "mockitdown.js"))) {
    throw new Error("dist/mockitdown.js is missing: run `npm run build` first");
  }
  rmSync(target, { recursive: true, force: true });
  mkdirSync(join(target, "shared"), { recursive: true });
  cpSync(join(PKG, "pages"), join(target, "pages"), { recursive: true });
  cpSync(join(PKG, "dist"), join(target, "dist"), { recursive: true });
  for (const sub of ["reference", "patterns"]) {
    cpSync(join(SHARED, sub), join(target, "shared", sub), { recursive: true });
  }
  writeFileSync(join(target, "index.html"), INDEX_HTML);
  return ["index.html", "pages", "dist", "shared"];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = process.argv[2];
  if (!out) {
    process.stderr.write("usage: node scripts/assemble-gallery.mjs <out>\n");
    process.exit(2);
  }
  try {
    assembleGallery(out);
    process.stdout.write(`gallery assembled in ${resolve(out)}\n`);
  } catch (e) {
    process.stderr.write(`${e.message}\n`);
    process.exit(1);
  }
}
