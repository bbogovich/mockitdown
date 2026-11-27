---
id: R-TOOL-012
title: "Mockup frames: labels, moving, renaming and placement"
status: active
version: 0.10.3
rev: 1
page: WEB.5
slot: reqs
order: 2
hash: 7b29c16e5385
source: [SRC-12, SRC-15]
realizes: [F-20]
requires: [R-TOOL-011, R-EDIT-007]
constrained_by: [A-WEB-5, M-EDIT-2]
refs: [F-20, R-EDIT-006, R-EDIT-007, R-TOOL-002]
---

C1: Each frame MUST carry a label above it with the mockup's name, and dragging the label MUST move the frame, updating the mockup's `x` and `y` when the drag ends.
C2: While a frame moves, its position MUST snap to an 8-pixel grid and to the edges of other frames within 6 CSS pixels; Alt held MUST suspend snapping.
C3: A double-click on the label MUST open an inline field to rename the mockup.
C4: A mockup's name MUST be a non-empty string, case-sensitive and possibly holding spaces, unique within the document.
C5: Renaming to a name another mockup holds MUST be refused with the message "A mockup named “<name>” already exists" beside the label, the name unchanged.
C6: A rename MUST notify `rename` (R-EDIT-006.C5) and a move MUST notify `change` with the kind `move`.
C7: A move and a rename MUST each be one undo step (R-EDIT-007).
C8: A new mockup MUST be named `Mockup <n>`, `<n>` being the smallest number from 1 that no mockup's name uses, and placed at the active mockup's `y`, 80 canvas units to the right of the rightmost frame that overlaps the active mockup vertically.
C9: The Mockups list (R-TOOL-002.C8) MUST mark each mockup whose name has the form `Mockup <n>` with a warning that SpecItOut tools import mockups by name.
V1: Renaming a mockup to a name another mockup holds is refused with a message, and the names stay as they were (F-20.AC2).
