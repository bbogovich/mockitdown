---
requirement: R-WEB-001
title: TypeScript package and core
status: partial
version: 0.6.3
date: 2026-11-25
issue: 3
---

# R-WEB-001 — TypeScript package and core

<!-- written by `sio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.6.3 | 2026-11-25 | partial | #3 | part 1 (#3): typescript/ npm package (MIT, ESM, no runtime deps, devDeps typescript + @playwright/test); tsc build to dist/ + scripts/copy-shared.mjs (dist/shared/ with manifest.json); core port of lexer, parser, AST, evaluator (imports via registerComponents / import_resolver), pack registry (registerPack, inheritance, module selection), diagnostics, options, stylesheet, Python value model; node:test suites IT-9 and IT-10 (conformance: parse + evaluation-stage diagnostics and lineage for all 572 cases; render comparison todo for #4) | [TypeScript core](../narrative/architecture/typescript.md), [Testing](../narrative/testing.md), [Repository layout and shared assets](../narrative/repository.md) |
