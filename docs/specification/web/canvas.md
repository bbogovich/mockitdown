---
title: "Canvas of named mockups"
spec_version: 0.13.20
status: draft
updated: 2026-11-28
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

**Re-checked at 0.11.0.** Its cited items R-TOOL-003 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

As built (#41): the active mockup's frame shows the designer's own editor, slotted into the canvas,
so selection, drag and drop and the inline text field work on the canvas as they did in the view; the
editor measures how much its ancestors scale it and keeps its outlines on their elements. A
rendering fills the width it is given, its device frames shrinking to fit, so a frame is given the
rendering's natural width: the device's width, or a fit rendering's own. Above 200 % the frames are
laid out again with the CSS `zoom` property, which lays text out and draws it at the zoomed size. The
view the user pans and zooms to is the canvas's own; saving it in the document is left to the work on
canvas documents.

**R-TOOL-011.TC-1 — Zoom and pan**

Browser test (`canvas.spec.mjs`, IT-69) on `pages/designer.html` with a document of three fit mockups
("Sign in" at 0, 0, "Inbox" at 600, 0, the active one, "Settings" at 0, 500): the frames stand at
their `x` and `y` (at 50 % from (-20, -40): 10, 20 and 310, 270 px), the active one holding the
designer's editor and the others a `mockitdown-mockup`; the toolbar's zoom control lists 10 % to 400 %
and Fit, reaches 10 % and 400 % and no further, nor do Cmd/Ctrl+minus and plus there or `zoom` set to 8
or 0.01; Cmd/Ctrl+plus, plus, minus give 150, 200, 150 %, Cmd/Ctrl+1 100 %; Cmd/Ctrl+wheel of -100 px
zooms by e^0.3 about the pointer, the canvas point under it staying, and the control shows "135%";
Cmd/Ctrl+0 and Fit fit all frames with 40 px margins, centred; `reveal("Inbox")` centres and fits it,
`reveal("Nope")` throws `there is no mockup named "Nope"`; Shift+2 fits the selected button (at 400 %,
centred) and, with nothing selected, the active mockup; a click on the Settings frame makes it active;
Preview mode keeps the canvas with three read-only frames and its list reveals Inbox; Code mode hides
it. A second test: a wheel of ±100 px at 200 % pans ±50 units each way, space-drags and middle-drags of
60 and 40 px pan 30 and 20 units each way without selecting, the minimap shows three frames in the
bottom right corner, dragging its viewport rectangle pans by the distance over its scale each way, and
a click on the Settings mark centres the viewport on that frame.

`node:test` (`canvas.test.ts`, IT-69): `clampZoom`, `stepZoom` up and down through every step,
`zoomAt` about a point, `centreAt`, `fitView` (200 %, clamped to 10 %, an empty box at 100 %),
`unionBox`, `viewBox`, `zoomRendering` and `minimapMapping` with its two conversions, all with
hand-computed values.

**R-TOOL-011.TC-2 — Crisp at 400 %**

Browser test (`canvas.spec.mjs`, IT-69): the Settings text at 200 % is twice and at 400 % four times
its 100 % height (±1 px); the canvas's world is scaled by 1, 2 and 1 and the frame's CSS `zoom` is 1, 1
and 4, so no transform scales above 2 (F-20.AC1); a screenshot of the text at 400 % matches, within a
mean channel difference of 8, the same mockup laid out alone at CSS `zoom` 4.

**Realizes.** F-20

| | Statement |
|---|---|
| C1 | The package MUST define the custom element `mockitdown-canvas`, which shows every mockup of its session's document as a frame (part `frame`, `data-mockup`) at the mockup's `x` and `y`, one canvas unit being one CSS pixel at 100 %, as wide as its rendering's device, or a fit rendering's own width, with the mockup's name above it (part `label`) at the same size at every zoom. |
| C2 | The `zoom` property MUST hold the zoom factor, clamped to 0.1 to 4. |
| C3 | Cmd/Ctrl with the wheel and a pinch gesture MUST zoom about the pointer, Cmd/Ctrl+plus and minus MUST step through 10, 25, 50, 75, 100, 150, 200, 300 and 400 % about the viewport's centre, and the composite designer's toolbar MUST have a zoom control (part `zoom`) offering the same steps and Fit and showing the current zoom. |
| C4 | `fit()` and Cmd/Ctrl+0 MUST fit every frame in the viewport with a margin of 40 CSS pixels, Cmd/Ctrl+1 MUST set 100 %, and Shift+2 (`fitSelection()`) MUST fit the selected element, else the active mockup, every fit centred and within the zoom range of C2. |
| C5 | `reveal(name)` MUST centre and fit the named mockup, and MUST throw for a name the document does not hold. |
| C6 | The canvas MUST pan with the wheel or trackpad scroll, Shift turning a vertical wheel horizontal, by dragging with the space bar held, by dragging with the middle button, and by dragging in the minimap, and a pan drag MUST NOT reach the editor as a click. |
| C7 | A minimap (part `minimap`) MUST show every frame (part `minimap-frame`) and the viewport's rectangle (part `minimap-viewport`) in the bottom right corner of the canvas, and a click in it MUST centre the viewport there. |
| C8 | Up to 200 % the canvas MUST scale the frames with a CSS transform; above it, it MUST lay them out again at the zoomed size with the CSS `zoom` property and no transform scale, so that text stays sharp. |
| C9 | In Design and Preview modes the composite designer MUST use the canvas as its view (its `canvas` property), the active mockup's frame showing the designer's editor in Design mode, and every other frame, and every frame in Preview mode (the canvas's `preview` attribute), a read-only `mockitdown-mockup`. |
| C10 | A click on an inactive frame MUST make its mockup the session's active one (F-20.C5). |
| C11 | The canvas's `view` (`{zoom, x, y}`, the canvas point at the viewport's top left corner) MUST start as the document's `view` and MUST NOT be written back to the document, and every change of it MUST dispatch `mockitdown-view` (bubbling, composed, `detail: {zoom, x, y}`). |
| C12 | The arithmetic of C2 to C8 MUST be held by `mockitdown/design` (`clampZoom`, `stepZoom`, `zoomAt`, `fitView`, `zoomRendering`, `minimapMapping`), which uses no DOM. |
| C13 | The editor's selection and hover outlines, inline text field and drop marks MUST stay on their elements in a scaled or zoomed canvas. |
| V1 | A canvas holding three mockups zooms from 10 % to 400 % and pans in every direction, and the mockups' text stays sharp (F-20.AC1). |

---

### R-TOOL-012 — Mockup frames: labels, moving, renaming and placement

**Requires:** R-TOOL-011, R-EDIT-007

Each mockup is a frame with its name above it (SRC-15#p1.c1). The name is the key SpecItOut tools
import a mockup by, so it is unique, kept exactly as written, and a default name earns a warning in the
Mockups list (SRC-12#s10).

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-007, R-TOOL-011 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

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

**Re-checked at 0.11.0.** Its cited items R-TOOL-002, R-TOOL-012 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

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

**Re-checked at 0.11.0.** Its cited items R-EDIT-005, R-TOOL-013 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

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
| 0.13.20 | 2026-11-28 | as built (#41): frames with labels and natural widths (C1); zoom control part and steps about the centre (C3); fitSelection, fits clamped and centred (C4); Shift+wheel, minimap drag, no click after a pan (C6); minimap parts, bottom right (C7); CSS zoom above 200 % (C8); the designer's editor in the active frame, read-only frames, the canvas property (C9); click activates (C10); view from the document, mockitdown-view (C11); arithmetic in mockitdown/design (C12); editor outlines in a scaled canvas (C13); TC-1 and TC-2 name their tests (IT-69) |
| 0.12.12 | 2026-11-27 | re-checked with the items it cites after the #81 audit: unaffected (#81) |
| 0.11.0 | 2026-11-27 | re-checked against R-TOOL-003 (SRC-18): unaffected; re-checked against R-EDIT-007, R-TOOL-011 (SRC-18): unaffected; re-checked against R-TOOL-002, R-TOOL-012 (SRC-18): unaffected; re-checked against R-EDIT-005, R-TOOL-013 (SRC-18): unaffected |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
| 0.12.12 | 2026-11-27 | re-checked with the items it cites after the #81 audit: unaffected (#81) |
| 0.11.0 | 2026-11-27 | re-checked against R-TOOL-003 (SRC-18): unaffected; re-checked against R-EDIT-007, R-TOOL-011 (SRC-18): unaffected; re-checked against R-TOOL-002, R-TOOL-012 (SRC-18): unaffected; re-checked against R-EDIT-005, R-TOOL-013 (SRC-18): unaffected |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
