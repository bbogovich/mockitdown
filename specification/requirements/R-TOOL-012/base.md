---
id: R-TOOL-012
title: "Mockup frames: labels, moving, renaming and placement"
status: active
version: 0.10.0
rev: 0
page: WEB.5
slot: reqs
order: 2
hash: 167cb59963da
source: [SRC-12, SRC-15]
realizes: [F-20]
requires: [R-TOOL-011, R-EDIT-007]
constrained_by: [A-WEB-5, M-EDIT-2]
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
<!-- file: TC-1.md -->
---
id: TC-1
title: Rename refused
verifies: [C3, C4, C5, C6, C7]
---

Browser test on `pages/designer.html` with mockups `Sign in`, `Inbox`, `Message`: double-click
`Message`, type `Inbox`, Enter; the field shows the refusal message, the names are unchanged and no
`mockitdown-rename` fires (F-20.AC2); renaming to `inbox` succeeds (case-sensitive), fires one
`mockitdown-rename` and undoes.
<!-- file: TC-2.md -->
---
id: TC-2
title: Moving and placing
verifies: [C1, C2, C8, C9]
---

Browser test: dragging a label moves the frame by the drag snapped to 8 px, to a neighbour's edge
within 6 px, freely with Alt; the mockup's `x` and `y` follow; undo restores them; a new mockup is
`Mockup 1` placed 80 units right of the row's rightmost frame and is flagged in the Mockups list.
<!-- file: prose.md -->
Each mockup is a frame with its name above it (SRC-15#p1.c1). The name is the key SpecItOut tools
import a mockup by, so it is unique, kept exactly as written, and a default name earns a warning in the
Mockups list (SRC-12#s10).
