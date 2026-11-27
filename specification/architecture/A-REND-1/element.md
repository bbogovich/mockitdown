---
id: A-REND-1
title: HTML renderer
status: active
version: 0.10.5
rev: 2
page: ARCH.2
slot: elements
order: 1
level: module
hash: f7f71e0dbddf
refs: [A-ASSET-1, A-ASSET-2, A-DIAG-1, A-REND-3]
---

P1: provides: `Renderer` (`mockitdown.render.html`) with one `r_<role>` method per render role, inherited from one mixin per role family in `mockitdown.render.roles` (layout, content, controls, navigation, containers, components, annotations), presentation layers, and the escaping and inline-Markdown helpers (`mockitdown.render._util`, re-exported by `mockitdown.render.html`)
U1: uses A-REND-3 — inline styles, data attributes and classes from modifiers
U2: uses A-ASSET-1 — image sources
U3: uses A-ASSET-2 — icon SVG
U4: uses A-DIAG-1 — report role, icon and asset problems
K1: The set of `r_<role>` methods MUST equal the role catalogue.
K2: The HTML renderer MUST NOT branch on the pack identifier; packs differ only in data and CSS.
