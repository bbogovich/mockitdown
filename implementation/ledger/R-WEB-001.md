---
requirement: R-WEB-001
title: TypeScript package and core
status: implemented
version: 0.13.8
date: 2026-11-28
issue: 29
---

# R-WEB-001 — TypeScript package and core

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.8 | 2026-11-28 | implemented | #29 | scripts/copy-shared.mjs copies shared/reference/index.json and every <pack>.json into dist/shared/reference/, listed under the manifest's reference and not under files (C13, C17), --check covers them; SharedManifest.reference; reference.test.ts (TC-5) | [TypeScript core](../narrative/architecture/typescript.md), [The gallery element](../narrative/architecture/gallery-element.md), [Testing](../narrative/testing.md) |
| 0.6.4 | 2026-11-25 | implemented | #4 | part 2 (#4): renderer port — render/html (all 90 roles), style (modifiers → CSS), charts, chrome, figure assembly with sha1 anchor prefix, icons over icons.json, AssetResolver by asset_base (never embedded), Python number formatting (pyformat.ts); render/check/RenderResult/errorHtml in core/api.ts; all 572 conformance cases render byte-identical HTML and identical diag.json (IT-10, 0 todo), IT-11 render API | [TypeScript core](../narrative/architecture/typescript.md), [Testing](../narrative/testing.md) |
| 0.6.3 | 2026-11-25 | partial | #3 | part 1 (#3): typescript/ npm package (MIT, ESM, no runtime deps, devDeps typescript + @playwright/test); tsc build to dist/ + scripts/copy-shared.mjs (dist/shared/ with manifest.json); core port of lexer, parser, AST, evaluator (imports via registerComponents / import_resolver), pack registry (registerPack, inheritance, module selection), diagnostics, options, stylesheet, Python value model; node:test suites IT-9 and IT-10 (conformance: parse + evaluation-stage diagnostics and lineage for all 572 cases; render comparison todo for #4) | [TypeScript core](../narrative/architecture/typescript.md), [Testing](../narrative/testing.md), [Repository layout and shared assets](../narrative/repository.md) |
