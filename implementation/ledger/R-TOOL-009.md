---
requirement: R-TOOL-009
title: Two-way editing and Code mode
status: implemented
version: 0.13.18
date: 2026-11-28
issue: 39
---

# R-TOOL-009 — Two-way editing and Code mode

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.18 | 2026-11-28 | implemented | #39 | CodeSync (design/code-sync.ts) joins the code view to the session: 300 ms or focusout, coalesced 'code'; broken code read-only through parses/validCode, drops refused; caret by pointer and navigation keys selects nodeAt; other edits applied by applyEdits, past pending text; selectionSpan marked; designer Code mode editable, Dock code toggle (docked, codeView), status bar error; IT-67 | [Two-way editing](../narrative/architecture/two-way-editing.md), [The designer element](../narrative/architecture/designer.md), [The editor element](../narrative/architecture/editor.md), [The outline element](../narrative/architecture/outline.md), [Testing](../narrative/testing.md) |
