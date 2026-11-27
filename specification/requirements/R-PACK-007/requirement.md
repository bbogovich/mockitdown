---
id: R-PACK-007
title: Pack stylesheet rules
status: active
version: 0.10.8
rev: 1
page: PACK.1
slot: reqs
order: 7
source: [SRC-2]
realizes: [F-3, F-8]
constrained_by: [A-STYLE-1]
decisions: [ADR-5, ADR-6, ADR-7]
reverse_engineered: true
hash: 3236d943ac6d
refs: [R-DEV-005, R-REND-002, R-REND-003]
---

C1: Every selector in a non-base pack's `pack.css` MUST start with `.mkd-pack-<id>` (the pack's figure class), so a pack's rules never apply outside its own figures.
C2: A pack's `pack.css` other than `base` MUST NOT contain `data-appearance` or `prefers-color-scheme`; appearance MUST be expressed through tokens only.
C3: Pack CSS MUST select markup only through the markup contract: role classes `mkd-<role>`, part classes `mkd-<role>__<part>`, and the `data-*` attributes the renderer emits (R-REND-002, R-REND-003).
C4: Pack CSS MUST write lengths in `px`; it MUST NOT depend on the frame unit being 1px (R-DEV-005).
C5: Pack CSS MUST NOT import fonts, images or other resources from the network, and MUST NOT require JavaScript.
C6: The `base` pack's CSS MUST define the structure of every render role (layout, parts, states) so that a pack without CSS still renders a usable wireframe.
V1: The contract test parses every pack's CSS and fails on an unscoped selector or on appearance branching.
