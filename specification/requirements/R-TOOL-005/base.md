---
id: R-TOOL-005
title: Drag and drop onto the outline and the view
status: active
version: 0.10.0
rev: 0
page: WEB.4
slot: reqs
order: 5
hash: 41c6d5397156
source: [SRC-12, SRC-14]
realizes: [F-19]
requires: [R-TOOL-004, R-TOOL-001, R-TOOL-002]
constrained_by: [A-WEB-5]
---

C1: A gallery card MUST be draggable onto the outline and onto the editor, and an outline row of a view that is not derived MUST be draggable within the outline.
C2: Over an outline row, the outline MUST show a drop indicator before the row, after it or inside it, chosen by the pointer's position in the upper, lower or middle third of the row.
C3: Over the editor, the editor MUST outline the innermost container under the pointer and show an insertion bar at the gap between its children nearest the pointer, along the container's axis.
C4: A drop position whose parent cannot contain the dragged element (R-PACK-016.C6), or that lies inside a dragged row's own subtree, MUST show the `not-allowed` cursor and the reason next to the pointer, and a drop there MUST do nothing.
C5: Dropping a gallery card MUST insert the element at the indicated position (R-EDIT-002.C4) and select it; dropping outline rows MUST move their nodes there (R-EDIT-002.C8).
C6: Each drop MUST be one change and one undo step, and Esc MUST cancel a drag.
V1: Dragging `Text` from the gallery into a `VStack` in the view inserts `Text(…)` at the position of the insertion bar (F-19.AC1).
<!-- file: TC-1.md -->
---
id: TC-1
title: Drop into the view
verifies: [C1, C3, C5, C6]
---

Browser test on `pages/designer.html`: drag the `Text` card onto the gap between a `VStack`'s first and
second children in the view; the bar is horizontal at that gap; after the drop the code holds the new
`Text(…)` as the stack's second child, selected (F-19.AC1); one undo removes it; Esc during a drag
inserts nothing.
<!-- file: TC-2.md -->
---
id: TC-2
title: Outline drops and refusals
verifies: [C2, C4, C5]
---

Browser test: dropping a card in the upper, middle and lower third of a row inserts before, inside and
after it; dragging a `NavigationSplitView` card over an `HStack` row shows `not-allowed` and the
reason; dragging a card row onto its own child is refused; dragging a row after its sibling moves it,
its node id kept.
<!-- file: prose.md -->
The second and third ways to insert (SRC-12#s6, SRC-14#p1.c1): drop onto the outline with a before,
after or inside indicator, or onto the view with an insertion bar along the container's axis — vertical
for a `VStack`, horizontal for an `HStack`. Dragging outline rows reorders and re-parents, refusing a drop
into the row's own descendants as the MockItOut outline did (SRC-12#s15).
