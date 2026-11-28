---
id: R-REND-007
title: Static, deterministic output
status: active
version: 0.12.10
rev: 3
page: REND.1
slot: reqs
order: 7
source: [SRC-2]
realizes: [F-8, F-11]
constrained_by: [A-REND-1, A-REND-2]
decisions: [ADR-5]
reverse_engineered: true
hash: 11095a6d95d9
---

C1: Rendered mockups MUST be static: controls MUST be non-interactive elements carrying ARIA roles (`button`, `switch`, `checkbox`, `radio`, `textbox`, `link`, …) and MUST NOT require JavaScript.
C2: Rendering the same source with the same options and files MUST produce byte-identical HTML.
C3: The renderer MUST derive any generated value (avatar hue, chart identifiers) from the source content or its order in the mockup, never from time, randomness or memory addresses.
C4: Decorative icons MUST be inline SVG with `aria-hidden="true"` and `focusable="false"`.
V1: Two renderings of every example page are identical; the output contains no `<script>`.
