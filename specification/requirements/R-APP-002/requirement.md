---
id: R-APP-002
title: Token application by appearance
status: active
version: 0.2.0
rev: 0
page: REND.2
slot: reqs
order: 2
source: [SRC-2]
realizes: [F-9]
constrained_by: [A-STYLE-1]
decisions: [ADR-6]
reverse_engineered: true
hash: 7fac61ea5001
---

C1: The stylesheet assembler MUST declare a pack's light tokens, and `color-scheme: light`, on `.mkd-pack-<id> .mkd-frame`.
C2: The stylesheet assembler MUST declare the pack's dark tokens — its light tokens overridden by its dark tokens — and `color-scheme: dark` on `.mkd-pack-<id> .mkd-frame[data-appearance="dark"]`.
C3: The stylesheet assembler MUST declare the same dark tokens on `[data-md-color-scheme="slate"] .mkd-pack-<id> .mkd-frame[data-appearance="auto"]`, so an `auto` frame is dark on a Material or Zensical page whose palette is slate.
C4: The stylesheet assembler MUST declare the same dark tokens on `body:not([data-md-color-scheme]) .mkd-pack-<id> .mkd-frame[data-appearance="auto"]` inside `@media (prefers-color-scheme: dark)`, so an `auto` frame follows the browser on a page without a Material palette attribute.
C5: Appearance switching MUST need no JavaScript and no rebuild.
V1: On a Zensical page, toggling the palette to slate turns an `auto` frame's `--mkd-bg` to the pack's dark value; a `light` frame stays light.
