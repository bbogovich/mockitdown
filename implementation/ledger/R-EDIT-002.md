---
requirement: R-EDIT-002
title: "Edit API: insert, remove and move"
status: implemented
version: 0.12.17
date: 2026-11-27
issue: 21
---

# R-EDIT-002 — Edit API: insert, remove and move

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.17 | 2026-11-27 | implemented | #21 | typescript/src/core/syntax/edit.ts: edit(source or tree, op) for insert, remove and move, returning ascending text edits, the edited source and its tree, or {error, diagnostics}; statement children of a call's unlabelled closure or an if's braced branches; child indentation and indentUnit; line, separator and blank-line removal rules; moved nodes keep their ids through reparseCarrying (tree.ts); shared/conformance/edit/ with 61 hand-checked cases and covers tags; IT-48 | [Editing core](../narrative/architecture/editing.md), [Testing](../narrative/testing.md) |
