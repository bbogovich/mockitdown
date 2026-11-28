---
requirement: R-EDIT-003
title: "Edit API: arguments, modifiers and identifiers"
status: implemented
version: 0.12.18
date: 2026-11-27
issue: 22
---

# R-EDIT-003 — Edit API: arguments, modifiers and identifiers

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.18 | 2026-11-27 | implemented | #22 | typescript/src/core/syntax/edit.ts: setArgument (add, replace, remove a labelled or positional argument; parentheses added after a bare name and dropped before a trailing closure; one argument per line kept), setModifier (occurrence index, appended on the chain's line or a continuation line, line or inline removal), rename (.id string literal, duplicate refused), setRefs, setComment (leading comment lines), setName; values checked by a probe parse with the diagnostic's column in the given code; refusals for missing arguments, modifiers and comments, bad names, labels, positions and if nodes; 41 hand-written cases in shared/conformance/edit/ with covers tags; edit-set.test.ts; IT-49 | [Editing core](../narrative/architecture/editing.md), [Testing](../narrative/testing.md) |
