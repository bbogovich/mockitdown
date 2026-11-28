---
requirement: R-EVAL-005
title: Instantiating struct components
status: implemented
version: 0.13.0
date: 2026-11-28
issue: 84
---

# R-EVAL-005 — Instantiating struct components

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.0 | 2026-11-28 | implemented | #84 | Self-embedding structs are found before expansion by a depth-first search over the struct-use graph (body, computed properties, defaults; all branches) and reported once per screen as 'struct S uses itself (S → T → S)', code recursion, with no views; MAX_DEPTH 48 kept as a backstop ('struct S nests too deeply'); Python evaluate.py _cycle/_struct_uses, TypeScript evaluate.ts cycle/structUses | [Evaluation](../narrative/architecture/evaluate.md), [Testing](../narrative/testing.md) |
