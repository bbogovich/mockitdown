---
requirement: R-EDIT-008
title: "Commands: duplicate, clipboard, move and multi-select"
status: implemented
version: 0.13.15
date: 2026-11-28
issue: 36
---

# R-EDIT-008 — Commands: duplicate, clipboard, move and multi-select

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.15 | 2026-11-28 | implemented | #36 | DesignSession selection commands (duplicate with fresh .id suffixes, copy, cut, paste into an accepting container / after the selection / at the top level, moveUp, moveDown, selectRange, toggleSelected), each one undo step via applyOps; nodeCode and identifiersOf in edit.ts; Shift and Cmd/Ctrl-click in the outline and editor; the designer's Cmd/Ctrl+D/X/C/V and Alt+Up/Down with the clipboard as text/plain and a last-copy fallback | [Commands on the selection](../narrative/architecture/commands.md), [Design documents and the design session](../narrative/architecture/design.md), [The designer element](../narrative/architecture/designer.md), [The outline element](../narrative/architecture/outline.md), [The editor element](../narrative/architecture/editor.md), [Testing](../narrative/testing.md) |
