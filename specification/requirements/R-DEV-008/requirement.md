---
id: R-DEV-008
title: "Fit frames: natural width and presentations"
status: active
version: 0.7.0
rev: 0
page: REND.2
slot: reqs
order: 999
source: [SRC-9]
realizes: [F-8, F-10]
constrained_by: [A-REND-2]
requires: [R-DEV-001]
hash: ceb46ab4717b
---

C1: At device `fit`, the frame MUST take the max-content width and height of its content and MUST NOT be squeezed or scaled by a narrower host; the figure cell MUST then scroll horizontally (`overflow-x: auto`).
C2: At device `fit`, a presentation layer (`alert`, `action-sheet`, `dialog`, `sheet`, `popover`, `inspector`, `cover`, `toast`, `tooltip`) MUST contribute to the frame's size, so that the frame is at least the presented surface plus the layer's padding, and its scrim MUST cover the whole frame.
C3: An element whose role presents a surface (dialog, alert, sheet, popover, toast, tooltip), written on its own rather than as a presentation modifier, MUST render the same surface as its presented form, with title, content and actions.
C4: At device `fit`, a sheet MUST be drawn at least 240 points tall with its grabber, its content, and a band of dimmed backdrop at least 48 points tall above it.
C5: A tooltip MUST render its anchor (the element's content, or a placeholder button when it has none) with the tooltip bubble beside it, the bubble's arrow pointing at the anchor, neither clipped by the frame.
C6: A toast MUST be drawn at its text's natural width (up to the frame's width) and at least one line tall.
V1: In every shipped pack, `Alert("Title") { Text("Content"); Button("Action") }` at `fit` renders a dialog at least 200 × 80 points containing the title and the action; a `fit` HStack of eight `Toggle("Label")` in a 300-pixel host keeps its natural width and the host scrolls.
