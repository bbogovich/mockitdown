---
id: R-WEB-007
title: TypeScript release builds on GitHub
status: active
version: 0.11.0
rev: 0
page: WEB.1
slot: reqs
order: 3
source: [SRC-18]
realizes: [F-17]
requires: [R-WEB-001, R-WEB-005]
decisions: [ADR-23]
hash: 9c122e13ea8d
---

C1: Pushing a tag `ts-vX.Y.Z` MUST run the workflow `.github/workflows/release-ts.yml`, and only such a tag; the Python release workflow (tags `vX.Y.Z`) MUST NOT run for it.
C2: The workflow MUST fail before building when the tag's version differs from `version` in `typescript/package.json`.
C3: The workflow MUST install with `npm ci` in `typescript/`, run `npm audit --audit-level=high` and `npm test` (with Chromium installed for the browser tests), and stop at the first failure.
C4: The workflow MUST build the package archive with `npm pack` in `typescript/`, giving `mockitdown-X.Y.Z.tgz`, which holds `package.json`, `README.md`, `LICENSE` and `dist/` with `dist/shared/` and its `manifest.json`, and no test, source or page file.
C5: The workflow MUST create a GitHub release for the tag, titled `mockitdown TypeScript X.Y.Z`, with the archive attached, using only the workflow's own `GITHUB_TOKEN` (permission `contents: write`).
C6: The release notes MUST give the install command `npm install https://github.com/bbogovich/mockitdown/releases/download/ts-vX.Y.Z/mockitdown-X.Y.Z.tgz` and list the commits since the previous `ts-v` tag.
C7: The workflow MUST NOT publish to the npm registry.
C8: `typescript/README.md` MUST describe installing a release from its GitHub release archive, with the install command of C6.
V1: A tag `ts-v0.1.0` on a commit whose `typescript/package.json` says 0.1.0 produces a release with `mockitdown-0.1.0.tgz`; installing that archive into an empty project and importing `mockitdown` works.
<!-- file: TC-1.md -->
---
id: TC-1
title: A tagged release
verifies: [C1, C2, C3, C5, C6, C7]
---

Run by the issue that adds the workflow, after merging, with the release flow of the project's
instructions:

1. `.github/workflows/release-ts.yml` triggers on `push: tags: ["ts-v*"]` only, and `release.yml`'s
   `v*` does not match `ts-v0.1.0` (checked by reading both files; a unit test in
   `typescript/tests/unit/package.test.ts` parses both workflow files for their tag filters) (C1).
2. The same unit test finds, in order, the version check, `npm ci`, `npm audit --audit-level=high`,
   the Playwright Chromium install, `npm test`, `npm pack` and `gh release create`, the permission
   `contents: write`, no `NPM_TOKEN` or other secret but `GITHUB_TOKEN`, and no `npm publish` (C2, C3,
   C5, C7).
3. Pushing `ts-v0.1.0`: `gh run watch` on the `release-ts` run succeeds; `gh release view ts-v0.1.0`
   shows the title `mockitdown TypeScript 0.1.0`, the asset `mockitdown-0.1.0.tgz` and notes holding the
   install command of C6 (C5, C6).
4. In a fresh folder in the scratchpad, `npm install <the C6 URL>` succeeds, and a Node script that
   imports `mockitdown/node` and renders `Text("Hi")` with `pack: "base"` prints HTML with no diagnostic.
<!-- file: TC-2.md -->
---
id: TC-2
title: Archive content and README
verifies: [C4, C8]
---

Unit test in `typescript/tests/unit/package.test.ts`: `npm pack --dry-run --json` after the build lists
`package.json`, `README.md`, `LICENSE`, `dist/mockitdown.js`, `dist/shared/manifest.json` and every
file of the manifest, and no path under `src/`, `tests/`, `test-build/`, `pages/` or `scripts/` (C4);
`README.md` contains `releases/download/ts-v` and `npm install https://github.com/bbogovich/mockitdown/releases/download/` (C8).
<!-- file: prose.md -->
**Requirement.** The TypeScript library is released by tagging `ts-vX.Y.Z`: a workflow checks the tag,
tests, packs the package with `npm pack` and attaches the archive to a GitHub release.

**Rationale.** SRC-18#gallery asks for release builds of the packaged TypeScript library on GitHub so
projects can use it; F-17.C7. Why its own tags and no npm registry: ADR-23.

**Verification.** TC-1 (the workflow, checked on a real tag), TC-2 (the archive's content, in `npm test`).
