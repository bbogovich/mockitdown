---
requirement: R-PACK-014
title: SwiftUI control styles
status: implemented
version: 0.8.13
date: 2026-11-25
issue: 15
---

# R-PACK-014 — SwiftUI control styles

<!-- written by `sio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.8.13 | 2026-11-25 | implemented | #15 | C14: swiftui pack.css desktop/wide selected-row rule scoped under tbody so it outranks the zebra stripe (shared CSS, both variants); checked in IT-23 | [The pack gallery](../narrative/architecture/gallery.md), [Testing](../narrative/testing.md) |
| 0.8.9 | 2026-11-25 | implemented | #13 | Form defaults to .automatic: grouped on phone, tablet and fit, the columns rules on desktop and wide | [Packs](../narrative/architecture/packs.md) |
| 0.8.6 | 2026-11-25 | implemented | #11 | SwiftUI control styles: per-variant CSS in shared/packs/swiftui (ControlGroup, DatePicker, Form columns, Gauge, List, Picker, Toggle, glass Button), base structural CSS for wheel/gauge/menu parts; renderer markup in both variants for menu control groups, date picker capsules/wheel/field, gauge arcs, bounds and marker, picker wheel/palette/tags/first option, List selection, text field titles | [Packs](../narrative/architecture/packs.md), [Rendering](../narrative/architecture/render.md), [Testing](../narrative/testing.md), [Conformance corpus](../narrative/conformance.md) |
