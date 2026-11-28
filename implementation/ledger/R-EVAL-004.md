---
requirement: R-EVAL-004
title: Binding element arguments
status: implemented
version: 0.13.12
date: 2026-11-28
issue: 33
---

# R-EVAL-004 — Binding element arguments

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.12 | 2026-11-28 | implemented | #33 | Labels taken from the params keys of roles.json (C8, C11, C12); a label an element's types names is understood (C7) | [Evaluation](../narrative/architecture/evaluate.md), [Parameter and modifier types](../narrative/architecture/types.md) |
| 0.10.0 | 2026-11-28 | implemented | #32 | Unknown labelled arguments warned in both variants: _understood / understood in the evaluators, the reads lists of shared/language/roles.json (roles.py, roleReads), Arg.loc and Ident.binding in the parsers; packs, patterns and the example site fixed to stay warning-free; diag-unknown-label, IT-60 | [Evaluation](../narrative/architecture/evaluate.md), [Role rules](../narrative/architecture/roles.md), [Testing](../narrative/testing.md) |
