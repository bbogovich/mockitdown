---
requirement: R-TOOL-014
title: Sections and the canvas round trip
status: implemented
version: 0.12.12
date: 2026-11-28
issue: 44
---

# R-TOOL-014 — Sections and the canvas round trip

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.12 | 2026-11-28 | implemented | #44 | Sections drawn behind the frames with their label at the top left, moved with the frames wholly inside, resized by edges and corners and renamed on the canvas, newSection around the active frame; each one undo step (SectionStep, change kind sections). designer.toJSON() writes the view and the active mockup through session.saveView only when they differ from the opened document; open restores them. Rules in mockitdown/design (design/sections.ts). IT-72. | [Sections and the saved view](../narrative/architecture/sections.md), [The canvas](../narrative/architecture/canvas.md), [The designer element](../narrative/architecture/designer.md), [Design documents and the design session](../narrative/architecture/design.md), [Testing](../narrative/testing.md) |
