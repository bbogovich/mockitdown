---
id: TC-2
title: Archive content and README
verifies: [C4, C8]
---

Unit test in `typescript/tests/unit/package.test.ts`: `npm pack --dry-run --json` after the build lists
`package.json`, `README.md`, `LICENSE`, `dist/mockitdown.js`, `dist/shared/manifest.json` and every
file of the manifest, and no path under `src/`, `tests/`, `test-build/`, `pages/` or `scripts/` (C4);
`README.md` contains `releases/download/ts-v` and `npm install https://github.com/bbogovich/mockitdown/releases/download/` (C8).
