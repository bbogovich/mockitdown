#!/usr/bin/env node
// The development server for the test pages (R-WEB-003): a static file server on node:http and
// node:fs only (ADR-20). `npm run serve` builds the package first, then runs this file.
//
//   node scripts/serve.mjs            http://127.0.0.1:8173/   (PORT=… overrides the port)
//
// URL layout (the same relative paths a page uses from pages/ to dist/ and shared/):
//   /                the index: a generated page linking every test page in pages/
//   /pages/<path>    typescript/pages/
//   /dist/<path>     typescript/dist/     (the built package: dist/mockitdown.js, dist/shared/)
//   /shared/<path>   the repository's shared/ (reference, patterns, conformance, packs)
// Anything else, and any path that resolves outside these folders, is 404 (C3).
//
// startServer({port, host}) is exported for the unit test (port 0 picks a free port).

import { createServer } from "node:http";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** URL prefix → served folder. */
export const ROOTS = {
  pages: join(PKG, "pages"),
  dist: join(PKG, "dist"),
  shared: resolve(PKG, "..", "shared"),
};

/** Content types by extension (C2). */
export const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".ts": "text/plain; charset=utf-8",
  ".mockitdown": "text/plain; charset=utf-8",
  ".mkdesign": "application/json; charset=utf-8",
};

/**
 * Map a request path to a file, or null when it is not one of the served files: decoded, resolved
 * against its folder, and refused unless it stays inside that folder (C3).
 */
export function resolveRequest(rawPath) {
  let path;
  try {
    path = decodeURIComponent(rawPath.split(/[?#]/, 1)[0]);
  } catch {
    return null;
  }
  if (path.includes("\0") || path.includes("\\")) return null;
  const m = /^\/(pages|dist|shared)(\/.*)?$/.exec(path);
  if (!m) return null;
  const root = ROOTS[m[1]];
  const file = resolve(root, "." + (m[2] ?? "/"));
  if (!file.startsWith(root + sep)) return null;
  try {
    if (!statSync(file).isFile()) return null;
  } catch {
    return null;
  }
  return file;
}

/** The test pages: every .html file directly in pages/, with its <title>. */
export function testPages() {
  let names = [];
  try {
    names = readdirSync(ROOTS.pages).filter((n) => n.endsWith(".html")).sort();
  } catch {
    // no pages/ yet
  }
  return names.map((name) => {
    const html = readFileSync(join(ROOTS.pages, name), "utf8");
    const t = /<title>([^<]*)<\/title>/i.exec(html);
    return { name, title: t ? t[1].trim() : name };
  });
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The root page (C4): a link to every test page, generated so that none is ever missing. */
export function indexHtml() {
  const items = testPages()
    .map((p) => `    <li><a href="pages/${esc(encodeURI(p.name))}">${esc(p.title)}</a> <code>pages/${esc(p.name)}</code></li>`)
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>mockitdown test pages</title>
  <style>body{font:16px/1.5 system-ui,sans-serif;margin:2rem auto;max-width:40rem;padding:0 1rem}code{color:#666;font-size:.85em}</style>
</head>
<body>
  <h1>mockitdown test pages</h1>
  <ul>
${items}
  </ul>
</body>
</html>
`;
}

function send(res, status, type, body, head) {
  res.writeHead(status, { "Content-Type": type, "Content-Length": Buffer.byteLength(body), "Cache-Control": "no-store" });
  res.end(head ? undefined : body);
}

export function handle(req, res) {
  const head = req.method === "HEAD";
  if (req.method !== "GET" && !head) {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end();
    return;
  }
  const path = (req.url ?? "/").split(/[?#]/, 1)[0];
  if (path === "/" || path === "/index.html") {
    send(res, 200, TYPES[".html"], indexHtml(), head);
    return;
  }
  const file = resolveRequest(req.url ?? "/");
  if (!file) {
    send(res, 404, "text/plain; charset=utf-8", "not found\n", head);
    return;
  }
  const body = readFileSync(file);
  send(res, 200, TYPES[extname(file).toLowerCase()] ?? "application/octet-stream", body, head);
}

/** Start the server; resolves to {server, port, url, close()}. */
export function startServer({ port = 8173, host = "127.0.0.1" } = {}) {
  return new Promise((resolvePromise, reject) => {
    const server = createServer(handle);
    server.once("error", reject);
    server.listen(port, host, () => {
      const actual = server.address().port;
      resolvePromise({
        server,
        port: actual,
        url: `http://${host}:${actual}/`,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT ? Number(process.env.PORT) : 8173;
  startServer({ port }).then(({ url }) => console.log(`mockitdown test pages: ${url}`), (err) => {
    console.error(`cannot serve on port ${port}: ${err.message}`);
    process.exit(1);
  });
}
