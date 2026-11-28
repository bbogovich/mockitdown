---
id: R-EDIT-007
title: Undo and redo history
status: active
version: 0.13.21
rev: 6
page: WEB.3
slot: reqs
order: 7
hash: 3560edfb539c
source: [SRC-12]
realizes: [F-19]
requires: [R-EDIT-006]
constrained_by: [A-WEB-4]
refs: [R-EDIT-006, R-TOOL-012]
---

C1: The session MUST keep one undo history per design document, each step holding the mockup (as the object, so that a later rename leaves the step on it), its name, code, last valid tree, options and position before and after the change, for a change of kind `mockups` the document's list of mockups before and after it, the change's text edits and their inverse, and the active mockup and the selection before and after it.
C2: Every operation, command or code change applied through the session MUST be recorded as exactly one step.
C3: `session.undo()` MUST revert the latest step and restore the active mockup and the selection from before it, the restored nodes keeping their ids; `session.redo()` MUST reapply the step undone last and restore the active mockup and the selection from after it; each MUST be refused, changing and notifying nothing, when there is no such step.
C4: A change made with the same coalescing key as the latest step, to the same mockup and of the same change kind, within 1000 ms of that step's last change and with no undo or redo since, MUST be merged into that step instead of forming a new one.
C5: The inspector MUST use the node and field as the coalescing key, and the code view the key `code`, so that one burst of typing forms one step.
C6: A new step after an undo MUST discard the steps that could have been redone.
C7: Undo and redo MUST each notify one `change` (R-EDIT-006.C5) of the step's change kind holding the edits they made, the step's inverse for undo and its edits for redo, empty for kinds other than `code`; a rename's step notifies `rename` instead (R-TOOL-012.C10).
C8: `session.canUndo` and `session.canRedo` MUST say whether a step can be undone or redone.
C9: The history MUST keep the latest 200 steps, or more when the session's `historyLimit` option says so, dropping the oldest.
C10: The composite designer MUST bind Cmd/Ctrl+Z to undo and Shift+Cmd/Ctrl+Z and Ctrl+Y to redo while the focus is in it, outside a text field and outside Preview mode, and its toolbar MUST have Undo and Redo buttons (parts `undo` and `redo`) enabled by C8 and disabled in Preview mode.
C11: `apply`, `setCode`, `setText`, `setOptions` and `moveMockup` MUST take an optional last argument `{coalesce}` naming the change's coalescing key, a change without one forming a step of its own.
C12: A merged step whose state after it equals its state before it MUST be dropped from the history.
C13: The coalescing clock MUST be the session's `now` option, by default `Date.now`.
V1: After any sequence of operations and commands, undoing every step restores the document and the selection that the session started with, and redoing every step restores the final ones.
