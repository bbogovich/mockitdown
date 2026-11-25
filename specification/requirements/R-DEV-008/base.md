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
<!-- file: TC-1.md -->
---
id: TC-1
title: Fit frames keep their width and hold presentations
verifies: [C1, C2, C3, C6]
---

Python and TypeScript: render `Alert`, `Dialog`, `Sheet`, `Popover`, `Toast`, `Tooltip` and `ConfirmationDialog` alone at `fit` in every shipped pack; browser test (Playwright) asserts the surface box is at least 200 × 80 (toast: at least its text width) and inside the frame. A `fit` mockup of eight captioned toggles in a 300 px wide host: frame width equals its scroll width, the cell's scrollWidth exceeds its clientWidth.
<!-- file: TC-2.md -->
---
id: TC-2
title: Sheet and tooltip at fit
verifies: [C4, C5]
---

Browser test: a lone `Sheet` at `fit` is ≥ 240 points tall with a grabber and ≥ 48 points of scrim above; a lone `Tooltip` shows anchor and bubble, the bubble's box not clipped by the frame and the arrow on the anchor's side.
<!-- file: prose.md -->
**Why.** A `fit` frame was squeezed to its host's width, so wide content (a row of variants) was
drawn over itself, and presentation layers — absolutely positioned over a screen that had no size of
its own — collapsed to a small square (SRC-9#images, SRC-9#scroll).

**What changes.** A `fit` frame is exactly as large as its content, presentations included; when the
page column is narrower, the reader scrolls sideways instead of seeing a squeezed picture.
