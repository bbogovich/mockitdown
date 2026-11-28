---
id: ADR-7
title: Frame-unit scaling with px rewriting
status: active
version: 0.12.11
rev: 1
page: ADR.1
slot: decisions
order: 7
source: [SRC-3]
constrains: [R-DEV-003, R-DEV-004, R-REND-004]
hash: 5505d3bb2331
---

D1: Device sizes are logical points; inside a frame one point is `--u = min(1px, 100cqw / width)`.
D2: Pack px lengths above 1px are rewritten to `calc(N * var(--u))` when the stylesheet is assembled; lengths of 1px or less are kept; inline lengths from modifiers use the same unit.
O1: rejected: CSS `transform: scale()` on the frame — blurry text at fractional scales, and layout still occupies the unscaled size.
O2: rejected: `zoom` — non-standard behaviour across browsers until recently and interacts badly with container queries.
O3: rejected: pack authors write `calc(… * var(--u))` themselves — error-prone and unreadable.
C1: A mockup scales as one picture and stays crisp; hairlines stay one pixel.
C2: Pack authors write plain px; anything not written in px (em, %) does not scale with the frame.
