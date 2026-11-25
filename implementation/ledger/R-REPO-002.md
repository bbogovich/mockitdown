---
requirement: R-REPO-002
title: Shared assets are the single source
status: implemented
version: 0.6.1
date: 2026-11-25
issue: 1
---

# R-REPO-002 — Shared assets are the single source

<!-- written by `sio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.6.1 | 2026-11-25 | implemented | #1 | As built (0.6.1): vocabulary.json carries neutral_modules. | [Repository layout and shared assets](../narrative/repository.md), [Evaluation](../narrative/architecture/evaluate.md) |
| 0.6.0 | 2026-11-25 | implemented | #1 | Packs, page.css, icons.json (glyphs, aliases) and vocabulary.json (rendered, ignored, neutral_modules) only in shared/; python/tools/sync_shared.py copies them into the package, run by setup.py at build; icons.py and vocabulary.py load the JSON; tests/test_shared.py detects a stale copy. | [Repository layout and shared assets](../narrative/repository.md), [Architecture overview](../narrative/architecture/index.md), [Packs](../narrative/architecture/packs.md), [Styles and assets](../narrative/architecture/styles-assets.md), [Evaluation](../narrative/architecture/evaluate.md) |
