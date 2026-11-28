---
id: R-TOOL-014.CR-5
target: R-TOOL-014
kind: revision
version: 0.13.23
date: 2026-11-28
issue: 44
summary: "as built (#44): the sections layer, its parts and the label inside the top-left corner (C1); newSection's frame size, place and result (C2); toJSON through session.saveView, other view keys kept (C4); saveView writes only a changed view (C6); grid snapping, minimum size and handles of a section drag (C7); moveSection, resizeSection, renameSection and the change of kind sections (C8); refusals, names need not be unique (C9); the rules in mockitdown/design (C10); TC-1 and TC-2 name their tests (IT-72)"
from: b0f21fbc836b
to: c9b873ef1373
---

## Clauses

@ C1 edit
~ The canvas MUST draw each section of the document as a named rectangle {+in a layer +}behind the [-frames,-]{+frames (parts `sections`, `section` with `data-section` its index),+} its name as a label at its top-left [-corner.-]{+corner inside it (part `section-label`), also in Preview mode.+}
@ C2 edit
~ The session MUST offer the command `newSection(name)`, which adds a section enclosing the active mockup's frame {+(its size from `session.measure`) +}with a margin of 40 canvas [-units,-]{+units at the end of the document's `sections`, creating the list when the document has none,+} as one undo [-step.-]{+step, and returns `{section}`, its index.+}
@ C4 edit
~ `toJSON()` MUST write the canvas's zoom, its position and the active mockup's name to the document's [-`view`,-]{+`view` through `session.saveView(view)`, keeping its other keys,+} and `open` MUST restore them.
@ C6 insert after C5
+ `saveView` MUST leave the document as it is when the zoom (clamped, 1 when absent), the position (0 when absent) and the active mockup (the one `view.active` names, else the first) are those the document opens with, MUST write `zoom`, `x`, `y` and `active` otherwise, and MUST be no step of the history.
@ C7 insert after C6
+ A section's moved corner and its dragged edges MUST snap to the 8-unit grid, freely with Alt held, and a resize MUST keep the opposite edges and a width and height of at least 40 canvas units; the canvas MUST offer a resize handle on every edge and corner (part `section-handle`, `data-edge` one of `n`, `s`, `e`, `w`, `ne`, `nw`, `se`, `sw`) and none of it in Preview mode.
@ C8 insert after C7
+ The session MUST make the changes of C3 through `moveSection(index, x, y)`, `resizeSection(index, box)` and `renameSection(index, name)`, each notifying one `change` of kind `sections` with an empty `mockup` and `code`, as do their undo and redo, and a move, resize or rename to the section's current state MUST change nothing.
@ C9 insert after C8
+ `newSection` and `renameSection` MUST refuse an empty name with "A section's name must not be empty", `newSection` MUST refuse a session with no active mockup, and the section commands MUST refuse an index no section has and a box without finite `x` and `y` and positive `w` and `h`, changing and notifying nothing; section names need not be unique.
@ C10 insert after C9
+ `mockitdown/design` MUST hold the rules of C2, C3 and C7 without the DOM: `sectionAround`, `framesInside`, `snapSectionMove`, `resizeSectionBox` and `documentView`.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,9 +3,13 @@
 title: Round trip
-verifies: [C4, C5]
+verifies: [C4, C5, C6]
 ---
 
-Browser test (`canvas.spec.mjs`) on `pages/designer.html` covering F-20.AC1–AC4 together: three
-mockups and a section; zoom, pan, move a frame, rename one, activate one; `toJSON()`, then `open` the
-result in a fresh designer: names, positions, options, code, section, zoom, position and active
-mockup are restored (F-20.AC3, F-20.AC7); `open` then `toJSON()` of the sample without edits yields the
-sample.
+Browser test (`sections.spec.mjs`, IT-72) on `pages/designer.html`: three phone mockups and a section;
+a frame moved and renamed, another activated by a click, a zoom step and a wheel pan; `toJSON()` written
+with `writeDesign` holds the positions, names, options, code, the section unchanged and the view (zoom
+0.75, the canvas's position, the active mockup); a fresh designer opening it shows the same view and
+active mockup and writes the same text (F-20.AC3, F-20.AC7); the sample opened and written back without
+an edit is the sample. Unit part (`sections.test.ts`): `saveView` writes nothing for an unchanged view,
+writes the view and the active mockup with an unknown view key kept after them, follows the active
+mockup, adds no `view` to a document without one until something differs, and records no undo step.
+Every expected value is written by hand before the code runs.
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,7 +3,15 @@
 title: Sections
-verifies: [C1, C2, C3]
+verifies: [C1, C2, C3, C7, C8, C9, C10]
 ---
 
-Browser test: `newSection("Onboarding")` encloses the active frame with 40 units of margin, its label
-at the top-left; dragging the label moves the section and the frames inside it but not one partly
-outside; resizing and renaming work and each undoes in one step.
+Browser test (`sections.spec.mjs`, IT-72): the sections layer comes first in the world, behind the
+frames; `newSection("Onboarding")` encloses the active frame with 40 units of margin, its label at the
+top-left, and undoes in one step; dragging the label moves the section, snapped to the grid and freely
+with Alt, and the frame wholly inside it, but not the ones partly outside; dragging a corner resizes it
+on both axes; a double-click renames it, an empty name refused beside the field; each undoes in one
+step with Cmd/Ctrl+Z. Unit part (`sections.test.ts`): `sectionAround`, `framesInside` with edges
+included, `snapSectionMove`, `resizeSectionBox` with the minimum size, `documentView`; the session's
+`newSection` (creating `sections`, its undo removing the key), `moveSection` carrying the frames wholly
+inside and undoing to the written text with an unknown section key kept, `resizeSection`,
+`renameSection`, the refusals changing nothing and the `change` of kind `sections`. Every expected value
+is written by hand before the code runs.
--- a/prose.md
+++ b/prose.md
@@ -12 +12,7 @@
 **Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
+
+**As built (#44).** The rules are in `mockitdown/design` (`design/sections.ts`) and the session; the
+canvas only draws sections and forwards drags and renames. A section is addressed by its index in the
+document's `sections`, since names need not be unique. The view is written by the designer's `toJSON()`
+only when it differs from the one the document opened with, which is what keeps an opened and unedited
+document byte-identical when written back.
```
