---
requirement: R-EDIT-007
title: Undo and redo history
status: implemented
version: 0.13.21
date: 2026-11-28
issue: 42
---

# R-EDIT-007 — Undo and redo history

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.21 | 2026-11-28 | implemented | #42 | steps hold the mockup object, its name and the list of mockups for kind mockups; rename steps notify rename on undo and redo | [Undo and redo history](../narrative/architecture/undo.md), [Mockup frames](../narrative/architecture/frames.md) |
| 0.13.13 | 2026-11-28 | implemented | #35 | C5 for the inspector: every inspector edit passes {coalesce: '<node>:<field>'}, Mockup tab options 'mockup:<name>:<option>'; the code view's key 'code' comes with R-TOOL-009 | [The inspector element](../narrative/architecture/inspector.md), [Undo and redo history](../narrative/architecture/undo.md) |
| 0.12.12 | 2026-11-28 | implemented | #34 | Undo history in DesignSession (steps with snapshots and places, coalescing by {coalesce} key, 200-step cap, undo/redo with one change each, canUndo/canRedo) and the designer's Undo/Redo buttons and keys; C5 waits for the inspector and code view (#34) | [Undo and redo history](../narrative/architecture/undo.md), [Design documents and the design session](../narrative/architecture/design.md), [The designer element](../narrative/architecture/designer.md), [Testing](../narrative/testing.md) |
