---
id: R-TOOL-014
title: Sections and the canvas round trip
status: active
version: 0.10.3
rev: 1
page: WEB.5
slot: reqs
order: 4
hash: 2f2f76a54997
source: [SRC-12, SRC-15]
realizes: [F-20]
requires: [R-TOOL-013, R-EDIT-005]
constrained_by: [A-WEB-5, M-EDIT-1]
refs: [F-20]
---

C1: The canvas MUST draw each section of the document as a named rectangle behind the frames, its name as a label at its top-left corner.
C2: The session MUST offer the command `newSection(name)`, which adds a section enclosing the active mockup's frame with a margin of 40 canvas units, as one undo step.
C3: Dragging a section's label MUST move the section and every frame lying wholly inside it; dragging its edges MUST resize it; a double-click on its label MUST rename it; each MUST be one undo step.
C4: `toJSON()` MUST write the canvas's zoom, its position and the active mockup's name to the document's `view`, and `open` MUST restore them.
C5: Sections and the view MUST survive `open` followed by `toJSON()` unchanged when nothing was edited.
V1: Saving and reloading a canvas of three mockups and a section restores every mockup's name, position, options and code, the section and the view (F-20.AC3, F-20.AC7).
