---
title: "Design-tool components"
spec_version: 0.10.0
status: draft
updated: 2026-11-26
page_id: WEB.4
---

# Design-tool components

The custom elements a web application composes into a mockup editor (F-19; SRC-12#s12): the composite
`mockitdown-designer`, the editable view `mockitdown-editor`, the outline, the gallery, the inspector,
the code view and the diagnostics list. They are standard custom elements with open shadow roots and
no framework, styled through CSS custom properties and `::part`, and they share one design session
(R-EDIT-006). The canvas of named mockups is on [Canvas of named mockups](canvas.md).

The layout follows the designer's main window (SRC-13): toolbar (SRC-13#p1.c1), outline (c2), gallery
(c3), canvas (c4), properties (c5) and status bar (c6); inserting follows SRC-14. The test pages
`pages/editor.html` and `pages/designer.html` compose the components for demonstration and for the
browser tests (F-19.C10).

<!-- slot: reqs -->

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
