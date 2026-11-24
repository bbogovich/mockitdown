---
id: A-REND-3
title: Style builder
status: active
version: 0.2.0
rev: 0
page: ARCH.2
slot: elements
order: 3
level: module
hash: 20233f45e185
---

P1: provides: `StyleBuilder.build(view)` → (inline style, data attributes, classes); `css_color`, the frame-unit length helper `u`, font styles and aliases (`mockitdown.render.style`)
U1: uses A-DIAG-1 — report invalid class names
K1: The style builder MUST emit only validated colours, frame-unit lengths and keyword values.
