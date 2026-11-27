---
id: R-TOOL-014
title: Sections and the canvas round trip
status: active
version: 0.10.0
rev: 0
page: WEB.5
slot: reqs
order: 4
hash: 764994faf896
source: [SRC-12, SRC-15]
realizes: [F-20]
requires: [R-TOOL-013, R-EDIT-005]
constrained_by: [A-WEB-5, M-EDIT-1]
---

C1: The canvas MUST draw each section of the document as a named rectangle behind the frames, its name as a label at its top-left corner.
C2: The session MUST offer the command `newSection(name)`, which adds a section enclosing the active mockup's frame with a margin of 40 canvas units, as one undo step.
C3: Dragging a section's label MUST move the section and every frame lying wholly inside it; dragging its edges MUST resize it; a double-click on its label MUST rename it; each MUST be one undo step.
C4: `toJSON()` MUST write the canvas's zoom, its position and the active mockup's name to the document's `view`, and `open` MUST restore them.
C5: Sections and the view MUST survive `open` followed by `toJSON()` unchanged when nothing was edited.
V1: Saving and reloading a canvas of three mockups and a section restores every mockup's name, position, options and code, the section and the view (F-20.AC3, F-20.AC7).
<!-- file: TC-1.md -->
---
id: TC-1
title: Round trip
verifies: [C4, C5]
---

Browser test (`canvas.spec.mjs`) on `pages/designer.html` covering F-20.AC1–AC4 together: three
mockups and a section; zoom, pan, move a frame, rename one, activate one; `toJSON()`, then `open` the
result in a fresh designer: names, positions, options, code, section, zoom, position and active
mockup are restored (F-20.AC3, F-20.AC7); `open` then `toJSON()` of the sample without edits yields the
sample.
<!-- file: TC-2.md -->
---
id: TC-2
title: Sections
verifies: [C1, C2, C3]
---

Browser test: `newSection("Onboarding")` encloses the active frame with 40 units of margin, its label
at the top-left; dragging the label moves the section and the frames inside it but not one partly
outside; resizing and renaming work and each undoes in one step.
<!-- file: prose.md -->
Optional named rectangles behind groups of mockups (SRC-12#s10), for example "Onboarding flow", which a
Markdown export can turn into headings. The canvas's own state — zoom, position, active mockup — is part
of the document, so a designer reopens it where they left off.
