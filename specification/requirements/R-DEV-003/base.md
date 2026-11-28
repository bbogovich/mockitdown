---
id: R-DEV-003
title: Frame unit scaling
status: active
version: 0.2.0
rev: 0
page: REND.2
slot: reqs
order: 6
source: [SRC-2, SRC-3]
realizes: [F-10]
constrained_by: [A-STYLE-1]
decisions: [ADR-7]
reverse_engineered: true
hash: df1ee3879f9f
---

C1: The page stylesheet MUST define, on every frame with a device size, the frame unit `--u: min(1px, calc(100cqw / var(--mkd-w)))`, where `100cqw` is the width of the frame's cell, and MUST size the frame `var(--mkd-w) × var(--u)` wide and `var(--mkd-h) × var(--u)` tall.
C2: A frame MUST therefore never be larger than its logical size and MUST shrink proportionally, as one picture, to fit a narrower column.
C3: In `fit` mode the page stylesheet MUST set `--u: 1px`, size the frame to its content (`max-content`, capped at the column width) with automatic height.
C4: The figure and each cell MUST be CSS size containers (`container-type: inline-size`) so that `cqw` refers to the available column width.
V1: A desktop frame (1280 points) in a 640px column renders 640px wide and 400px tall with all text and spacing halved; in a 1600px column it renders 1280px wide.
<!-- file: prose.md -->
Scaling the whole frame with one unit keeps proportions exact: text, padding, radii and borders
shrink together, the way a screenshot would. The unit is capped at 1px so mockups are never
blown up beyond their real size.
