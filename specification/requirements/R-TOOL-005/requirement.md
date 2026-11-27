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
