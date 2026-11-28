---
id: R-TOOL-014
title: Sections and the canvas round trip
status: active
version: 0.13.23
rev: 5
page: WEB.5
slot: reqs
order: 4
hash: c9b873ef1373
source: [SRC-12, SRC-15]
realizes: [F-20]
requires: [R-TOOL-013, R-EDIT-005]
constrained_by: [A-WEB-5, M-EDIT-1]
refs: [F-20]
---

C1: The canvas MUST draw each section of the document as a named rectangle in a layer behind the frames (parts `sections`, `section` with `data-section` its index), its name as a label at its top-left corner inside it (part `section-label`), also in Preview mode.
C2: The session MUST offer the command `newSection(name)`, which adds a section enclosing the active mockup's frame (its size from `session.measure`) with a margin of 40 canvas units at the end of the document's `sections`, creating the list when the document has none, as one undo step, and returns `{section}`, its index.
C3: Dragging a section's label MUST move the section and every frame lying wholly inside it; dragging its edges MUST resize it; a double-click on its label MUST rename it; each MUST be one undo step.
C4: `toJSON()` MUST write the canvas's zoom, its position and the active mockup's name to the document's `view` through `session.saveView(view)`, keeping its other keys, and `open` MUST restore them.
C5: Sections and the view MUST survive `open` followed by `toJSON()` unchanged when nothing was edited.
C6: `saveView` MUST leave the document as it is when the zoom (clamped, 1 when absent), the position (0 when absent) and the active mockup (the one `view.active` names, else the first) are those the document opens with, MUST write `zoom`, `x`, `y` and `active` otherwise, and MUST be no step of the history.
C7: A section's moved corner and its dragged edges MUST snap to the 8-unit grid, freely with Alt held, and a resize MUST keep the opposite edges and a width and height of at least 40 canvas units; the canvas MUST offer a resize handle on every edge and corner (part `section-handle`, `data-edge` one of `n`, `s`, `e`, `w`, `ne`, `nw`, `se`, `sw`) and none of it in Preview mode.
C8: The session MUST make the changes of C3 through `moveSection(index, x, y)`, `resizeSection(index, box)` and `renameSection(index, name)`, each notifying one `change` of kind `sections` with an empty `mockup` and `code`, as do their undo and redo, and a move, resize or rename to the section's current state MUST change nothing.
C9: `newSection` and `renameSection` MUST refuse an empty name with "A section's name must not be empty", `newSection` MUST refuse a session with no active mockup, and the section commands MUST refuse an index no section has and a box without finite `x` and `y` and positive `w` and `h`, changing and notifying nothing; section names need not be unique.
C10: `mockitdown/design` MUST hold the rules of C2, C3 and C7 without the DOM: `sectionAround`, `framesInside`, `snapSectionMove`, `resizeSectionBox` and `documentView`.
V1: Saving and reloading a canvas of three mockups and a section restores every mockup's name, position, options and code, the section and the view (F-20.AC3, F-20.AC7).
