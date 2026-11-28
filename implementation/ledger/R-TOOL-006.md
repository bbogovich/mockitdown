---
requirement: R-TOOL-006
title: "New elements: sample arguments and first-text editing"
status: implemented
version: 0.13.10
date: 2026-11-28
issue: 31
---

# R-TOOL-006 — New elements: sample arguments and first-text editing

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.10 | 2026-11-28 | implemented | #31 | sampleCall (core/syntax/sample.ts) gives the sample's top-level call without trailing closures, else <Name>(); the gallery's Add and drag use it; DesignSession.firstText/setText; the editor opens an inline field (part text-field) over a new element whose first positional argument is a string, Enter/blur commit through setText as a change of its own, Esc keeps the text; IT-59 | [New elements](../narrative/architecture/new-elements.md), [The editor element](../narrative/architecture/editor.md), [Design documents and the design session](../narrative/architecture/design.md), [Testing](../narrative/testing.md) |
