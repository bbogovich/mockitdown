---
id: R-EDIT-007.CR-5
target: R-EDIT-007
kind: correction
version: 0.13.13
date: 2026-11-28
issue: 34
summary: "as built (#34): steps snapshot code, tree, options, position, active mockup and selection; coalescing per mockup and kind, ended by undo or redo, {coalesce} argument, now clock, empty bursts dropped; historyLimit; designer keys and Undo/Redo parts outside Preview; TC-1/TC-2 name IT-62, the inspector part waits for R-TOOL-007"
from: d81191156f0e
to: 80794219d5f4
---

## Clauses

@ C1 edit
~ The session MUST keep one undo history per design document, each step holding the mockup, {+its code, last valid tree, options and position before and after +}the change, the change's [-inverse-]{+text edits and their inverse, and the active mockup+} and the selection before and after it.
@ C3 edit
~ `session.undo()` MUST revert the latest step and restore the {+active mockup and the +}selection from before [-it;-]{+it, the restored nodes keeping their ids;+} `session.redo()` MUST reapply the step undone last and restore the {+active mockup and the +}selection from after [-it.-]{+it; each MUST be refused, changing and notifying nothing, when there is no such step.+}
@ C4 edit
~ A change made with the same coalescing key as the latest step, {+to the same mockup and of the same change kind, +}within 1000 ms of that step's last [-change,-]{+change and with no undo or redo since,+} MUST be merged into that step instead of forming a new one.
@ C7 edit
~ Undo and redo MUST each notify one `change` (R-EDIT-006.C5) {+of the step's change kind +}holding the edits they [-made.-]{+made, the step's inverse for undo and its edits for redo, empty for kinds other than `code`.+}
@ C9 replace
- The history MUST keep at least the latest 200 steps.
+ The history MUST keep the latest 200 steps, or more when the session's `historyLimit` option says so, dropping the oldest.
@ C10 edit
~ The composite designer MUST bind Cmd/Ctrl+Z to undo and Shift+Cmd/Ctrl+Z and Ctrl+Y to redo while the focus is [-not-]{+in+} [-in-]{+it, outside+} a text [-field,-]{+field and outside Preview mode,+} and its toolbar MUST have Undo and Redo buttons {+(parts `undo` and `redo`) +}enabled by [-C8.-]{+C8 and disabled in Preview mode.+}
@ C11 insert after C10
+ `apply`, `setCode`, `setText`, `setOptions` and `moveMockup` MUST take an optional last argument `{coalesce}` naming the change's coalescing key, a change without one forming a step of its own.
@ C12 insert after C11
+ A merged step whose state after it equals its state before it MUST be dropped from the history.
@ C13 insert after C12
+ The coalescing clock MUST be the session's `now` option, by default `Date.now`.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -6,4 +6,9 @@
 
-`node:test`: a random sequence of 50 operations on a session; undoing all restores the original
-document and selection, redoing all the final ones, each undo and redo notifying one `change`; a new
-operation after two undos makes `canRedo` false; 250 steps keep at least the latest 200.
+`node:test` (`tests/unit/undo.test.ts`, IT-62): a seeded random sequence of 50 operations, commands
+and code changes (insert, delete, setText, setCode, setOptions, moveMockup, move, with random
+selections and active mockups between them) on a two-mockup session; undoing all restores the original
+document text and selection, redoing all the final ones, each undo and redo notifying one `change`
+whose edits turn the code before it into the code after it; undo of a delete selects the deleted node
+again with its id, redo the delete's selection, and undo of another mockup's step makes it active;
+options and moves undo as changes of their own kind with no edits; a new step after two undos makes
+`canRedo` false; 250 steps keep at least the latest 200.
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,8 +3,13 @@
 title: Coalescing
-verifies: [C4, C5, C10]
+verifies: [C4, C10, C11, C12, C13]
 ---
 
-`node:test` with a fake clock: ten changes with one key 100 ms apart form one step, a change 1500 ms
-later a new one, a change with another key a new one. Browser test on `pages/designer.html`: typing a
-word in an inspector field and pressing Cmd/Ctrl+Z restores the field's old value in one step; the
-toolbar's Undo button is disabled on a fresh document.
+`node:test` with a fake clock (`tests/unit/undo.test.ts`, IT-62): ten changes with one key 100 ms apart
+and an eleventh 950 ms after the tenth form one step, a change 1500 ms later a new one, a change with
+another key a new one, changes without a key one step each; the same key after an undo and a redo a new
+step; a burst that comes back to its start leaves no step; `setText` with a key coalesces. Browser test
+on `pages/designer.html` (`tests/browser/undo.spec.mjs`): the toolbar's Undo and Redo are disabled on a
+fresh document; after deleting the button, Cmd/Ctrl+Z restores the sample document and the button's
+selection in one change, Shift+Cmd/Ctrl+Z and Ctrl+Y redo, the toolbar's buttons do the same, the keys
+do nothing in the gallery's search field, and a newly opened document has nothing to undo. Typing a
+word in an inspector field and undoing it in one step (C5) is tested with the inspector (R-TOOL-007).
--- a/prose.md
+++ b/prose.md
@@ -15 +15,8 @@
 **Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
+
+**As built (#34).** A step snapshots the mockup's code and its last valid tree, so an undo restores the
+very nodes (and ids) that were selected, and the active mockup with them: undoing a step of another
+mockup switches to it. Coalescing merges only into the latest step, for the same mockup and kind of
+change, and an undo or redo ends the burst. The designer binds the keys on itself, so they act only
+while the focus is inside it, and leaves them to text fields and to Preview mode, where the document
+is read-only. The inspector and the code view (C5) pass their keys when they are built.
```
