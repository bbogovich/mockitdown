---
requirement: R-TOOL-004
title: "The gallery: mockitdown-gallery"
status: implemented
version: 0.13.10
date: 2026-11-28
issue: 31
---

# R-TOOL-004 — The gallery: mockitdown-gallery

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.10 | 2026-11-28 | implemented | #31 | C8: Add inserts insertCode(name, sample), the sample's call of R-TOOL-006.C1 | [The gallery element](../narrative/architecture/gallery-element.md), [New elements](../narrative/architecture/new-elements.md) |
| 0.13.8 | 2026-11-28 | implemented | #29 | typescript/src/elements/gallery.ts mockitdown-gallery: the active mockup's pack (edit-mode evaluation) from dist/shared/reference/<pack>.json (loadReference at loadAssetsFromUrl's default base), own elements first then inherited, Components (declared or imported structs, Evaluation.structs) then one group per role category; allowedChildren for the first selected node or the root, Hidden here (n) by reason; search mirrored by filter; lazy mockitdown-mockup device=fit previews within 200 px (IntersectionObserver on the list); Add, double-click, Enter insert <Name>() through session.insert and select it; Up/Down/Home/End; add(name), state, rendered; in the designer's gallery panel; gallery-component.spec.mjs (TC-1, TC-2), IT-57 | [The gallery element](../narrative/architecture/gallery-element.md), [The designer element](../narrative/architecture/designer.md), [Testing](../narrative/testing.md) |
