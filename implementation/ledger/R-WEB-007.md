---
requirement: R-WEB-007
title: TypeScript release builds on GitHub
status: implemented
version: 0.12.12
date: 2026-11-27
issue: 63
---

# R-WEB-007 — TypeScript release builds on GitHub

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.12 | 2026-11-27 | implemented | #63 | .github/workflows/release-ts.yml: on ts-v* tags only, version check against typescript/package.json, npm ci, npm audit --audit-level=high, Playwright Chromium + npm test, npm pack, gh release create 'mockitdown TypeScript X.Y.Z' with the archive and notes (install command, commits since the previous ts-v tag touching typescript/ or shared/), GITHUB_TOKEN only, no npm publish; typescript/README.md Installing a release; IT-46 (TC-1 steps 1-2, TC-2); TC-1 steps 3-4 await the first ts-v tag | [Build and publish](../narrative/build-publish.md), [Testing](../narrative/testing.md) |
