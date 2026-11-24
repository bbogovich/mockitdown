---
id: ADR-1
title: HTML and CSS is the only renderer; the SVG renderer is retired
status: active
version: 0.2.0
rev: 0
page: ADR.1
slot: decisions
order: 1
source: [SRC-3]
constrains: [R-REND-001, R-REND-007]
hash: 9f3fe9db6a6b
---

D1: mockitdown renders mockups only as HTML with CSS; the prototype's SVG renderer is not carried over.
D2: This supersedes the prototype's ADR-001 decision to keep SVG as a secondary output.
O1: rejected: keep SVG as a secondary renderer — SVG output is box-and-label geometry that cannot meet the "realistic, framework-matched" goal, and a second renderer per role multiplies maintenance across eight packs.
O2: rejected: canvas or raster output — not text, not accessible, not themeable by CSS tokens (already ruled out by the prototype).
C1: Every role, pack and appearance feature is implemented once, in markup and CSS.
C2: Static image export (PDF, print) relies on the browser printing the HTML; there is no image output.
