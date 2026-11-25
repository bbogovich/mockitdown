---
requirement: R-DEV-008
title: "Fit frames: natural width and presentations"
status: implemented
version: 0.8.1
date: 2026-11-25
issue: 8
---

# R-DEV-008 — Fit frames: natural width and presentations

<!-- written by `sio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.8.1 | 2026-11-25 | implemented | #8 | page.css: fit frame max-content without max-width, cell scrolls with safe centring; base pack.css: at fit a screen with a layer is a one-column grid, layers span all rows (static, scrim sized by the screen), dialogs >= 240x80, sheet 48px band, >= 320x240, bleeding over --mkd-fit-padding, grabber ::before; tooltip anchor + placeholder + arrow (r_tooltip, both variants) laid out in a grid at fit; toast without min-width; open menus/pickers in flow at fit; pack fixes (bootstrap floating field, mui/vuetify temporary drawer, rails and palettes clip, sketch vertical arrows, own tooltip arrows hide the base one); IT-16 | [Rendering](../narrative/architecture/render.md), [The pack gallery](../narrative/architecture/gallery.md), [Testing](../narrative/testing.md), [Pack authoring guide](../narrative/pack-authoring.md) |
