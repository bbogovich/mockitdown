---
id: R-TOOL-005
title: Drag and drop onto the outline and the view
status: active
version: 0.13.9
rev: 5
page: WEB.4
slot: reqs
order: 5
hash: fadec81c97a2
source: [SRC-12, SRC-14]
realizes: [F-19]
requires: [R-TOOL-004, R-TOOL-001, R-TOOL-002]
constrained_by: [A-WEB-5]
refs: [A-WEB-5, F-19, R-EDIT-002, R-EDIT-007, R-PACK-016]
---

C1: A gallery card MUST be draggable onto the outline and onto the editor, and an outline row of a view that is not derived MUST be draggable within the outline, carrying every selected node when the row is one of several selected rows.
C2: Over an outline row, the outline MUST show a drop indicator before the row, after it or inside it, chosen by the pointer's position in the upper, lower or middle third of the row, and below the last row a drop indicator at the end of the mockup's top level.
C3: Over the editor, the editor MUST outline the innermost container under the pointer (`session.isContainer`, C10), else the mockup's top level, and show an insertion bar at the gap between its children nearest the pointer, across the axis along which its children are laid out: horizontal in a `VStack`, vertical in an `HStack`.
C4: A drop position whose parent cannot contain the dragged element (R-PACK-016.C6), that lies inside a dragged row's own subtree, or that the edit operation refuses MUST show the `not-allowed` cursor, the indicator in the refused colour and the reason next to the pointer, and a drop there MUST do nothing.
C5: Dropping a gallery card MUST insert `<Name>()` at the indicated position (R-EDIT-002.C4) and select it; dropping outline rows MUST move their nodes there (R-EDIT-002.C8), keeping their node ids and selecting them.
C6: Each drop MUST be one edit operation of the session, notifying one `change` (one undo step once the history of R-EDIT-007 exists), and Esc MUST cancel a drag, changing nothing.
V1: Dragging `Text` from the gallery into a `VStack` in the view inserts `Text(…)` at the position of the insertion bar (F-19.AC1).
C7: A drag MUST be a pointer drag that starts once the pointer has moved 4 CSS pixels from where it was pressed and shows, next to the pointer, the name of what is dragged; releasing the pointer where no component shows a position, or a cancelled pointer, MUST end the drag with nothing changed.
C8: The components MUST take the drop position, its check and the drop from the design session (A-WEB-5.K2): `session.dropPosition(node, zone)` gives the position before, inside (as last child) or after a node of the active mockup and is refused for a node that stands where no statement goes beside it; `session.checkDrop(source, position, pack)` gives `{ok: true}` or `{ok: false, reason}`; `session.drop(source, position, pack)` checks and then inserts or moves.
C9: The role rules of C4 MUST be those of the pack of the target component's last evaluation of the mockup, and a `ForEach` or an `if` MUST defer them to the element above it.
C10: `session.isContainer(node, pack)` MUST be true for an element call other than a `ForEach` that already has statement children or whose element holds children in the pack (R-PACK-016.C16), and `session.childrenOf(parent)` MUST give the statement children a position's index counts (null: the top level).
C11: Only the editor showing the session's active mockup MUST take drops, and only a drag of the component's own session MUST be shown or dropped.
C12: The outline MUST mark the row of the position with `data-drop` (`before`, `inside` or `after`, followed by ` refused` when refused), and the editor MUST draw the outlined container and the bar as the shadow parts `drop-target` and `drop-bar`, the bar carrying `data-orientation`; allowed positions MUST be coloured by `--mkd-drop-color` (default `#2f80ed`) and refused ones by `--mkd-drop-refused-color` (default `#d93025`).
