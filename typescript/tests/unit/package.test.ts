// R-WEB-001 TC-2 (C1, C2): the package's manifest and build output.
// R-PACK-018 TC-1 (C1 to C8): stylesheet partials resolved by scripts/copy-shared.mjs, over the fixture
// python/tests/test_shared.py reads too (python/tests/fixtures/partials/), with the same expected bytes.
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { PKG, REPO, setup } from "./helpers.js";

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

// R-PACK-018 TC-1: stylesheet partials.
const core = setup();const FIXTURE = join(REPO, "python", "tests", "fixtures", "partials");

interface CopyShared {
  resolvePackCss(packs: string, id: string): string;
  copyText(src: string): string;
  packIds(packs: string): string[];
  PartialError: new (message: string) => Error;
}

let tool: CopyShared;
let scratch: string;

before(async () => {
  // A computed specifier: scripts/copy-shared.mjs is plain JavaScript with no declarations.
  tool = (await import(new URL("../../scripts/copy-shared.mjs", import.meta.url).href)) as CopyShared;
  scratch = mkdtempSync(join(tmpdir(), "mkd-partials-"));
});
after(() => rmSync(scratch, { recursive: true, force: true }));

let n = 0;
function tree(): string {
  const packs = join(scratch, `t${n++}`, "packs");
  cpSync(join(FIXTURE, "packs"), packs, { recursive: true });
  return packs;
}

function fails(packs: string, id: string, ...needles: string[]): void {
  assert.throws(() => tool.resolvePackCss(packs, id), (e: Error) => {
    assert.ok(e instanceof tool.PartialError, String(e));
    for (const s of needles) assert.ok(e.message.includes(s), `${JSON.stringify(e.message)} names ${s}`);
    return true;
  });
}

test("step 1: the resolved copies are byte-exact, the same bytes as in the Python suite (C4, C5)", () => {
  for (const id of ["one", "two"]) {
    const want = readFileSync(join(FIXTURE, "expected", `${id}.pack.css`), "utf8");
    assert.equal(tool.resolvePackCss(join(FIXTURE, "packs"), id), want, id);
    assert.equal(tool.copyText(join(FIXTURE, "packs", id, "pack.css")), want, id);
  }
});

test("step 2: _partials is not a pack (C1)", () => {
  assert.deepEqual(tool.packIds(join(FIXTURE, "packs")), ["one", "two"]);
});

test("step 3: an import after the first rule fails, naming the pack and the path (C2, C6)", () => {
  const packs = tree();
  const css = join(packs, "one", "pack.css");
  writeFileSync(css, readFileSync(css, "utf8") + '@import "../_partials/demo.css";\n');
  fails(packs, "one", "'one'", "../_partials/demo.css", "after the first rule");
});

test("step 3: an import of a missing partial fails (C6)", () => {
  const packs = tree();
  writeFileSync(join(packs, "one", "pack.css"), '@import "../_partials/missing.css";\n');
  fails(packs, "one", "'one'", "../_partials/missing.css", "no such partial");
});

test("step 3: an import outside ../_partials/ fails (C6)", () => {
  const packs = tree();
  writeFileSync(join(packs, "one", "pack.css"), '@import "../two/pack.css";\n');
  fails(packs, "one", "'one'", "../two/pack.css", "outside ../_partials/");
});

test("step 3: a partial with an unscoped selector fails, naming the partial (C3, C6)", () => {
  const packs = tree();
  writeFileSync(join(packs, "_partials", "demo.css"), ".mkd-button { color: red; }\n");
  fails(packs, "one", "'one'", "../_partials/demo.css", ".mkd-button");
});

test("step 3: a partial with prefers-color-scheme fails (C3, C6)", () => {
  const packs = tree();
  writeFileSync(join(packs, "_partials", "demo.css"),
    "@media (prefers-color-scheme: dark) { .mkd-scope .mkd-button { color: red; } }\n");
  fails(packs, "one", "'one'", "../_partials/demo.css", "prefers-color-scheme");
});

