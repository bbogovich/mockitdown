---
requirement: R-PACK-018
title: Stylesheet partials
status: implemented
version: 0.12.5
date: 2026-11-27
issue: 55
---

# R-PACK-018 — Stylesheet partials

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.5 | 2026-11-27 | implemented | #55 | 0.12.5 is the as-built correction of TC-2, TC-3 and the prose by #55 (no clause changed); C1-C10 implemented. | [Repository layout and shared assets](../narrative/repository.md), [Pack authoring guide](../narrative/pack-authoring.md), [Testing](../narrative/testing.md) |
| 0.12.4 | 2026-11-27 | implemented | #55 | C9-C10 built (#55): shared rules moved into four partials (mac-1bit.css for lisa and mac-classic, material3.css for android and angular-material, win-button.css for winxp and vista, crt.css for nls and phosphor), differing names listed together in the partial's selectors and differing layers read from custom properties the pack sets (--mc-arrow-*); runs repeated inside win95 and hologram merged into one rule or custom properties (--ho-clip, --ho-cuts); base unchanged (no rule common to every pack). test_packs.py test_no_duplicated_css_runs (TC-2) finds no six-line run; css-migration.spec.mjs (TC-3) found all 36 captures of the ten changed packs pixel-identical; conformance corpus and reference JSON unchanged. | [Repository layout and shared assets](../narrative/repository.md), [Pack authoring guide](../narrative/pack-authoring.md), [Testing](../narrative/testing.md) |
| 0.12.4 | 2026-11-27 | partial | #54 | 0.12.4 is a prose clarification of 0.12.2 (no clause changed); C1-C8 as built in #54, C9-C10 are #55. | [Repository layout and shared assets](../narrative/repository.md), [Packs](../narrative/architecture/packs.md), [Pack authoring guide](../narrative/pack-authoring.md), [Testing](../narrative/testing.md) |
| 0.12.2 | 2026-11-27 | partial | #54 | C1-C8 built (#54): python/tools/sync_shared.py and typescript/scripts/copy-shared.mjs resolve @import "../_partials/<name>.css" lines at the top of a built-in pack.css by the same steps (resolve_pack_css/resolvePackCss, scope_partial/scopePartial, selector_starts/selectorStarts), replacing each selector's leading .mkd-scope with .mkd-pack-<id>, failing with PartialError on a late, same-line, missing or outside include and on a partial breaking C3; partials are never copied; PackRegistry.get (pack_paths) and registerPack refuse a stylesheet with @import outside comments. Fixture python/tests/fixtures/partials/ asserted byte for byte by both suites. C9-C10 (moving the duplicated rules, duplicate check) are #55. | [Repository layout and shared assets](../narrative/repository.md), [Packs](../narrative/architecture/packs.md), [Pack authoring guide](../narrative/pack-authoring.md), [Testing](../narrative/testing.md) |
