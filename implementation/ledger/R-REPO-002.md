---
requirement: R-REPO-002
title: Shared assets are the single source
status: implemented
version: 0.12.4
date: 2026-11-27
issue: 54
---

# R-REPO-002 — Shared assets are the single source

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.4 | 2026-11-27 | implemented | #54 | 0.12.4 is a prose clarification of 0.12.2 (no clause changed); as built in #54. | [Repository layout and shared assets](../narrative/repository.md), [Testing](../narrative/testing.md) |
| 0.12.2 | 2026-11-27 | implemented | #54 | C1 and C6 with partials (#54): shared/packs/_partials/<name>.css is the only place a partial is written; the package copy of a pack.css that includes partials is its resolved text (copy_bytes/copyBytes), which stale() and copy-shared --check compare with. TC-4 steps 1, 2, 3 and 5 written in tests/test_layout.py. | [Repository layout and shared assets](../narrative/repository.md), [Testing](../narrative/testing.md) |
| 0.6.1 | 2026-11-25 | implemented | #1 | As built (0.6.1): vocabulary.json carries neutral_modules. | [Repository layout and shared assets](../narrative/repository.md), [Evaluation](../narrative/architecture/evaluate.md) |
| 0.6.0 | 2026-11-25 | implemented | #1 | Packs, page.css, icons.json (glyphs, aliases) and vocabulary.json (rendered, ignored, neutral_modules) only in shared/; python/tools/sync_shared.py copies them into the package, run by setup.py at build; icons.py and vocabulary.py load the JSON; tests/test_shared.py detects a stale copy. | [Repository layout and shared assets](../narrative/repository.md), [Architecture overview](../narrative/architecture/index.md), [Packs](../narrative/architecture/packs.md), [Styles and assets](../narrative/architecture/styles-assets.md), [Evaluation](../narrative/architecture/evaluate.md) |
