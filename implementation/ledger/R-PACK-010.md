---
requirement: R-PACK-010
title: Hidden packs
status: implemented
version: 0.12.13
date: 2026-11-27
issue: 61
---

# R-PACK-010 — Hidden packs

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.13 | 2026-11-27 | implemented | #61 | C2: gen_reference.py writes shared/reference/<id>.json for lcars, phosphor and hologram (group null, C4) and lists them under hidden in index.json, no page or nav entry; C5: gen_conformance.py adds their pack-<id>-own-<n> cases (683 cases); C1/C3 tests: mockitdown packs, pack= and import LCARS, eggs/ pages outside the nav; IT-44 | [The pack gallery](../narrative/architecture/gallery.md), [Repository layout and shared assets](../narrative/repository.md), [Conformance corpus](../narrative/conformance.md), [Testing](../narrative/testing.md) |
