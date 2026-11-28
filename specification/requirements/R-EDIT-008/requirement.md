---
id: R-EDIT-008
title: "Commands: duplicate, clipboard, move and multi-select"
status: active
version: 0.14.0
rev: 6
page: WEB.3
slot: reqs
order: 8
hash: cb17bfd671c2
source: [SRC-12, SRC-21]
realizes: [F-19]
requires: [R-EDIT-007]
constrained_by: [A-WEB-4, A-WEB-5]
refs: [A-WEB-5, R-EDIT-007, R-PACK-016, R-TOOL-003, R-TOOL-005]
---

C1: `session.duplicate()` MUST insert a copy of each selected node directly after it and select the copies.
C2: In a copy, each `.id("x")` MUST become `.id("x-copy")`, or `.id("x-copy-<n>")` when `x-copy` is used in the mockup, `<n>` being the smallest integer from 2 that makes the identifier unique; the designer renames it afterwards.
C3: `session.copy()` MUST return, and the composite designer MUST write to the clipboard as `text/plain`, the source text of the selected nodes in source order, each from its leading comment lines to its end with a comment trailing its last line, re-indented to column 0 by its first line, joined by line feeds, and an empty text when nothing is selected.
C4: `session.cut()` MUST copy the selected nodes and remove them as one step, selecting as `session.delete()` does (R-TOOL-003.C11), and return the copied text with the removal.
C5: `session.paste(text)` MUST insert the views the text holds, in order, as the last children of the selected node when one node is selected, it is a container (R-TOOL-005.C3) and its role accepts each pasted element in the active mockup's pack (R-PACK-016), else directly after the last selected node when it is placed among its parent's statement children, else at the end of the mockup's top level, and select the pasted views.
C6: If the pasted text does not parse, then `paste` MUST be refused with the syntax diagnostics and record no step; text that holds no view, or anything but views (an import, a directive, a struct, a `let`), MUST be refused the same way.
C7: `session.moveUp()` and `session.moveDown()` MUST move each selected node one position among its parent's statement children, the selection and the nodes' ids kept; when the first selected node is at the first position (up) or the last at the last position (down) they MUST do nothing and record no step.
C8: In the outline and the editor, Shift-click MUST select the siblings from the selection's first node to the clicked node (in the editor the innermost element under the pointer), the first node staying first, Cmd/Ctrl-click MUST add or remove the clicked node, and a click on a node that is not a sibling of the selection MUST replace the selection.
C9: The composite designer MUST bind Cmd/Ctrl+D to duplicate, Cmd/Ctrl+X, C and V to cut, copy and paste, and Alt+Up and Alt+Down to move, while the focus is in the outline or the view, outside a text field and outside Preview mode.
C10: Each command of this requirement MUST be one undo step (R-EDIT-007).
C11: In pasted views, each `.id("x")` that the mockup already uses MUST become `.id("x-copy")` or `.id("x-copy-<n>")` as in C2, and an identifier the mockup does not use MUST be kept.
C12: `session.duplicate()`, `session.moveUp()` and `session.moveDown()` MUST be refused, changing nothing, when nothing is selected or a selected node is not placed among its parent's statement children (an argument, a modifier's content, a struct body).
C13: The session MUST offer the selection of C8 as `session.selectRange(node)` and `session.toggleSelected(node)`, which the outline and the editor call, so that they hold no selection rule of their own (A-WEB-5.K2).
C14: When the clipboard cannot be read or is empty, Cmd/Ctrl+V in the composite designer MUST paste the text it copied or cut last.
V1: Every command, applied to a single and to a multiple selection, can be undone and redone with the selection restored, and copied text pasted into a mockitdown fence renders the copied elements.
