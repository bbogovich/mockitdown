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
