---
id: R-EDIT-007.CR-6
target: R-EDIT-007
kind: correction
version: 0.13.21
date: 2026-11-28
issue: 42
summary: "as built (#42): steps hold the mockup object, its name and, for kind mockups, the list of mockups (C1); a rename's step notifies rename on undo and redo (C7)"
from: 80794219d5f4
to: 3560edfb539c
---

## Clauses

@ C1 edit
~ The session MUST keep one undo history per design document, each step holding the [-mockup,-]{+mockup (as the object, so that a later rename leaves the step on it),+} its{+ name,+} code, last valid tree, options and position before and after the change,{+ for a change of kind `mockups` the document's list of mockups before and after it,+} the change's text edits and their inverse, and the active mockup and the selection before and after it.
@ C7 edit
~ Undo and redo MUST each notify one `change` (R-EDIT-006.C5) of the step's change kind holding the edits they made, the step's inverse for undo and its edits for redo, empty for kinds other than [-`code`.-]{+`code`; a rename's step notifies `rename` instead (R-TOOL-012.C10).+}

## Files

(none)