test("the scope is replaced at the start of every selector only, as in the Python suite (C4)", () => {
  const packs = tree();
  writeFileSync(join(packs, "_partials", "demo.css"),
    "/* .mkd-scope in a comment stays */\n" +
    '.mkd-scope .a, .mkd-scope .b:not(.c) { content: ".mkd-scope {"; }\n' +
    "@media (max-width: 400px) { .mkd-scope { gap: 2px; } }\n" +
    "@keyframes mkd-demo { from { opacity: 0; } to { opacity: 1; } }\n");
  writeFileSync(join(packs, "one", "pack.css"), '@import "../_partials/demo.css";\n');
  assert.equal(tool.resolvePackCss(packs, "one"),
    "/* .mkd-scope in a comment stays */\n" +
    '.mkd-pack-one .a, .mkd-pack-one .b:not(.c) { content: ".mkd-scope {"; }\n' +
    "@media (max-width: 400px) { .mkd-pack-one { gap: 2px; } }\n" +
    "@keyframes mkd-demo { from { opacity: 0; } to { opacity: 1; } }\n");
});

test("step 4: dist/shared/packs holds only <id>/pack.css copies, none with @import (C7)", () => {
  const root = join(PKG, "dist", "shared", "packs");
  for (const id of readdirSync(root)) {
    assert.ok(statSync(join(root, id)).isDirectory(), id);
    for (const f of readdirSync(join(root, id))) {
      if (!f.endsWith(".css")) continue;
      assert.equal(f, "pack.css", `${id}/${f}`);
      assert.ok(!readFileSync(join(root, id, f), "utf8").includes("@import"), `${id}/pack.css`);
    }
  }
  const manifest = JSON.parse(readFileSync(join(PKG, "dist/shared/manifest.json"), "utf8")) as { files: string[] };
  assert.deepEqual(manifest.files.filter((f) => f.includes("_partials")), []);
});

test("every dist/shared pack.css is the resolved copy of shared/ (R-REPO-002.C6, R-PACK-018.C4)", () => {
  const manifest = JSON.parse(readFileSync(join(PKG, "dist/shared/manifest.json"), "utf8")) as { packs: string[] };
  for (const id of manifest.packs) {
    const src = join(REPO, "shared", "packs", id, "pack.css");
    if (!existsSync(src)) continue; // a pack without a stylesheet
    assert.equal(readFileSync(join(PKG, "dist/shared/packs", id, "pack.css"), "utf8"), tool.copyText(src), id);
  }
});

test("step 5: registerPack refuses a stylesheet with @import (C8)", () => {
  assert.throws(() => core.registerPack('{"id": "acme", "modules": ["Acme"]}', '@import "../_partials/x.css";\n'),
    (e: Error & { diagnostic?: { message: string } }) => {
      assert.equal(e.diagnostic?.message, "pack 'acme': @import is resolved only in built-in packs");
      return true;
    });
  assert.ok(!core.registry.ids().includes("acme"));
});

test("step 5: an @import inside a comment is not refused (C8)", () => {
  try {
    assert.equal(core.registerPack('{"id": "acme", "modules": ["Acme"]}', "/* no @import here */\n.mkd-pack-acme .mkd-button { color: red; }\n"), "acme");
  } finally {
    core.registry.clearRegistered();
  }
});

test("step 3: an @import sharing its line fails (C2, C6)", () => {
  const packs = tree();
  writeFileSync(join(packs, "one", "pack.css"), '@import "../_partials/demo.css"; /* demo */\n');
  fails(packs, "one", "'one'", "not on a line of its own");
});

// R-WEB-007 TC-1 steps 1 and 2 (C1, C2, C3, C5, C7): the TypeScript release workflow, read as text.
// R-WEB-007 TC-2 (C4, C8): the npm pack archive's content and the README's install command.
const WORKFLOWS = join(REPO, ".github", "workflows");
const releaseTs = (): string => readFileSync(join(WORKFLOWS, "release-ts.yml"), "utf8");

/** The `tags:` filter list of a workflow's `on: push:` trigger, e.g. ["ts-v*"]. */
function tagFilters(text: string): string[] {
  const m = /^on:\s*\n\s+push:\s*\n\s+tags:\s*\[([^\]]*)\]/m.exec(text);
  assert.ok(m, "on: push: tags: [...]");
  return m![1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}

/** The top-level trigger names of a workflow (`on:` children). */
function triggers(text: string): string[] {
  const block = /^on:\s*\n((?:[ \t]+.*\n)+)/m.exec(text);
  assert.ok(block, "on: block");
  return block![1].split("\n").filter((l) => /^ {2}\S/.test(l)).map((l) => l.trim().replace(/:.*$/, ""));
}

