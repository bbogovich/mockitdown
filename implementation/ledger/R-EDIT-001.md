---
requirement: R-EDIT-001
title: Source spans and node identities
status: implemented
version: 0.12.12
date: 2026-11-27
issue: 20
---

# R-EDIT-001 — Source spans and node identities

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.12 | 2026-11-27 | implemented | #20 | typescript/src/core/syntax/tree.ts: parseTree, reparse, applyEdits, SyntaxTree (nodes, roots, comments, byId, byOrdinal, atOffset), ViewNode (id, ordinal n<k>, kind, name, span with leading comment lines, nameSpan, parent, children, modifiers); lexer tokens carry UTF-16 start/end and record comments; parser nodes carry start/end; ids kept across reparse unless an edit touches the name; IT-47 (TC-1 over the corpus, TC-2) | [Editing core](../narrative/architecture/editing.md), [Testing](../narrative/testing.md) |
