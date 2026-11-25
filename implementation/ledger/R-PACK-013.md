---
requirement: R-PACK-013
title: Element samples
status: implemented
version: 0.8.4
date: 2026-11-25
issue: 10
---

# R-PACK-013 — Element samples

<!-- written by `sio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.8.4 | 2026-11-25 | implemented | #10 | pack.json element key sample (ElementDef.sample, Python registry; the TypeScript registry ignores it); gen_reference.py uses a declared sample verbatim, builds the variants sample by appending .variant, raises SampleError naming pack and element on a diagnostic or a variants sample that is not a call of the element; base declares samples for every chart kind, Alert/Dialog/Sheet/Toast, Picker, Tab, NavigationSplitView, Tooltip, MessageBubble, DatePicker; swiftui for the 15 elements of R-PACK-014/015; generic samples give pickers/radio groups/segmented controls options and a selection, date pickers a date, table rows cells, tab-role elements a TabView; variants side by side 24 points apart; reference JSON and conformance regenerated; IT-18 | [Pack authoring guide](../narrative/pack-authoring.md), [Repository layout and shared assets](../narrative/repository.md), [The pack gallery](../narrative/architecture/gallery.md), [Testing](../narrative/testing.md) |
