---
requirement: R-TOOL-008
title: "The code view: mockitdown-code"
status: implemented
version: 0.13.17
date: 2026-11-28
issue: 38
---

# R-TOOL-008 — The code view: mockitdown-code

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.17 | 2026-11-28 | implemented | #38 | mockitdown-code (typescript/src/elements/code.ts): textarea over spans coloured by highlight() from the core lexer (Lexer.scan, tolerant), gutter line numbers and diagnostic marks with the caret line's messages, bracket matching, Enter/}/Tab/Shift+Tab/Esc keys through insertText with one input event, reveal, readonly, appearance; imports only the core lexer; IT-66 | [The code view element](../narrative/architecture/code-view.md), [Testing](../narrative/testing.md) |
