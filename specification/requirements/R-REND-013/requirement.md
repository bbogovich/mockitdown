---
id: R-REND-013
title: Rows without overlap
status: active
version: 0.8.1
rev: 1
page: REND.1
slot: reqs
order: 999
source: [SRC-9]
realizes: [F-8]
constrained_by: [A-REND-1]
hash: 6413f808c068
---

C1: In an `HStack`, toolbar, control group or form row, a child that is not text MUST NOT be laid out narrower than its min-content width.
C2: Text that lacks room in a row MUST wrap within its own box, or truncate with an ellipsis when it has `.lineLimit(1)`; it MUST NOT paint over a sibling.
C3: A labelled control (toggle, picker, stepper, slider, date picker, gauge with label) MUST keep its label and its control in separate, non-overlapping boxes at any width the frame allows.
C4: A message bubble MUST wrap its text inside the bubble, the bubble no wider than 75% of its container and no wider than its text needs.
V1: In every shipped pack, the browser test finds no two intersecting boxes among a row's children for each element sample and variant (at the natural `fit` width and inside a 320-point phone frame), and `MessageBubble` with a 40-word text keeps every line inside the bubble.
C5: A pack MAY overlap adjacent children of a row on purpose with a negative leading margin (the joined segments of a control group, stacked avatars); such an overlap is not one that C1–C3 forbid.
