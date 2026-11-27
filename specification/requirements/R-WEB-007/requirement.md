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
