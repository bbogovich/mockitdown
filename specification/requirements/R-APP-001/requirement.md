---
id: R-APP-001
title: Appearance selection
status: active
version: 0.10.8
rev: 1
page: REND.2
slot: reqs
order: 1
source: [SRC-2]
realizes: [F-9]
constrained_by: [A-REND-2]
decisions: [ADR-6]
reverse_engineered: true
hash: 1d17d5bf1baa
---

C1: The appearance MUST be one of `light`, `dark`, `auto` and `both`.
C2: The figure assembler MUST take the appearance from the `appearance` fence attribute or render option, else from `@Screen(appearance:)`, else from the configured default (`default_appearance`, default `light`).
C3: If the resolved appearance is not one of the four, then the figure assembler MUST warn "unknown appearance 'x'; using light" with code `appearance` and render `light`.
C4: When the appearance is `light`, `dark` or `auto`, the figure assembler MUST render one frame with that `data-appearance`; when it is `both`, two frames, `light` then `dark`.
V1: `@Screen(appearance: .dark)` renders dark unless the fence says `appearance="light"`; `@Screen(appearance: "dim")` warns and renders light.
