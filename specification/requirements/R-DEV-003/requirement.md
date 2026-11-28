---
id: R-DEV-003
title: Frame unit scaling
status: active
version: 0.12.9
rev: 1
page: REND.2
slot: reqs
order: 6
source: [SRC-2, SRC-3]
realizes: [F-10]
constrained_by: [A-STYLE-1]
decisions: [ADR-7]
reverse_engineered: true
hash: 17d1138e28dd
refs: [R-DEV-008]
---

C1: The page stylesheet MUST define, on every frame with a device size, the frame unit `--u: min(1px, calc(100cqw / var(--mkd-w)))`, where `100cqw` is the width of the frame's cell, and MUST size the frame `var(--mkd-w) × var(--u)` wide and `var(--mkd-h) × var(--u)` tall.
C2: A frame MUST therefore never be larger than its logical size and MUST shrink proportionally, as one picture, to fit a narrower column.
C3: In `fit` mode the page stylesheet MUST set `--u: 1px` and size the frame to its content (`max-content`) with automatic height; a narrower column scrolls the cell (R-DEV-008.C1).
C4: The figure and each cell MUST be CSS size containers (`container-type: inline-size`) so that `cqw` refers to the available column width, except a cell holding a `fit` frame, which sizes to its frame.
V1: A desktop frame (1280 points) in a 640px column renders 640px wide and 400px tall with all text and spacing halved; in a 1600px column it renders 1280px wide.
