---
id: A-REND-1
title: HTML renderer
status: active
version: 0.2.0
rev: 0
page: ARCH.2
slot: elements
order: 1
level: module
hash: 5fbaf27af68b
---

P1: provides: `Renderer` with one `r_<role>` method per render role, presentation layers, and the escaping and inline-Markdown helpers (`mockitdown.render.html`)
U1: uses A-REND-3 — inline styles, data attributes and classes from modifiers
U2: uses A-ASSET-1 — image sources
U3: uses A-ASSET-2 — icon SVG
U4: uses A-DIAG-1 — report role, icon and asset problems
K1: The set of `r_<role>` methods MUST equal the role catalogue.
K2: The HTML renderer MUST NOT branch on the pack identifier; packs differ only in data and CSS.
<!-- file: prose.md -->
The markup contract in code. Realizes R-REND-002 to R-REND-009 and R-ASSET-004.
