---
requirement: R-REND-007
title: Static, deterministic output
status: implemented
version: 0.12.10
date: 2026-11-27
issue: 59
---

# R-REND-007 — Static, deterministic output

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.10 | 2026-11-27 | implemented | #59 | C1-C4 implemented; fixed by TC-1: a text field's root had no ARIA role, now role=textbox (roles/controls.py r_textfield, controls.ts textfield), 182 conformance cases regenerated; verified by test_markup.py StaticOutputTests (TC-1) (#59). | [Rendering](../narrative/architecture/render.md), [Conformance corpus](../narrative/conformance.md), [Testing](../narrative/testing.md) |
