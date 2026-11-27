---
id: TC-2
title: Layout, slots and modes
verifies: [C2, C3, C4, C8, C9, C10, C12]
---

Browser test: the panels measure 240 and 260 px; dragging an edge resizes and `layout` reflects it;
a custom element in the `inspector` slot replaces the inspector and receives the session; `mode =
"preview"` hides the panels and renders `mockitdown-mockup` elements whose shadow HTML equals the
mockup element's rendering of the same code; the toolbar shows the active mockup's pack and device;
activating a breadcrumb crumb selects its node; an unknown mode reads as `design`.
