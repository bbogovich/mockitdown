---
id: R-TOOL-008.CR-6
target: R-TOOL-008
kind: revision
version: 0.13.18
date: 2026-11-28
issue: 39
summary: "as built (#39): applyEdits keeps the caret, selection and lines in view and sends no input event (C14); mark(range) marks a span without the focus (C15); mockitdown-caret on pointer release and navigation keys (C16); TC-1: Code mode is editable"
from: 23c1115fd691
to: 450c60bb0b29
---

## Clauses

@ C14 insert after C13
+ The method `applyEdits(edits)` MUST apply text edits (offsets of the current text, ascending and not overlapping) without dispatching an `input` event, keeping the caret and the selection outside the edited ranges (moving them to an edit's start when inside it) and the lines in view where they were.
@ C15 insert after C14
+ The method `mark(range)` MUST mark the range `{start, end}` (part `span`, or none for null) behind the text without moving the focus or the caret, and MUST scroll a newly marked range into view while the text area does not have the focus.
@ C16 insert after C15
+ The code view MUST dispatch a bubbling, composed `mockitdown-caret` event, whose detail is the selection `{start, end}`, when the pointer is released over the text area or a navigation key (an arrow, Home, End, Page Up, Page Down) is released in it, and on no other change of the caret.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: Light editor
-verifies: [C1, C2, C3, C4, C5, C6, C7, C11, C12, C13]
+verifies: [C1, C2, C3, C4, C5, C6, C7, C11, C12, C13, C14, C15, C16]
 ---
@@ -16,2 +16,5 @@
 and scrolls; each typed character and each editing key fires one bubbling, composed `input` event and
-setting `value` none; the designer's Code mode shows the active mockup's code, coloured and read-only.
+setting `value` none; the designer's Code mode shows the active mockup's code, coloured and editable.
+`applyEdits`, `mark` and `mockitdown-caret` (C14-C16) are tested where the designer joins its code view to
+the session (R-TOOL-009.TC-2, `sync.spec.mjs`): another component's Delete keeps the caret, a selection's
+span is marked with the focus elsewhere, and a navigation key's caret selects a node.
--- a/prose.md
+++ b/prose.md
@@ -5,3 +5,3 @@
 beside a `mockitdown-mockup` (the test page `pages/code.html` does that), and the designer's Code mode
-shows the active mockup in a read-only one until two-way editing (R-TOOL-009).
+edits the active mockup in one, joined to the session by two-way editing (R-TOOL-009).
 
@@ -25 +25,6 @@
 **Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
+
+**As built (#39).** For two-way editing the view gained three small, rule-free capabilities that
+`CodeSync` uses: `applyEdits` to take another component's edits without losing the caret, `mark` to show
+the selection's span behind the text, and a `mockitdown-caret` event so that only deliberate caret moves
+(the pointer, the navigation keys) select a node. It still imports only the core lexer.
```
