---
id: R-TOOL-012.CR-5
target: R-TOOL-012
kind: revision
version: 0.13.21
date: 2026-11-28
issue: 42
summary: "as built (#42): label drag of 3 px or more through moveMockup, not in Preview (C1); per-axis nearest edge within 6 px over the 8-unit grid (C2); rename field part, Enter, Esc, leaving (C3); the empty-name refusal (C4); refusal beside the field, part rename-error (C5); placement with no active mockup, the new mockup active (C8); data-default-name and part name-warning (C9); undo and redo of a rename notify rename (C10); session.renameMockup, newMockup and measure (C11); rules in mockitdown/design (C12); TC-1 and TC-2 name their tests, TC-3 the unit rules (IT-70)"
from: c280ba9539a9
to: d4876fcaa01f
---

## Clauses

@ C1 edit
~ Each frame MUST carry a label above it with the mockup's name, and dragging the label {+by 3 CSS pixels or more +}MUST move the frame, [-updating-]{+setting+} the mockup's `x` and `y` {+through `session.moveMockup` +}when the drag [-ends.-]{+ends, except in Preview mode; a press and release without such a drag MUST NOT move it.+}
@ C2 edit
~ While a frame moves, {+each of +}its [-position-]{+axes+} MUST snap to [-an 8-pixel grid and to -]the [-edges-]{+nearest edge+} of [-other-]{+another+} [-frames-]{+frame+} within 6 CSS [-pixels;-]{+pixels of either of its edges, else to an 8-unit grid;+} Alt held MUST suspend snapping.
@ C3 replace
- A double-click on the label MUST open an inline field to rename the mockup.
+ A double-click on the label MUST open an inline field (part `rename-field`) holding the name, Enter MUST rename the mockup to its text, Esc MUST cancel, and leaving the field MUST rename to an accepted text and cancel a refused one; not in Preview mode.
@ C4 edit
~ A mockup's name MUST be a non-empty string, case-sensitive and possibly holding spaces, unique within the [-document.-]{+document; an empty name MUST be refused with the message "A mockup's name must not be empty".+}
@ C5 edit
~ Renaming to a name another mockup holds MUST be refused with the message "A mockup named “<name>” already exists" beside the [-label,-]{+field (part `rename-error`), the field kept open and+} the name unchanged.
@ C8 edit
~ A new mockup MUST be named `Mockup <n>`, `<n>` being the smallest number from 1 that no mockup's name uses, and placed at the active mockup's `y`, 80 canvas units to the right of the rightmost frame that overlaps the active mockup [-vertically.-]{+vertically (the active one included), or at (0, 0) when there is no active mockup, and MUST become the active mockup.+}
@ C9 edit
~ The Mockups list (R-TOOL-002.C8) MUST mark each mockup whose name has the form `Mockup <n>` {+(`data-default-name`) +}with a warning{+ icon (part `name-warning`) whose title says+} that SpecItOut tools import mockups by name.
@ C10 insert after C9
+ Undoing a rename MUST notify `rename` from the new name to the old one and redoing it from the old name to the new one, neither notifying `change`.
@ C11 insert after C10
+ `session.renameMockup(from, to)` MUST rename a mockup as C4 to C7 say, `session.newMockup(code, options)` MUST add one as C8 says with the code `VStack {}` by default, notifying one `change` of kind `mockups` and one undo step, and the session's `measure` (set by the canvas showing it) MUST give the frames' sizes it places by, a frame it does not measure counting as its options' `width` and `height`, else 0.
@ C12 insert after C11
+ The rules of C2, C4, C5, C8 and C9 MUST be held by `mockitdown/design` (`snapMove`, `renameRefusal`, `newMockupName`, `newMockupPlace`, `isDefaultName`), which uses no DOM.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -6,5 +6,7 @@
 
-Browser test on `pages/designer.html` with mockups `Sign in`, `Inbox`, `Message`: double-click
-`Message`, type `Inbox`, Enter; the field shows the refusal message, the names are unchanged and no
-`mockitdown-rename` fires (F-20.AC2); renaming to `inbox` succeeds (case-sensitive), fires one
-`mockitdown-rename` and undoes.
+Browser test (`frames.spec.mjs`, IT-70) on `pages/designer.html` with mockups `Sign in`, `Inbox`,
+`Message`: double-click `Message`'s label, type `Inbox`, Enter; the field stays open beside the refusal
+"A mockup named “Inbox” already exists", the names are unchanged and no `mockitdown-rename` fires
+(F-20.AC2); renaming to `inbox` succeeds (case-sensitive), closes the field, fires one
+`mockitdown-rename` `{from: "Message", to: "inbox"}`, and Cmd/Ctrl+Z gives the old name back; Esc
+cancels a rename.
--- a/TC-2.md
+++ b/TC-2.md
@@ -6,4 +6,8 @@
 
-Browser test: dragging a label moves the frame by the drag snapped to 8 px, to a neighbour's edge
-within 6 px, freely with Alt; the mockup's `x` and `y` follow; undo restores them; a new mockup is
-`Mockup 1` placed 80 units right of the row's rightmost frame and is flagged in the Mockups list.
+Browser test (`frames.spec.mjs`, IT-70) on `pages/designer.html` with three phone mockups (393 units
+wide): dragging `Message`'s label by (13, 21) px at 100 % moves it from (0, 1200) to the grid's
+(16, 1224); by (473, -3) to Inbox's left edge 485 (4 units away; the grid would give 488); with Alt by
+(5, 3) freely to (490, 1227); the mockup's `x` and `y` and the frame's position follow; a click without
+a drag moves nothing; three undos give back each position. `session.newMockup()` with Inbox active adds
+`Mockup 1` at (958, 0), 80 units right of Inbox, the rightmost frame of its row, and the Mockups list
+marks only that row with the warning.
--- /dev/null
+++ b/TC-3.md
@@ -0,0 +1,16 @@
+---
+id: TC-3
+title: Naming, placing and snapping rules
+verifies: [C2, C4, C5, C8, C10, C11, C12]
+---
+
+`node:test` (`frames.test.ts`, IT-70) with hand-computed values: `newMockupName` (none, a gap, a
+lowercase name that does not count, the next number), `isDefaultName`, `renameRefusal` (taken, case
+different, its own, empty), `snapMove` (grid, Alt, an edge within 6 px at 100 % but not at 200 %, a left
+edge), `newMockupPlace` (the rightmost frame overlapping the active one vertically, a frame below and
+one ending where the active one starts not counting, no active frame). The session: `renameMockup`
+refusals notify nothing and leave no step, a rename notifies `rename`, the active mockup and
+`view.active` follow, undo and redo notify `rename` back and forth; steps before a rename still undo
+on the renamed mockup; a move is one step of kind `move`; `newMockup` places by `measure`, becomes
+active, notifies `change` of kind `mockups` and undoes and redoes, and without `measure` places by the
+options' sizes.
--- a/prose.md
+++ b/prose.md
@@ -12 +12,8 @@
 **Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
+
+**As built (#42).** The canvas moves a frame by its label and renames it in place; the session holds the
+rules (`renameMockup`, `newMockup`) and `mockitdown/design`'s frames.ts the arithmetic. A move starts
+after 3 px so that a click or a double-click on a label never moves it. Snapping works per axis: the
+nearest edge of another frame within 6 screen pixels (6 / zoom canvas units) wins over the 8-unit grid.
+A new mockup is placed by the frames' measured sizes, which the canvas lends the session as `measure`;
+without a canvas the options' `width` and `height` stand in.
```
