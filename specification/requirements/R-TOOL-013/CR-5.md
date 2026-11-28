---
id: R-TOOL-013.CR-5
target: R-TOOL-013
kind: revision
version: 0.13.22
date: 2026-11-28
issue: 43
summary: "as built (#43): Enter or Space on a Mockups row, through setActive (C1); no mockup shown after the last is deleted (C2); labels, no shortcut, order and enabled states in session.commands (C4); the copy holds code, options and other keys, placed beside the mockup it copies, made active (C5); deleteMockup's next active mockup and undo (C6); refusals and the run argument mockup (C7); duplicateMockupName in mockitdown/design (C8); TC-1 and TC-2 name their tests (IT-71)"
from: 9ed5a8a7a63a
to: bef6a74357c8
---

## Clauses

@ C1 edit
~ A click on a frame, or{+ a click, Enter or Space+} on a row of the Mockups list, MUST make its mockup the active [-one,-]{+one through `session.setActive`,+} clear the selection and notify `active` (R-EDIT-006.C5).
@ C2 edit
~ The outline, the gallery and the inspector MUST show the active mockup and follow every change of [-it.-]{+it, and MUST show no mockup once the last one is deleted.+}
@ C4 edit
~ The session MUST offer the commands `newMockup`, `duplicateMockup` and `deleteMockup`, listed in `session.commands` [-(R-EDIT-009.C8),-]{+(R-EDIT-009.C8) before `undo` with the labels "New Mockup", "Duplicate Mockup" and "Delete Mockup" and no shortcut, `newMockup` always enabled and the other two whenever there is an active mockup,+} each one undo step notifying `change` with the kind `mockups`.
@ C5 edit
~ [-`duplicateMockup`-]{+`duplicateMockup(name)`+} MUST{+ copy the named mockup, the active one by default, with its code, its options and every other key,+} name the copy `<name> copy`, or `<name> copy <n>` with the smallest free `<n>` from 2, [-and -]place it as a new mockup is placed [-(R-TOOL-012.C8).-]{+(R-TOOL-012.C8) beside the mockup it copies, and make the copy the active mockup.+}
@ C6 insert after C5
+ `deleteMockup(name)` MUST remove the named mockup, the active one by default; deleting the active mockup MUST make the next mockup in document order active, else the one before it, else none, the active mockup changing before `change` is notified; undoing it MUST put the mockup back at its place, active again if it was.
@ C7 insert after C6
+ `duplicateMockup` and `deleteMockup` MUST refuse, changing and notifying nothing, a name no mockup holds and, without a name, a session with no active mockup; `session.run` MUST pass them the argument `mockup`.
@ C8 insert after C7
+ The naming rule of C5 MUST be held by `mockitdown/design` as `duplicateMockupName`, which uses no DOM.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -6,5 +6,7 @@
 
-Browser test on `pages/designer.html`: clicking the `Inbox` frame makes it active; the outline shows
-its tree and the inspector its Mockup tab (F-20.AC4); the other frames hold `mockitdown-mockup`
-elements and only `Inbox` holds a `mockitdown-editor`; choosing `Sign in` in the Mockups list activates
-it.
+Browser test (`mockups.spec.mjs`, IT-71) on `pages/designer.html` with its sample (`Sign in`, `Inbox`
+active): clicking the `Sign in` frame makes it active, then clicking the `Inbox` frame makes it active
+again; each time the outline shows the active mockup's tree and the inspector its Mockup tab with its
+device (F-20.AC4), and only the active frame holds the `mockitdown-editor` (`data-active`), the other a
+`mockitdown-mockup`; choosing `Sign in` in the Mockups list activates it (`aria-current` on its row), and
+Enter on the `Inbox` row activates `Inbox`.
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,6 +3,13 @@
 title: Mockup commands
-verifies: [C4, C5]
+verifies: [C4, C5, C6, C7, C8]
 ---
 
-`node:test`: `newMockup`, `duplicateMockup` (`Inbox copy`, then `Inbox copy 2`) and `deleteMockup`
-each record one undo step with a `change` of kind `mockups` and undo to the previous document.
+`node:test` (`mockup-commands.test.ts`, IT-71) with hand-computed values: `duplicateMockupName`
+(`Inbox copy`, `Inbox copy 2`, a gap, a lowercase name that does not count, a copy of a copy);
+`newMockup`, `duplicateMockup` (`Inbox copy` at (860, 0), then `Inbox copy 2` at (1240, 0), options and
+unknown keys copied, a named mockup copied beside itself) and `deleteMockup` (the next, then the previous
+mockup made active, a named inactive one leaving the active mockup, the last one leaving none) each
+record one undo step with a `change` of kind `mockups` and undo to the previous document; refusals
+change nothing; `session.run` with `{mockup}`; `session.commands` lists the three with their labels and
+enabled states. Browser part (`mockups.spec.mjs`): `run("duplicateMockup")` and `run("deleteMockup")`
+update the frames and the Mockups list and each undoes with Cmd/Ctrl+Z.
--- a/prose.md
+++ b/prose.md
@@ -3,2 +3,10 @@
 duplicate and delete are session commands, so a host's Mockup menu can offer them (SRC-16 D39).
+
+As built (#43): a copy goes where a new mockup would go if the copied mockup were active, so duplicating
+the active mockup places the copy exactly as `newMockup` would, and the copy becomes active. Deleting the
+active mockup hands the activity to its neighbour in document order, so that a run of deletes walks
+through the document; the active mockup moves on before the `change` is told, so no component reads the
+removed one. Deleting the last mockup leaves none active and sends no `active` notification (as undoing
+the first mockup of an empty document does); the outline, the inspector and the editor redraw on the
+`change` of kind `mockups` instead.
 
```
