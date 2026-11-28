---
title: "Canvas of named mockups"
spec_version: 0.13.23
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

**As built (#42).** The canvas moves a frame by its label and renames it in place; the session holds the
rules (`renameMockup`, `newMockup`) and `mockitdown/design`'s frames.ts the arithmetic. A move starts
after 3 px so that a click or a double-click on a label never moves it. Snapping works per axis: the
nearest edge of another frame within 6 screen pixels (6 / zoom canvas units) wins over the 8-unit grid.
A new mockup is placed by the frames' measured sizes, which the canvas lends the session as `measure`;
without a canvas the options' `width` and `height` stand in.

**R-TOOL-012.TC-1 — Rename refused**

Browser test (`frames.spec.mjs`, IT-70) on `pages/designer.html` with mockups `Sign in`, `Inbox`,
`Message`: double-click `Message`'s label, type `Inbox`, Enter; the field stays open beside the refusal
"A mockup named “Inbox” already exists", the names are unchanged and no `mockitdown-rename` fires
(F-20.AC2); renaming to `inbox` succeeds (case-sensitive), closes the field, fires one
`mockitdown-rename` `{from: "Message", to: "inbox"}`, and Cmd/Ctrl+Z gives the old name back; Esc
cancels a rename.

**R-TOOL-012.TC-2 — Moving and placing**

Browser test (`frames.spec.mjs`, IT-70) on `pages/designer.html` with three phone mockups (393 units
wide): dragging `Message`'s label by (13, 21) px at 100 % moves it from (0, 1200) to the grid's
(16, 1224); by (473, -3) to Inbox's left edge 485 (4 units away; the grid would give 488); with Alt by
(5, 3) freely to (490, 1227); the mockup's `x` and `y` and the frame's position follow; a click without
a drag moves nothing; three undos give back each position. `session.newMockup()` with Inbox active adds
`Mockup 1` at (958, 0), 80 units right of Inbox, the rightmost frame of its row, and the Mockups list
marks only that row with the warning.

**R-TOOL-012.TC-3 — Naming, placing and snapping rules**

`node:test` (`frames.test.ts`, IT-70) with hand-computed values: `newMockupName` (none, a gap, a
lowercase name that does not count, the next number), `isDefaultName`, `renameRefusal` (taken, case
different, its own, empty), `snapMove` (grid, Alt, an edge within 6 px at 100 % but not at 200 %, a left
edge), `newMockupPlace` (the rightmost frame overlapping the active one vertically, a frame below and
one ending where the active one starts not counting, no active frame). The session: `renameMockup`
refusals notify nothing and leave no step, a rename notifies `rename`, the active mockup and
`view.active` follow, undo and redo notify `rename` back and forth; steps before a rename still undo
on the renamed mockup; a move is one step of kind `move`; `newMockup` places by `measure`, becomes
active, notifies `change` of kind `mockups` and undoes and redoes, and without `measure` places by the
options' sizes.

**Realizes.** F-20

| | Statement |
|---|---|
| C1 | Each frame MUST carry a label above it with the mockup's name, and dragging the label by 3 CSS pixels or more MUST move the frame, setting the mockup's `x` and `y` through `session.moveMockup` when the drag ends, except in Preview mode; a press and release without such a drag MUST NOT move it. |
| C2 | While a frame moves, each of its axes MUST snap to the nearest edge of another frame within 6 CSS pixels of either of its edges, else to an 8-unit grid; Alt held MUST suspend snapping. |
| C3 | A double-click on the label MUST open an inline field (part `rename-field`) holding the name, Enter MUST rename the mockup to its text, Esc MUST cancel, and leaving the field MUST rename to an accepted text and cancel a refused one; not in Preview mode. |
| C4 | A mockup's name MUST be a non-empty string, case-sensitive and possibly holding spaces, unique within the document; an empty name MUST be refused with the message "A mockup's name must not be empty". |
| C5 | Renaming to a name another mockup holds MUST be refused with the message "A mockup named “<name>” already exists" beside the field (part `rename-error`), the field kept open and the name unchanged. |
| C6 | A rename MUST notify `rename` (R-EDIT-006.C5) and a move MUST notify `change` with the kind `move`. |
| C7 | A move and a rename MUST each be one undo step (R-EDIT-007). |
| C8 | A new mockup MUST be named `Mockup <n>`, `<n>` being the smallest number from 1 that no mockup's name uses, and placed at the active mockup's `y`, 80 canvas units to the right of the rightmost frame that overlaps the active mockup vertically (the active one included), or at (0, 0) when there is no active mockup, and MUST become the active mockup. |
| C9 | The Mockups list (R-TOOL-002.C8) MUST mark each mockup whose name has the form `Mockup <n>` (`data-default-name`) with a warning icon (part `name-warning`) whose title says that SpecItOut tools import mockups by name. |
| C10 | Undoing a rename MUST notify `rename` from the new name to the old one and redoing it from the old name to the new one, neither notifying `change`. |
| C11 | `session.renameMockup(from, to)` MUST rename a mockup as C4 to C7 say, `session.newMockup(code, options)` MUST add one as C8 says with the code `VStack {}` by default, notifying one `change` of kind `mockups` and one undo step, and the session's `measure` (set by the canvas showing it) MUST give the frames' sizes it places by, a frame it does not measure counting as its options' `width` and `height`, else 0. |
| C12 | The rules of C2, C4, C5, C8 and C9 MUST be held by `mockitdown/design` (`snapMove`, `renameRefusal`, `newMockupName`, `newMockupPlace`, `isDefaultName`), which uses no DOM. |
| V1 | Renaming a mockup to a name another mockup holds is refused with a message, and the names stay as they were (F-20.AC2). |

---

### R-TOOL-013 — The active mockup and inactive previews

**Requires:** R-TOOL-012, R-TOOL-002

One mockup at a time is editable (SRC-12#s10, SRC-15#p1.c2): it is the one the outline, the gallery and
the inspector act on. The others render as plain previews, which keeps large canvases fast. New,
duplicate and delete are session commands, so a host's Mockup menu can offer them (SRC-16 D39).

As built (#43): a copy goes where a new mockup would go if the copied mockup were active, so duplicating
the active mockup places the copy exactly as `newMockup` would, and the copy becomes active. Deleting the
active mockup hands the activity to its neighbour in document order, so that a run of deletes walks
through the document; the active mockup moves on before the `change` is told, so no component reads the
removed one. Deleting the last mockup leaves none active and sends no `active` notification (as undoing
the first mockup of an empty document does); the outline, the inspector and the editor redraw on the
`change` of kind `mockups` instead.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-TOOL-002, R-TOOL-012 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-TOOL-013.TC-1 — Activation**

Browser test (`mockups.spec.mjs`, IT-71) on `pages/designer.html` with its sample (`Sign in`, `Inbox`
active): clicking the `Sign in` frame makes it active, then clicking the `Inbox` frame makes it active
again; each time the outline shows the active mockup's tree and the inspector its Mockup tab with its
device (F-20.AC4), and only the active frame holds the `mockitdown-editor` (`data-active`), the other a
`mockitdown-mockup`; choosing `Sign in` in the Mockups list activates it (`aria-current` on its row), and
Enter on the `Inbox` row activates `Inbox`.

**R-TOOL-013.TC-2 — Mockup commands**

`node:test` (`mockup-commands.test.ts`, IT-71) with hand-computed values: `duplicateMockupName`
(`Inbox copy`, `Inbox copy 2`, a gap, a lowercase name that does not count, a copy of a copy);
`newMockup`, `duplicateMockup` (`Inbox copy` at (860, 0), then `Inbox copy 2` at (1240, 0), options and
unknown keys copied, a named mockup copied beside itself) and `deleteMockup` (the next, then the previous
mockup made active, a named inactive one leaving the active mockup, the last one leaving none) each
record one undo step with a `change` of kind `mockups` and undo to the previous document; refusals
change nothing; `session.run` with `{mockup}`; `session.commands` lists the three with their labels and
enabled states. Browser part (`mockups.spec.mjs`): `run("duplicateMockup")` and `run("deleteMockup")`
update the frames and the Mockups list and each undoes with Cmd/Ctrl+Z.

**Realizes.** F-20

| | Statement |
|---|---|
| C1 | A click on a frame, or a click, Enter or Space on a row of the Mockups list, MUST make its mockup the active one through `session.setActive`, clear the selection and notify `active` (R-EDIT-006.C5). |
| C2 | The outline, the gallery and the inspector MUST show the active mockup and follow every change of it, and MUST show no mockup once the last one is deleted. |
| C3 | The canvas MUST render the active mockup as a `mockitdown-editor` with a highlighted frame, and every other mockup as a read-only `mockitdown-mockup` with its options. |
| C4 | The session MUST offer the commands `newMockup`, `duplicateMockup` and `deleteMockup`, listed in `session.commands` (R-EDIT-009.C8) before `undo` with the labels "New Mockup", "Duplicate Mockup" and "Delete Mockup" and no shortcut, `newMockup` always enabled and the other two whenever there is an active mockup, each one undo step notifying `change` with the kind `mockups`. |
| C5 | `duplicateMockup(name)` MUST copy the named mockup, the active one by default, with its code, its options and every other key, name the copy `<name> copy`, or `<name> copy <n>` with the smallest free `<n>` from 2, place it as a new mockup is placed (R-TOOL-012.C8) beside the mockup it copies, and make the copy the active mockup. |
| C6 | `deleteMockup(name)` MUST remove the named mockup, the active one by default; deleting the active mockup MUST make the next mockup in document order active, else the one before it, else none, the active mockup changing before `change` is notified; undoing it MUST put the mockup back at its place, active again if it was. |
| C7 | `duplicateMockup` and `deleteMockup` MUST refuse, changing and notifying nothing, a name no mockup holds and, without a name, a session with no active mockup; `session.run` MUST pass them the argument `mockup`. |
| C8 | The naming rule of C5 MUST be held by `mockitdown/design` as `duplicateMockupName`, which uses no DOM. |
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

**As built (#44).** The rules are in `mockitdown/design` (`design/sections.ts`) and the session; the
canvas only draws sections and forwards drags and renames. A section is addressed by its index in the
document's `sections`, since names need not be unique. The view is written by the designer's `toJSON()`
only when it differs from the one the document opened with, which is what keeps an opened and unedited
document byte-identical when written back.

**R-TOOL-014.TC-1 — Round trip**

Browser test (`sections.spec.mjs`, IT-72) on `pages/designer.html`: three phone mockups and a section;
a frame moved and renamed, another activated by a click, a zoom step and a wheel pan; `toJSON()` written
with `writeDesign` holds the positions, names, options, code, the section unchanged and the view (zoom
0.75, the canvas's position, the active mockup); a fresh designer opening it shows the same view and
active mockup and writes the same text (F-20.AC3, F-20.AC7); the sample opened and written back without
an edit is the sample. Unit part (`sections.test.ts`): `saveView` writes nothing for an unchanged view,
writes the view and the active mockup with an unknown view key kept after them, follows the active
mockup, adds no `view` to a document without one until something differs, and records no undo step.
Every expected value is written by hand before the code runs.

**R-TOOL-014.TC-2 — Sections**

Browser test (`sections.spec.mjs`, IT-72): the sections layer comes first in the world, behind the
frames; `newSection("Onboarding")` encloses the active frame with 40 units of margin, its label at the
top-left, and undoes in one step; dragging the label moves the section, snapped to the grid and freely
with Alt, and the frame wholly inside it, but not the ones partly outside; dragging a corner resizes it
on both axes; a double-click renames it, an empty name refused beside the field; each undoes in one
step with Cmd/Ctrl+Z. Unit part (`sections.test.ts`): `sectionAround`, `framesInside` with edges
included, `snapSectionMove`, `resizeSectionBox` with the minimum size, `documentView`; the session's
`newSection` (creating `sections`, its undo removing the key), `moveSection` carrying the frames wholly
inside and undoing to the written text with an unknown section key kept, `resizeSection`,
`renameSection`, the refusals changing nothing and the `change` of kind `sections`. Every expected value
is written by hand before the code runs.

**Realizes.** F-20

| | Statement |
|---|---|
| C1 | The canvas MUST draw each section of the document as a named rectangle in a layer behind the frames (parts `sections`, `section` with `data-section` its index), its name as a label at its top-left corner inside it (part `section-label`), also in Preview mode. |
| C2 | The session MUST offer the command `newSection(name)`, which adds a section enclosing the active mockup's frame (its size from `session.measure`) with a margin of 40 canvas units at the end of the document's `sections`, creating the list when the document has none, as one undo step, and returns `{section}`, its index. |
| C3 | Dragging a section's label MUST move the section and every frame lying wholly inside it; dragging its edges MUST resize it; a double-click on its label MUST rename it; each MUST be one undo step. |
| C4 | `toJSON()` MUST write the canvas's zoom, its position and the active mockup's name to the document's `view` through `session.saveView(view)`, keeping its other keys, and `open` MUST restore them. |
| C5 | Sections and the view MUST survive `open` followed by `toJSON()` unchanged when nothing was edited. |
| C6 | `saveView` MUST leave the document as it is when the zoom (clamped, 1 when absent), the position (0 when absent) and the active mockup (the one `view.active` names, else the first) are those the document opens with, MUST write `zoom`, `x`, `y` and `active` otherwise, and MUST be no step of the history. |
| C7 | A section's moved corner and its dragged edges MUST snap to the 8-unit grid, freely with Alt held, and a resize MUST keep the opposite edges and a width and height of at least 40 canvas units; the canvas MUST offer a resize handle on every edge and corner (part `section-handle`, `data-edge` one of `n`, `s`, `e`, `w`, `ne`, `nw`, `se`, `sw`) and none of it in Preview mode. |
| C8 | The session MUST make the changes of C3 through `moveSection(index, x, y)`, `resizeSection(index, box)` and `renameSection(index, name)`, each notifying one `change` of kind `sections` with an empty `mockup` and `code`, as do their undo and redo, and a move, resize or rename to the section's current state MUST change nothing. |
| C9 | `newSection` and `renameSection` MUST refuse an empty name with "A section's name must not be empty", `newSection` MUST refuse a session with no active mockup, and the section commands MUST refuse an index no section has and a box without finite `x` and `y` and positive `w` and `h`, changing and notifying nothing; section names need not be unique. |
| C10 | `mockitdown/design` MUST hold the rules of C2, C3 and C7 without the DOM: `sectionAround`, `framesInside`, `snapSectionMove`, `resizeSectionBox` and `documentView`. |
| V1 | Saving and reloading a canvas of three mockups and a section restores every mockup's name, position, options and code, the section and the view (F-20.AC3, F-20.AC7). |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.13.23 | 2026-11-28 | as built (#44): the sections layer, its parts and the label inside the top-left corner (C1); newSection's frame size, place and result (C2); toJSON through session.saveView, other view keys kept (C4); saveView writes only a changed view (C6); grid snapping, minimum size and handles of a section drag (C7); moveSection, resizeSection, renameSection and the change of kind sections (C8); refusals, names need not be unique (C9); the rules in mockitdown/design (C10); TC-1 and TC-2 name their tests (IT-72) |
| 0.13.22 | 2026-11-28 | as built (#43): Enter or Space on a Mockups row, through setActive (C1); no mockup shown after the last is deleted (C2); labels, no shortcut, order and enabled states in session.commands (C4); the copy holds code, options and other keys, placed beside the mockup it copies, made active (C5); deleteMockup's next active mockup and undo (C6); refusals and the run argument mockup (C7); duplicateMockupName in mockitdown/design (C8); TC-1 and TC-2 name their tests (IT-71) |
| 0.13.21 | 2026-11-28 | as built (#42): label drag of 3 px or more through moveMockup, not in Preview (C1); per-axis nearest edge within 6 px over the 8-unit grid (C2); rename field part, Enter, Esc, leaving (C3); the empty-name refusal (C4); refusal beside the field, part rename-error (C5); placement with no active mockup, the new mockup active (C8); data-default-name and part name-warning (C9); undo and redo of a rename notify rename (C10); session.renameMockup, newMockup and measure (C11); rules in mockitdown/design (C12); TC-1 and TC-2 name their tests, TC-3 the unit rules (IT-70) |
| 0.13.20 | 2026-11-28 | as built (#41): frames with labels and natural widths (C1); zoom control part and steps about the centre (C3); fitSelection, fits clamped and centred (C4); Shift+wheel, minimap drag, no click after a pan (C6); minimap parts, bottom right (C7); CSS zoom above 200 % (C8); the designer's editor in the active frame, read-only frames, the canvas property (C9); click activates (C10); view from the document, mockitdown-view (C11); arithmetic in mockitdown/design (C12); editor outlines in a scaled canvas (C13); TC-1 and TC-2 name their tests (IT-69) |
| 0.12.12 | 2026-11-27 | re-checked with the items it cites after the #81 audit: unaffected (#81) |
| 0.11.0 | 2026-11-27 | re-checked against R-TOOL-003 (SRC-18): unaffected; re-checked against R-EDIT-007, R-TOOL-011 (SRC-18): unaffected; re-checked against R-TOOL-002, R-TOOL-012 (SRC-18): unaffected; re-checked against R-EDIT-005, R-TOOL-013 (SRC-18): unaffected |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
| 0.13.22 | 2026-11-28 | as built (#43): Enter or Space on a Mockups row, through setActive (C1); no mockup shown after the last is deleted (C2); labels, no shortcut, order and enabled states in session.commands (C4); the copy holds code, options and other keys, placed beside the mockup it copies, made active (C5); deleteMockup's next active mockup and undo (C6); refusals and the run argument mockup (C7); duplicateMockupName in mockitdown/design (C8); TC-1 and TC-2 name their tests (IT-71) |
| 0.13.21 | 2026-11-28 | as built (#42): label drag of 3 px or more through moveMockup, not in Preview (C1); per-axis nearest edge within 6 px over the 8-unit grid (C2); rename field part, Enter, Esc, leaving (C3); the empty-name refusal (C4); refusal beside the field, part rename-error (C5); placement with no active mockup, the new mockup active (C8); data-default-name and part name-warning (C9); undo and redo of a rename notify rename (C10); session.renameMockup, newMockup and measure (C11); rules in mockitdown/design (C12); TC-1 and TC-2 name their tests, TC-3 the unit rules (IT-70) |
| 0.13.20 | 2026-11-28 | as built (#41): frames with labels and natural widths (C1); zoom control part and steps about the centre (C3); fitSelection, fits clamped and centred (C4); Shift+wheel, minimap drag, no click after a pan (C6); minimap parts, bottom right (C7); CSS zoom above 200 % (C8); the designer's editor in the active frame, read-only frames, the canvas property (C9); click activates (C10); view from the document, mockitdown-view (C11); arithmetic in mockitdown/design (C12); editor outlines in a scaled canvas (C13); TC-1 and TC-2 name their tests (IT-69) |
| 0.12.12 | 2026-11-27 | re-checked with the items it cites after the #81 audit: unaffected (#81) |
| 0.11.0 | 2026-11-27 | re-checked against R-TOOL-003 (SRC-18): unaffected; re-checked against R-EDIT-007, R-TOOL-011 (SRC-18): unaffected; re-checked against R-TOOL-002, R-TOOL-012 (SRC-18): unaffected; re-checked against R-EDIT-005, R-TOOL-013 (SRC-18): unaffected |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
