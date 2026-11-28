---
id: R-EDIT-007
title: Undo and redo history
status: active
version: pending
rev: 4
page: WEB.3
slot: reqs
order: 7
hash: d81191156f0e
source: [SRC-12]
realizes: [F-19]
requires: [R-EDIT-006]
constrained_by: [A-WEB-4]
refs: [R-EDIT-006]
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
