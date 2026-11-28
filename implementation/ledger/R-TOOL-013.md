---
requirement: R-TOOL-013
title: The active mockup and inactive previews
status: implemented
version: 0.14.0
date: 2026-11-28
issue: 88
---

# R-TOOL-013 — The active mockup and inactive previews

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.14.0 | 2026-11-28 | implemented | #88 | duplicateMockupName names a copy <name>-copy, else <name>-copy-<n> with the smallest free n from 2, through copyName in design/frames.ts | [The active mockup and the mockup commands](../narrative/architecture/mockups.md), [Testing](../narrative/testing.md) |
| 0.12.12 | 2026-11-28 | implemented | #43 | session.duplicateMockup and deleteMockup (and newMockup) as session commands in session.commands and run, duplicateMockupName in mockitdown/design, the outline's Mockups rows activating by click, Enter or Space, the tools redrawing when no mockup is left; IT-71 | [The active mockup and the mockup commands](../narrative/architecture/mockups.md), [The outline element](../narrative/architecture/outline.md), [Mockup frames](../narrative/architecture/frames.md) |
