---
id: R-TOOL-009
title: Two-way editing and Code mode
status: active
version: 0.13.18
rev: 5
page: WEB.4
slot: reqs
order: 9
hash: f47debb59a14
source: [SRC-12]
realizes: [F-19]
requires: [R-TOOL-008, R-TOOL-003, R-EDIT-007]
constrained_by: [A-WEB-5]
refs: [A-WEB-5, F-19, R-EDIT-001]
---

C1: A code view joined to the session MUST apply its text to the active mockup 300 ms after the last keystroke, or at once when the focus leaves the code view, as one change with the coalescing key `code` whose edits replace the range between the longest common prefix and suffix of the old and new text.
C2: When the new code parses, the session MUST take the tree from `reparse` (R-EDIT-001.C9), and the outline and the editor MUST update with the selection kept by node id.
C3: When the new code does not parse, the code view MUST show its diagnostics and the status bar its first error, and the outline and the editor MUST show the code of the last valid tree, marked read-only, while the session refuses every edit, command and drop, until the code parses again.
C4: While the code parses and no typed text waits to be applied, moving the caret with the pointer or a navigation key MUST select the innermost view node whose span holds the caret (R-EDIT-001.C8), and clear the selection when no node holds it; typing MUST NOT change the selection.
C5: A change made in another component MUST be applied to the code view by its text edits, keeping the caret and the scroll position outside the edited ranges; text typed and not yet applied MUST be kept, the edits moved past it, unless an edit overlaps it, when the code view MUST take the session's code.
C6: Selecting a node in another component MUST highlight the node's span in the code view without moving the focus.
C7: In Code mode the designer MUST show the active mockup's code view in the centre, keep the outline and the inspector live, and make the gallery insert into the node the caret selects (C4).
C8: In Design mode the designer MUST offer a toggle that docks the code view below the view, both kept in sync.
C9: The rules of C1 to C6 MUST be held by `CodeSync` of `mockitdown/design` (A-WEB-5.K2), which joins any object with the code view's `value`, `diagnostics`, `selection`, `applyEdits` and `mark` and its `input`, `focusout` and `mockitdown-caret` events to a session's active mockup, applying typed text to the previous mockup before showing a newly active one.
C10: The session MUST expose `parses(name)` (whether the mockup's code parses), `validCode(name)` (the code of its last valid tree), `nodeAt(name, offset)` (C4's node, null while the code does not parse) and `selectionSpan()` (the span from the first selected node's start to the last one's end, the range C6 marks).
C11: The toolbar's dock toggle MUST be the button of part `dock`, pressed while the designer's `docked` attribute (and property) is set, and shown in Design mode only; the designer's `codeView` property MUST return its code view.
V1: Typing an unbalanced brace shows a diagnostic in the gutter and the status bar while the outline keeps the last valid tree; fixing it updates the view with the selection kept (F-19.AC5).
