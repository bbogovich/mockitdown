// A-WEB-1.K1: the TypeScript core touches no DOM, network or file system; assets reach it as data.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { PKG } from "./helpers.js";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? files(p) : p.endsWith(".ts") ? [p] : [];
  });
}

test("src/core uses no DOM, network or file-system API (A-WEB-1.K1)", () => {
  const banned = /\b(document|window|navigator|globalThis|process)\s*\.|\b(fetch|require|XMLHttpRequest|WebSocket)\s*\(|\blocalStorage\b|from\s+"node:|\bimport\s*\(/;
  for (const f of files(join(PKG, "src/core"))) {
    const code = readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    assert.doesNotMatch(code, banned, f);
  }
});
