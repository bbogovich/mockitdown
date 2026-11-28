---
id: R-APP-003
title: Side-by-side appearances
status: active
version: 0.12.7
rev: 1
page: REND.2
slot: reqs
order: 3
source: [SRC-2]
realizes: [F-9]
constrained_by: [A-REND-2]
reverse_engineered: true
hash: 33b070570340
---

C1: When the appearance is `both`, the figure assembler MUST render the screen twice from the same evaluated views, in two cells labelled `Light` and `Dark`.
C2: The page stylesheet MUST lay the cells out side by side, each shrinking its frame to half the column (minus the gap).
V1: An `appearance="both"` phone mockup in a 700px column shows two phone frames of equal size.
