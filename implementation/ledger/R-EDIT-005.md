---
requirement: R-EDIT-005
title: The design document module
status: implemented
version: 0.13.3
date: 2026-11-28
issue: 24
---

# R-EDIT-005 — The design document module

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.3 | 2026-11-28 | implemented | #24 | typescript/src/design.ts and src/design/ (json.ts, document.ts): the subpath mockitdown/design; readDesign over an ordered JSON parser that keeps each object's read order, validation of every key with all problems listed by JSON path; writeDesign with known keys in M-EDIT-1/M-EDIT-2 order and unknown keys after them; newDesign, findMockup, mockupPack, mockupOptions; hand-written fixtures in typescript/tests/fixtures/design/, design.test.ts (TC-1 to TC-3), IT-52 | [Design documents and the design session](../narrative/architecture/design.md), [Testing](../narrative/testing.md) |
