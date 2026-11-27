---
title: "Canvas of named mockups"
spec_version: 0.10.8
status: draft
updated: 2026-11-27
page_id: WEB.5
---

# Canvas of named mockups

The infinite canvas (F-20; SRC-12#s10, SRC-15): several named mockups as frames on a surface that
zooms from 10 % to 400 % and pans, with a minimap and optional sections. The active mockup is the one
the outline, the gallery and the inspector act on; the others are drawn as previews. A mockup's name is
the key SpecItOut tools import it by, so names are unique and the canvas warns about default ones. The
canvas reads and writes its state through the design document (R-EDIT-005).

### R-TOOL-011 — The canvas: mockitdown-canvas

**Requires:** R-TOOL-003

The infinite canvas of SRC-15 (SRC-12#s10). Mockups are HTML, so they stay sharp at every zoom level:
frames are scaled with transforms up to 200 % and laid out again beyond, where a scaled bitmap would blur.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-TOOL-011.TC-1 — Zoom and pan**

Browser test (`canvas.spec.mjs`) on `pages/designer.html` with three mockups: Cmd/Ctrl+wheel zooms
about the pointer; the toolbar control reaches 10 % and 400 % and no further; Cmd/Ctrl+0 fits all
frames inside the viewport with 40 px margins; Cmd/Ctrl+1 gives 100 %; scroll, space-drag, middle-drag
and a minimap drag each pan in all four directions; `reveal("Inbox")` centres it; `reveal("Nope")`
throws.

**R-TOOL-011.TC-2 — Crisp at 400 %**

Browser test: at 400 % a text element's computed font size times the remaining transform scale equals
four times its 100 % size and the frame has no transform scale above 2 (F-20.AC1); a screenshot of a
text at 400 % has no blur against a reference rendered at that size.

**Realizes.** F-20

| | Statement |
|---|---|
| C1 | The package MUST define the custom element `mockitdown-canvas`, which shows every mockup of its session's document as a frame at the mockup's `x` and `y`, one canvas unit being one CSS pixel at 100 %. |
| C2 | The `zoom` property MUST hold the zoom factor, clamped to 0.1 to 4. |
| C3 | Cmd/Ctrl with the wheel and a pinch gesture MUST zoom about the pointer, Cmd/Ctrl+plus and minus MUST step through 10, 25, 50, 75, 100, 150, 200, 300 and 400 %, and the composite designer's toolbar MUST have a zoom control offering the same steps and fit. |
| C4 | `fit()` and Cmd/Ctrl+0 MUST fit every frame in the viewport with a margin of 40 CSS pixels, Cmd/Ctrl+1 MUST set 100 %, and Shift+2 MUST fit the selected element, else the active mockup. |
| C5 | `reveal(name)` MUST centre and fit the named mockup, and MUST throw for a name the document does not hold. |
| C6 | The canvas MUST pan with the wheel or trackpad scroll, by dragging with the space bar held, by dragging with the middle button, and by dragging the minimap's viewport. |
| C7 | A minimap MUST show every frame and the viewport's rectangle in a corner of the canvas, and a click in it MUST centre the viewport there. |
| C8 | Up to 200 % the canvas MUST scale the frames with a CSS transform; above it, it MUST lay them out again at the zoomed size, so that text stays sharp. |
| C9 | In Design and Preview modes the composite designer MUST use the canvas as its view. |
| V1 | A canvas holding three mockups zooms from 10 % to 400 % and pans in every direction, and the mockups' text stays sharp (F-20.AC1). |

---

### R-TOOL-012 — Mockup frames: labels, moving, renaming and placement

**Requires:** R-TOOL-011, R-EDIT-007

Each mockup is a frame with its name above it (SRC-15#p1.c1). The name is the key SpecItOut tools
import a mockup by, so it is unique, kept exactly as written, and a default name earns a warning in the
Mockups list (SRC-12#s10).

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-TOOL-012.TC-1 — Rename refused**

Browser test on `pages/designer.html` with mockups `Sign in`, `Inbox`, `Message`: double-click
`Message`, type `Inbox`, Enter; the field shows the refusal message, the names are unchanged and no
`mockitdown-rename` fires (F-20.AC2); renaming to `inbox` succeeds (case-sensitive), fires one
`mockitdown-rename` and undoes.

**R-TOOL-012.TC-2 — Moving and placing**

Browser test: dragging a label moves the frame by the drag snapped to 8 px, to a neighbour's edge
within 6 px, freely with Alt; the mockup's `x` and `y` follow; undo restores them; a new mockup is
`Mockup 1` placed 80 units right of the row's rightmost frame and is flagged in the Mockups list.

**Realizes.** F-20

| | Statement |
|---|---|
| C1 | Each frame MUST carry a label above it with the mockup's name, and dragging the label MUST move the frame, updating the mockup's `x` and `y` when the drag ends. |
| C2 | While a frame moves, its position MUST snap to an 8-pixel grid and to the edges of other frames within 6 CSS pixels; Alt held MUST suspend snapping. |
| C3 | A double-click on the label MUST open an inline field to rename the mockup. |
| C4 | A mockup's name MUST be a non-empty string, case-sensitive and possibly holding spaces, unique within the document. |
| C5 | Renaming to a name another mockup holds MUST be refused with the message "A mockup named “<name>” already exists" beside the label, the name unchanged. |
| C6 | A rename MUST notify `rename` (R-EDIT-006.C5) and a move MUST notify `change` with the kind `move`. |
| C7 | A move and a rename MUST each be one undo step (R-EDIT-007). |
| C8 | A new mockup MUST be named `Mockup <n>`, `<n>` being the smallest number from 1 that no mockup's name uses, and placed at the active mockup's `y`, 80 canvas units to the right of the rightmost frame that overlaps the active mockup vertically. |
| C9 | The Mockups list (R-TOOL-002.C8) MUST mark each mockup whose name has the form `Mockup <n>` with a warning that SpecItOut tools import mockups by name. |
| V1 | Renaming a mockup to a name another mockup holds is refused with a message, and the names stay as they were (F-20.AC2). |

---

### R-TOOL-013 — The active mockup and inactive previews

**Requires:** R-TOOL-012, R-TOOL-002

One mockup at a time is editable (SRC-12#s10, SRC-15#p1.c2): it is the one the outline, the gallery and
the inspector act on. The others render as plain previews, which keeps large canvases fast. New,
duplicate and delete are session commands, so a host's Mockup menu can offer them (SRC-16 D39).

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-TOOL-013.TC-1 — Activation**

Browser test on `pages/designer.html`: clicking the `Inbox` frame makes it active; the outline shows
its tree and the inspector its Mockup tab (F-20.AC4); the other frames hold `mockitdown-mockup`
elements and only `Inbox` holds a `mockitdown-editor`; choosing `Sign in` in the Mockups list activates
it.

**R-TOOL-013.TC-2 — Mockup commands**

`node:test`: `newMockup`, `duplicateMockup` (`Inbox copy`, then `Inbox copy 2`) and `deleteMockup`
each record one undo step with a `change` of kind `mockups` and undo to the previous document.

**Realizes.** F-20

| | Statement |
|---|---|
| C1 | A click on a frame, or on a row of the Mockups list, MUST make its mockup the active one, clear the selection and notify `active` (R-EDIT-006.C5). |
| C2 | The outline, the gallery and the inspector MUST show the active mockup and follow every change of it. |
| C3 | The canvas MUST render the active mockup as a `mockitdown-editor` with a highlighted frame, and every other mockup as a read-only `mockitdown-mockup` with its options. |
| C4 | The session MUST offer the commands `newMockup`, `duplicateMockup` and `deleteMockup`, listed in `session.commands` (R-EDIT-009.C8), each one undo step notifying `change` with the kind `mockups`. |
| C5 | `duplicateMockup` MUST name the copy `<name> copy`, or `<name> copy <n>` with the smallest free `<n>` from 2, and place it as a new mockup is placed (R-TOOL-012.C8). |
| V1 | Activating a mockup on the canvas loads it into the outline and the inspector (F-20.AC4). |

---

### R-TOOL-014 — Sections and the canvas round trip

**Requires:** R-TOOL-013, R-EDIT-005

Optional named rectangles behind groups of mockups (SRC-12#s10), for example "Onboarding flow", which a
Markdown export can turn into headings. The canvas's own state — zoom, position, active mockup — is part
of the document, so a designer reopens it where they left off.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-TOOL-014.TC-1 — Round trip**

Browser test (`canvas.spec.mjs`) on `pages/designer.html` covering F-20.AC1–AC4 together: three
mockups and a section; zoom, pan, move a frame, rename one, activate one; `toJSON()`, then `open` the
result in a fresh designer: names, positions, options, code, section, zoom, position and active
mockup are restored (F-20.AC3, F-20.AC7); `open` then `toJSON()` of the sample without edits yields the
sample.

**R-TOOL-014.TC-2 — Sections**

Browser test: `newSection("Onboarding")` encloses the active frame with 40 units of margin, its label
at the top-left; dragging the label moves the section and the frames inside it but not one partly
outside; resizing and renaming work and each undoes in one step.

**Realizes.** F-20

| | Statement |
|---|---|
| C1 | The canvas MUST draw each section of the document as a named rectangle behind the frames, its name as a label at its top-left corner. |
| C2 | The session MUST offer the command `newSection(name)`, which adds a section enclosing the active mockup's frame with a margin of 40 canvas units, as one undo step. |
| C3 | Dragging a section's label MUST move the section and every frame lying wholly inside it; dragging its edges MUST resize it; a double-click on its label MUST rename it; each MUST be one undo step. |
| C4 | `toJSON()` MUST write the canvas's zoom, its position and the active mockup's name to the document's `view`, and `open` MUST restore them. |
| C5 | Sections and the view MUST survive `open` followed by `toJSON()` unchanged when nothing was edited. |
| V1 | Saving and reloading a canvas of three mockups and a section restores every mockup's name, position, options and code, the section and the view (F-20.AC3, F-20.AC7). |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
