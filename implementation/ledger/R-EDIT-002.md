---
requirement: R-EDIT-002
title: "Edit API: insert, remove and move"
status: implemented
version: 0.13.9
date: 2026-11-28
issue: 30
---

# R-EDIT-002 — Edit API: insert, remove and move

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.9 | 2026-11-28 | implemented | #30 | move with a null parent moves to the top level (C32); statementChildren; corpus case move-top-level | [Editing core](../narrative/architecture/editing.md), [Drag and drop](../narrative/architecture/drag-drop.md) |
| 0.13.8 | 2026-11-28 | implemented | #29 | insert with parent null adds a top-level statement (placeTop: before the view statement at the index, else after the last top-level statement's line, else at the end of the source; C4, C31); corpus cases insert-top-level, insert-top-level-empty (covers insert:top-level) | [Editing core](../narrative/architecture/editing.md) |
| 0.12.17 | 2026-11-27 | implemented | #21 | typescript/src/core/syntax/edit.ts: edit(source or tree, op) for insert, remove and move, returning ascending text edits, the edited source and its tree, or {error, diagnostics}; statement children of a call's unlabelled closure or an if's braced branches; child indentation and indentUnit; line, separator and blank-line removal rules; moved nodes keep their ids through reparseCarrying (tree.ts); shared/conformance/edit/ with 61 hand-checked cases and covers tags; IT-48 | [Editing core](../narrative/architecture/editing.md), [Testing](../narrative/testing.md) |
