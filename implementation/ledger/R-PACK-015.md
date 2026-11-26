---
requirement: R-PACK-015
title: SwiftUI presentations and navigation
status: implemented
version: 0.8.7
date: 2026-11-25
issue: 12
---

# R-PACK-015 — SwiftUI presentations and navigation

<!-- written by `sio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.8.7 | 2026-11-25 | implemented | #12 | SwiftUI presentations and navigation: swiftui pack.css draws the iOS 26 alert (glass card, 34-point corners, capsule actions side by side or stacked), the phone action sheet with a separate cancel capsule and the alert style with iPadOS/macOS chrome, the glass popover with arrow, the sheet with its bar of glass capsule actions and grouped content, the lone tab capsule, TabView with the bar in flow at fit, page dots and a sidebarAdaptable sidebar, the split view with hairline columns, titles, 320/220-point sidebar, prominentDetail floating sidebar and a 640 x 360 minimum at fit; renderers (both variants) take Button children as alert/confirmation actions, draw the popover anchor and arrows, the split view's column titles and unlabelled columns, and the lone Tab bar | [Packs](../narrative/architecture/packs.md), [Rendering](../narrative/architecture/render.md), [Testing](../narrative/testing.md), [Conformance corpus](../narrative/conformance.md) |
