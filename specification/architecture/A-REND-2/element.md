---
id: A-REND-2
title: Figure assembly and chrome
status: active
version: 0.2.0
rev: 0
page: ARCH.2
slot: elements
order: 2
level: module
hash: a0205ca79711
---

P1: provides: `render_screen(screen, renderer, options, diagnostics)` → figure HTML, the Elements table, and device chrome markup (`mockitdown.render`, `mockitdown.render.chrome`)
U1: uses A-REND-1 — render the screen's views and layers
U2: uses A-OPT-1 — device sizes and options
K1: Figure assembly MUST resolve device, appearance, chrome, title and id exactly once per mockup.
