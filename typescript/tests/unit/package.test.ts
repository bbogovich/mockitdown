// R-WEB-001 TC-2 (C1, C2): the package's manifest and build output.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { PKG, REPO } from "./helpers.js";

const pkg = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8")) as Record<string, unknown>;

test("package is mockitdown, MIT, ES module (C1)", () => {
  assert.equal(pkg.name, "mockitdown");
  assert.equal(pkg.license, "MIT");
  assert.equal(pkg.type, "module");
});

test("no runtime dependencies and exactly the dev dependencies of ADR-20 (TC-2)", () => {
  for (const key of ["dependencies", "peerDependencies", "optionalDependencies", "bundleDependencies"]) {
    assert.equal(pkg[key], undefined, `package.json must not have ${key}`);
  }
  assert.deepEqual(Object.keys(pkg.devDependencies as object).sort(), ["@playwright/test", "typescript"]);
});

test("the build emits ES modules with declarations and dist/shared/ (C2)", () => {
  for (const f of ["mockitdown.js", "mockitdown.d.ts", "node.js", "core/index.js", "core/index.d.ts"]) {
    assert.ok(existsSync(join(PKG, "dist", f)), `dist/${f}`);
  }
  const manifest = JSON.parse(readFileSync(join(PKG, "dist/shared/manifest.json"), "utf8")) as { packs: string[]; files: string[] };
  assert.ok(manifest.packs.includes("base") && manifest.packs.length >= 38);
  for (const f of ["page.css", "icons.json", "vocabulary.json", "packs/base/pack.json", "packs/base/pack.css"]) {
    assert.ok(manifest.files.includes(f), f);
    assert.equal(readFileSync(join(PKG, "dist/shared", f), "utf8"), readFileSync(join(REPO, "shared", sharedPath(f)), "utf8"),
      `dist/shared/${f} is a copy of shared/`);
  }
});

function sharedPath(f: string): string {
  return ({ "page.css": "css/page.css", "icons.json": "icons/icons.json", "vocabulary.json": "language/vocabulary.json" } as Record<string, string>)[f] ?? f;
}
