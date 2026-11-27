---
requirement: R-PACK-018
title: Stylesheet partials
status: partial
version: 0.12.4
date: 2026-11-27
issue: 54
---

# R-PACK-018 — Stylesheet partials

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.4 | 2026-11-27 | partial | #54 | 0.12.4 is a prose clarification of 0.12.2 (no clause changed); C1-C8 as built in #54, C9-C10 are #55. | [Repository layout and shared assets](../narrative/repository.md), [Packs](../narrative/architecture/packs.md), [Pack authoring guide](../narrative/pack-authoring.md), [Testing](../narrative/testing.md) |
| 0.12.2 | 2026-11-27 | partial | #54 | C1-C8 built (#54): python/tools/sync_shared.py and typescript/scripts/copy-shared.mjs resolve @import "../_partials/<name>.css" lines at the top of a built-in pack.css by the same steps (resolve_pack_css/resolvePackCss, scope_partial/scopePartial, selector_starts/selectorStarts), replacing each selector's leading .mkd-scope with .mkd-pack-<id>, failing with PartialError on a late, same-line, missing or outside include and on a partial breaking C3; partials are never copied; PackRegistry.get (pack_paths) and registerPack refuse a stylesheet with @import outside comments. Fixture python/tests/fixtures/partials/ asserted byte for byte by both suites. C9-C10 (moving the duplicated rules, duplicate check) are #55. | [Repository layout and shared assets](../narrative/repository.md), [Packs](../narrative/architecture/packs.md), [Pack authoring guide](../narrative/pack-authoring.md), [Testing](../narrative/testing.md) |
