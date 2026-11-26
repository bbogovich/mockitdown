---
requirement: R-DEV-010
title: Multi-platform chrome for SwiftUI
status: implemented
version: 0.8.9
date: 2026-11-25
issue: 13
---

# R-DEV-010 — Multi-platform chrome for SwiftUI

<!-- written by `sio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.8.9 | 2026-11-25 | implemented | #13 | Platform chrome for SwiftUI: iOS status bar and home indicator, iPadOS status bar and home indicator, macOS window (16-point radius token, shadow, 12-point lights) with the title bar unified with a root navigation stack, split view or sidebar-adaptable tab view, or drawing a plain root's title and toolbar; floating sidebars (macOS inset panel under the lights with the toggle and the sidebar title in the toolbar row; iPadOS glass panel with a glass toggle); windowed iPad app over a wallpaper (option, fence, @Screen, CLI, element attribute; warning on other chrome); split view collapsed on a phone, sidebar-adaptable tab sidebars floating, Form automatic as columns on a Mac; icon-only toolbar buttons in one glass capsule; split column toolbars (both variants) | [Rendering](../narrative/architecture/render.md), [Packs](../narrative/architecture/packs.md), [TypeScript core](../narrative/architecture/typescript.md), [Testing](../narrative/testing.md), [Conformance corpus](../narrative/conformance.md) |
