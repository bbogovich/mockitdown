---
requirement: R-EDIT-007
title: Undo and redo history
status: implemented
version: 0.12.12
date: 2026-11-28
issue: 34
---

# R-EDIT-007 — Undo and redo history

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.12 | 2026-11-28 | implemented | #34 | Undo history in DesignSession (steps with snapshots and places, coalescing by {coalesce} key, 200-step cap, undo/redo with one change each, canUndo/canRedo) and the designer's Undo/Redo buttons and keys; C5 waits for the inspector and code view (#34) | [Undo and redo history](../narrative/architecture/undo.md), [Design documents and the design session](../narrative/architecture/design.md), [The designer element](../narrative/architecture/designer.md), [Testing](../narrative/testing.md) |
