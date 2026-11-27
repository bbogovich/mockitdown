---
id: R-EDIT-007
title: Undo and redo history
status: active
version: 0.10.0
rev: 0
page: WEB.3
slot: reqs
order: 7
hash: 4fc9f86c16d4
source: [SRC-12]
realizes: [F-19]
requires: [R-EDIT-006]
constrained_by: [A-WEB-4]
---

C1: The session MUST keep one undo history per design document, each step holding the mockup, the change, the change's inverse and the selection before and after it.
C2: Every operation, command or code change applied through the session MUST be recorded as exactly one step.
C3: `session.undo()` MUST revert the latest step and restore the selection from before it; `session.redo()` MUST reapply the step undone last and restore the selection from after it.
C4: A change made with the same coalescing key as the latest step, within 1000 ms of that step's last change, MUST be merged into that step instead of forming a new one.
C5: The inspector MUST use the node and field as the coalescing key, and the code view the key `code`, so that one burst of typing forms one step.
C6: A new step after an undo MUST discard the steps that could have been redone.
C7: Undo and redo MUST each notify one `change` (R-EDIT-006.C5) holding the edits they made.
C8: `session.canUndo` and `session.canRedo` MUST say whether a step can be undone or redone.
C9: The history MUST keep at least the latest 200 steps.
C10: The composite designer MUST bind Cmd/Ctrl+Z to undo and Shift+Cmd/Ctrl+Z and Ctrl+Y to redo while the focus is not in a text field, and its toolbar MUST have Undo and Redo buttons enabled by C8.
V1: After any sequence of operations and commands, undoing every step restores the document and the selection that the session started with, and redoing every step restores the final ones.
<!-- file: TC-1.md -->
---
id: TC-1
title: Undo restores document and selection
verifies: [C1, C2, C3, C6, C7, C8, C9]
---

`node:test`: a random sequence of 50 operations on a session; undoing all restores the original
document and selection, redoing all the final ones, each undo and redo notifying one `change`; a new
operation after two undos makes `canRedo` false; 250 steps keep at least the latest 200.
<!-- file: TC-2.md -->
---
id: TC-2
title: Coalescing
verifies: [C4, C5, C10]
---

`node:test` with a fake clock: ten changes with one key 100 ms apart form one step, a change 1500 ms
later a new one, a change with another key a new one. Browser test on `pages/designer.html`: typing a
word in an inspector field and pressing Cmd/Ctrl+Z restores the field's old value in one step; the
toolbar's Undo button is disabled on a fresh document.
<!-- file: prose.md -->
History lives in the session, per design document (SRC-12#s8), so it covers every component and,
once the canvas exists, moves and renames of mockups as well (R-TOOL-012.C7). A step is a change and its
inverse, plus the selection on either side, so that undo puts the designer back exactly where they were.

Typing coalesces: each keystroke in an inspector field or in the code view is applied, but the steps
merge while the same field keeps changing, so one undo removes the whole word or value.
