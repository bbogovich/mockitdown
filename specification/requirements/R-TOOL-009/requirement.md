---
id: R-TOOL-009
title: Two-way editing and Code mode
status: active
version: pending
rev: 4
page: WEB.4
slot: reqs
order: 9
hash: 5defdbc8f7f8
source: [SRC-12]
realizes: [F-19]
requires: [R-TOOL-008, R-TOOL-003, R-EDIT-007]
constrained_by: [A-WEB-5]
refs: [F-19, R-EDIT-001]
---

C1: A code view joined to the session MUST apply its text to the active mockup 300 ms after the last keystroke, as one change whose edits replace the range between the longest common prefix and suffix of the old and new text.
C2: When the new code parses, the session MUST take the tree from `reparse` (R-EDIT-001.C9), and the outline and the editor MUST update with the selection kept by node id.
C3: When the new code does not parse, the code view and the status bar MUST show its diagnostics, and the outline and the editor MUST keep the last valid tree, marked read-only and refusing edits, until the code parses again.
C4: While the code parses, moving the caret MUST select the innermost view node whose span holds the caret (R-EDIT-001.C8).
C5: A change made in another component MUST be applied to the code view by its text edits, keeping the caret and the scroll position outside the edited ranges.
C6: Selecting a node in another component MUST highlight the node's span in the code view without moving the focus.
C7: In Code mode the designer MUST show the active mockup's code view in the centre, keep the outline and the inspector live, and make the gallery insert into the node the caret selects (C4).
C8: In Design mode the designer MUST offer a toggle that docks the code view below the view, both kept in sync.
V1: Typing an unbalanced brace shows a diagnostic in the gutter and the status bar while the outline keeps the last valid tree; fixing it updates the view with the selection kept (F-19.AC5).