/** A GitHub tag glob as a RegExp (`*` matches any run of characters but `/`; anchored at both ends). */
function glob(pattern: string): RegExp {
  return new RegExp("^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*") + "$");
}

test("R-WEB-007 TC-1 step 1: release-ts.yml runs on ts-v tags only, and release.yml not for them (C1)", () => {
  const ts = releaseTs();
  assert.deepEqual(triggers(ts), ["push"]);
  assert.deepEqual(tagFilters(ts), ["ts-v*"]);
  assert.ok(!/^\s+branches:/m.test(ts), "no branch trigger");
  const py = readFileSync(join(WORKFLOWS, "release.yml"), "utf8");
  const pyTags = tagFilters(py).map(glob);
  assert.ok(pyTags.some((r) => r.test("v0.4.0")), "release.yml still runs for v0.4.0");
  assert.ok(!pyTags.some((r) => r.test("ts-v0.1.0")), "release.yml must not match ts-v0.1.0");
  assert.ok(tagFilters(ts).map(glob).every((r) => r.test("ts-v0.1.0") && !r.test("v0.1.0")));
});

test("R-WEB-007 TC-1 step 2: the steps in order, contents: write, GITHUB_TOKEN only, no npm publish (C2, C3, C5, C7)", () => {
  const ts = releaseTs();
  const steps = [
    ["the version check", /GITHUB_REF_NAME[\s\S]*?package\.json|package\.json[\s\S]*?GITHUB_REF_NAME/],
    ["npm ci", /\bnpm ci\b/],
    ["npm audit", /\bnpm audit --audit-level=high\b/],
    ["Chromium install", /\bnpx playwright install --with-deps chromium\b/],
    ["npm test", /\bnpm test\b/],
    ["npm pack", /\bnpm pack\b/],
    ["gh release create", /\bgh release create\b/],
  ] as const;
  let at = 0;
  for (const [name, re] of steps) {
    const m = re.exec(ts.slice(at));
    assert.ok(m, `${name} after position ${at}`);
    at += m!.index + m![0].length;
  }
  assert.match(ts, /^permissions:\s*\n\s+contents: write\s*$/m);
  const secrets = [...ts.matchAll(/secrets\.([A-Za-z_]+)/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(secrets)], ["GITHUB_TOKEN"]);
  assert.ok(!/NPM_TOKEN|NODE_AUTH_TOKEN|registry-url/.test(ts), "no npm registry credentials");
  assert.ok(!/\bnpm publish\b/.test(ts), "no npm publish");
  // C2: the version check fails the job before anything is installed or built.
  assert.ok(ts.indexOf("exit 1") < ts.indexOf("npm ci"), "the version check exits before npm ci");
  // C5, C6: the title and the install command.
  assert.ok(ts.includes('--title "mockitdown TypeScript ${VERSION}"'), "release title");
  assert.ok(ts.includes("npm install https://github.com/${GITHUB_REPOSITORY}/releases/download/${GITHUB_REF_NAME}/mockitdown-${VERSION}.tgz"),
    "install command in the notes");
});

test("R-WEB-007 TC-2: npm pack lists the package files and dist/shared/, and no source, test or page file (C4)", () => {
  const run = spawnSync("npm", ["pack", "--dry-run", "--json"], { cwd: PKG, encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const [info] = JSON.parse(run.stdout) as { filename: string; files: { path: string }[] }[];
  assert.equal(info.filename, `mockitdown-${pkg.version as string}.tgz`);
  const files = new Set(info.files.map((f) => f.path));
  for (const f of ["package.json", "README.md", "LICENSE", "dist/mockitdown.js", "dist/shared/manifest.json"]) {
    assert.ok(files.has(f), f);
  }
  const manifest = JSON.parse(readFileSync(join(PKG, "dist/shared/manifest.json"), "utf8")) as { files: string[] };
  for (const f of manifest.files) assert.ok(files.has(`dist/shared/${f}`), `dist/shared/${f}`);
  for (const f of files) {
    assert.ok(!/^(src|tests|test-build|pages|scripts)\//.test(f), `${f} must not be packed`);
  }
});

test("R-WEB-007 TC-2: the README gives the GitHub release install command (C8)", () => {
  const readme = readFileSync(join(PKG, "README.md"), "utf8");
  assert.ok(readme.includes("releases/download/ts-v"));
  assert.ok(readme.includes("npm install https://github.com/bbogovich/mockitdown/releases/download/"));
});
