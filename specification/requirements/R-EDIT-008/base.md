---
id: R-EDIT-008
title: "Commands: duplicate, clipboard, move and multi-select"
status: active
version: 0.10.0
rev: 0
page: WEB.3
slot: reqs
order: 8
hash: b6b3314e5672
source: [SRC-12]
realizes: [F-19]
requires: [R-EDIT-007]
constrained_by: [A-WEB-4, A-WEB-5]
---

C1: `session.duplicate()` MUST insert a copy of each selected node directly after it and select the copies.
C2: In a copy, each `.id("x")` MUST become `.id("x-<n>")`, `<n>` being the smallest integer from 2 that makes the identifier unique in the mockup.
C3: `session.copy()` MUST return, and the composite designer MUST write to the clipboard as `text/plain`, the source text of the selected nodes in order, each re-indented to column 0 by its first line, joined by line feeds.
C4: `session.cut()` MUST copy the selected nodes and remove them as one step.
C5: `session.paste(text)` MUST insert the views the text holds as the last children of the selected node when one node is selected and its role accepts them (R-PACK-016), else directly after the last selected node, else at the end of the mockup's root.
C6: If the pasted text does not parse as views, then `paste` MUST be refused with the syntax diagnostic and record no step.
C7: `session.moveUp()` and `session.moveDown()` MUST move the selected nodes one position among their siblings; at the first or last position they MUST do nothing and record no step.
C8: In the outline and the editor, Shift-click MUST select the siblings from the selection's first node to the clicked node, Cmd/Ctrl-click MUST add or remove the clicked node, and a click on a node that is not a sibling of the selection MUST replace the selection.
C9: The composite designer MUST bind Cmd/Ctrl+D to duplicate, Cmd/Ctrl+X, C and V to cut, copy and paste, and Alt+Up and Alt+Down to move, while the focus is in the outline or the view.
C10: Each command of this requirement MUST be one undo step (R-EDIT-007).
V1: Every command, applied to a single and to a multiple selection, can be undone and redone with the selection restored, and copied text pasted into a mockitdown fence renders the copied elements.
<!-- file: TC-1.md -->
---
id: TC-1
title: Commands and undo
verifies: [C1, C2, C4, C5, C6, C7, C10]
---

`node:test`: duplicate of `Button("A").id("ok")` yields `.id("ok-2")`, a second duplicate `ok-3`;
cut and paste into a stack and after a leaf; paste of invalid text is refused without a step;
moveUp at the first position records no step; every command undoes and redoes with the selection
restored (the AC9 check of F-19).
<!-- file: TC-2.md -->
---
id: TC-2
title: Keyboard, clipboard and multi-select
verifies: [C3, C8, C9]
---

Browser test on `pages/designer.html` with a granted clipboard: Shift-click selects a range of rows,
Cmd/Ctrl-click toggles one, a click on a non-sibling replaces the selection; Cmd/Ctrl+C puts the
selected text on the clipboard; a Python test renders that text in a `mockitdown` fence without a
diagnostic (F-19.AC10); Alt+Down moves the selection.
<!-- file: prose.md -->
The everyday commands of a structured editor (SRC-12#s8). The clipboard holds plain mockitdown text, so
an element copied in the designer pastes into a Markdown fence, a code review or another document.

Multi-select is limited to siblings: every command here acts on a contiguous or scattered run of children
of one parent, which keeps their results predictable.
