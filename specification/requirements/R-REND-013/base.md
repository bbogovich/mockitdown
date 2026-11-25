---
id: R-REND-013
title: Rows without overlap
status: active
version: 0.7.0
rev: 0
page: REND.1
slot: reqs
order: 999
source: [SRC-9]
realizes: [F-8]
constrained_by: [A-REND-1]
hash: 2da046f433b1
---

C1: In an `HStack`, toolbar, control group or form row, a child that is not text MUST NOT be laid out narrower than its min-content width.
C2: Text that lacks room in a row MUST wrap within its own box, or truncate with an ellipsis when it has `.lineLimit(1)`; it MUST NOT paint over a sibling.
C3: A labelled control (toggle, picker, stepper, slider, date picker, gauge with label) MUST keep its label and its control in separate, non-overlapping boxes at any width the frame allows.
C4: A message bubble MUST wrap its text inside the bubble, the bubble no wider than 75% of its container and no wider than its text needs.
V1: In every shipped pack, the browser test finds no two intersecting boxes among a row's children for each element sample and variant (at the natural `fit` width and inside a 320-point phone frame), and `MessageBubble` with a 40-word text keeps every line inside the bubble.
<!-- file: TC-1.md -->
---
id: TC-1
title: No overlapping siblings
verifies: [C1, C2, C3]
---

Browser test over every pack's element samples and variants (gallery `renderAll`): for each row container, child bounding boxes pairwise do not intersect (1-pixel tolerance); repeated inside a `device=phone` frame.
<!-- file: TC-2.md -->
---
id: TC-2
title: Message bubble wraps
verifies: [C4]
---

Render `MessageBubble` with a long text in every pack: the text's box is inside the bubble's box and the bubble is at most 75% of the container's width.
<!-- file: prose.md -->
A real screen never paints siblings over each other (SRC-9): when a row runs out of room SwiftUI
wraps or truncates its text, and the controls keep their size.
