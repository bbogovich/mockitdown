---
requirement: R-EVAL-003
title: Name resolution for views
status: implemented
version: 0.12.0
date: 2026-11-28
issue: 45
---

# R-EVAL-003 — Name resolution for views

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.0 | 2026-11-28 | implemented | #45 | Dotted element names in both variants: _dotted / dottedName recognise a capitalised dotted callee whose first part is no variable and not Color; _call_view resolves the joined name by C1 and keeps the dotted name on the element or unknown view (data-el="Badge.Ribbon"); _is_view_expr and _call_value treat a resolving dotted call as a view. Conformance eval-dotted-names*. IT-73. | [Evaluation](../narrative/architecture/evaluate.md), [Conformance corpus](../narrative/conformance.md), [Testing](../narrative/testing.md) |
