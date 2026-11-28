// R-WEB-003 TC-1 (V1, C1–C4): the development server on a free port — the index links every test
// page, modules, pack stylesheets, JSON and .mockitdown files come with their content types, and
// paths outside the served folders are 404; A-WEB-2.P2/K2: loadAssetsFromUrl over HTTP.
import assert from "node:assert/strict";
import { request } from "node:http";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { PKG } from "./helpers.js";

interface Server { port: number; url: string; close(): Promise<void> }
let server: Server;

before(async () => {
  // A computed specifier: scripts/serve.mjs is plain JavaScript with no declarations.
  const mod = (await import(new URL("../../scripts/serve.mjs", import.meta.url).href)) as {
    startServer(o: { port: number }): Promise<Server>;
  };
  server = await mod.startServer({ port: 0 });
});
after(() => server.close());

/** A raw GET, so that the path reaches the server exactly as written (no URL normalisation). */
function get(path: string, method = "GET"): Promise<{ status: number; type: string; body: string }> {
  return new Promise((resolve, reject) => {
    const req = request({ host: "127.0.0.1", port: server.port, path, method }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk: string) => { body += chunk; });
      res.on("end", () => resolve({ status: res.statusCode ?? 0, type: String(res.headers["content-type"] ?? ""), body }));
    });
    req.on("error", reject);
    req.end();
  });
}

test("the root is an index linking every test page (C4)", async () => {
  const r = await get("/");
  assert.equal(r.status, 200);
  assert.match(r.type, /^text\/html/);
  const pages = readdirSync(join(PKG, "pages")).filter((n) => n.endsWith(".html"));
  assert.ok(pages.length > 0);
  for (const name of pages) assert.ok(r.body.includes(`href="pages/${name}"`), `index links pages/${name}`);
});

test("pages, modules, pack stylesheets, JSON and .mockitdown with their content types (C1, C2, C5, C7)", async () => {
  const cases: [string, RegExp][] = [
    ["/pages/core.html", /^text\/html/],
    ["/dist/mockitdown.js", /^text\/javascript/],
    ["/dist/shared/packs/swiftui/pack.css", /^text\/css/],
    ["/dist/shared/manifest.json", /^application\/json/],
    ["/shared/conformance/index.json", /^application\/json/],
    ["/shared/conformance/components/pill.mockitdown", /^text\/plain; charset=utf-8$/],
    ["/pages/designer-sample.mkdesign", /^application\/json; charset=utf-8$/],
  ];
  for (const [path, type] of cases) {
    const r = await get(path);
    assert.equal(r.status, 200, path);
    assert.match(r.type, type, path);
    assert.ok(r.body.length > 0, path);
  }
});

test("paths outside the served folders are 404 (C3)", async () => {
  for (const path of [
    "/../package.json", "/package.json", "/dist/../package.json", "/dist/../../shared/css/page.css",
    "/pages/%2e%2e/package.json", "/dist/..%2f..%2fREADME.md", "/shared/..%5cREADME.md", "/shared/%00",
    "/dist", "/dist/", "/src/mockitdown.ts", "/pages/%E0%A4%A",
  ]) {
    const r = await get(path);
    assert.equal(r.status, 404, path);
  }
});

test("methods other than GET and HEAD are 405 (C8)", async () => {
  assert.equal((await get("/pages/core.html", "POST")).status, 405);
  assert.equal((await get("/pages/core.html", "HEAD")).status, 200);
});

test("loadAssetsFromUrl loads dist/shared/ over HTTP into the core (A-WEB-2)", async () => {
  const { loadAssetsFromUrl, render } = await import("../../dist/mockitdown.js");
  const manifest = await loadAssetsFromUrl(server.url + "dist/shared");
  assert.ok(manifest.packs.includes("swiftui"));
  const r = render("import SwiftUI\nText(\"Hi\")", {});
  assert.deepEqual(r.packs, ["base", "swiftui"]);
  assert.equal(r.diagnostics.length, 0);
  const again = server.url + "dist/shared/";
  assert.equal(loadAssetsFromUrl(again), loadAssetsFromUrl(again), "one load per base (K2)");
  await loadAssetsFromUrl(again);
  const missing = server.url + "dist/nothing/";
  await assert.rejects(loadAssetsFromUrl(missing), /dist\/nothing\/manifest\.json \(HTTP 404\)/);
  await assert.rejects(loadAssetsFromUrl(missing), /HTTP 404/, "a failed load is retried (K2)");
});
