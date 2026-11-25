---
requirement: R-WEB-004
title: Pack gallery test page
status: partial
version: 0.8.0
date: 2026-11-25
issue: 8
---

# R-WEB-004 — Pack gallery test page

<!-- written by `sio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.8.0 | 2026-11-25 | partial | #8 | C13 and C15: element samples and variants at natural fit size, scrolling inside the card; TC-4 geometry assertions over every pack in gallery.spec.mjs (geometry.mjs). C14 and C16-C20 not yet implemented | [The pack gallery](../narrative/architecture/gallery.md), [Testing](../narrative/testing.md) |
| 0.6.7 | 2026-11-25 | implemented | #7 | typescript/pages/packs.html + packs.js + packs.css: master-detail pack gallery over shared/reference (groups of index.json, own then core elements with name, role, arguments, defaults, variants, doc, sample and variants sample), design patterns of shared/patterns/ (sign-in, list-detail, settings, dashboard, data-table, wizard; core vocabulary, import-free), #pack= deep links with history, light/dark, name filter, menu under 720 px, lazy mockups by IntersectionObserver, window.packGallery select/renderAll; IT-15 in both variants | [The pack gallery](../narrative/architecture/gallery.md), [Web development server, test pages and browser tests](../narrative/architecture/web-dev.md), [Testing](../narrative/testing.md), [Repository layout and shared assets](../narrative/repository.md) |
