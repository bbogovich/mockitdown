---
title: Sections and the saved view
impl_version: 0.3.60
status: draft
updated: 2026-11-28
page_id: IMPL.SECTIONS
---

# Sections and the saved view

Implements **R-TOOL-014** C1 to C10 (#44) on **A-WEB-4** (the session holds the section commands, their
undo steps and the view it writes; `mockitdown/design` the rules) and **A-WEB-5** (the canvas draws the
sections and forwards drags and renames, K2), with **M-EDIT-1.F6** and **F8** (the document's `sections`
and `view`) and **R-EDIT-005** (written back key for key), and extends **R-EDIT-006.C5** (the `change`
kind `sections`). A section is a named rectangle behind a group of frames; the canvas's zoom, position
and active mockup are saved in the document so that a designer reopens it where it was left.

## Data flow

```mermaid
flowchart LR
  h["host"] -- "newSection(name)" --> s["DesignSession"]
  c["mockitdown-canvas: label drag · edge drag · double-click"] -- "moveSection · resizeSection · renameSection" --> s
  s -- "sectionAround · framesInside" --> r["design/sections.ts"]
  c -- "snapSectionMove · resizeSectionBox (preview while dragging)" --> r
  s -- "change sections" --> c
  d["designer.toJSON()"] -- "saveView(canvas.view)" --> s
  s -- "documentView · view.active" --> doc["document.view"]
  o["designer.open(text)"] -- "new session; documentView(view)" --> c
```

## Files

| File | What it holds |
|---|---|
| `typescript/src/design/sections.ts` | the rules, no DOM: `SECTION_MARGIN` (40), `SECTION_MIN` (40), `SECTION_EDGES`, `EMPTY_SECTION_NAME`, `sectionAround`, `liesInside`, `framesInside`, `snapSectionMove`, `resizeSectionBox`, `sectionNameRefusal`, `documentView` |
| `typescript/src/design/session.ts` | `sections`, `newSection(name)`, `moveSection(index, x, y)`, `resizeSection(index, box)`, `renameSection(index, name)`, `saveView(view?)`; the history's `SectionStep` (`SectionsSnapshot`: the list, each section's values, every frame's position) and `restoreSections` |
| `typescript/src/elements/canvas.ts` | the sections layer (part `sections`) first in the world, one `section` per section with its `section-label` and eight `section-handle`s, the drag state `#sectionDrag`, the shared inline rename field; the view from `documentView` |
| `typescript/src/elements/designer.ts` | `toJSON()` calls `session.saveView(canvas.view)` |

## Design

- **Behind the frames** (C1): the sections layer is the world's first child, so the frames, appended
  after it, paint over it. Sections take no pointer events except their label and handles, so clicks on
  a section's area reach the canvas as before. Labels and handles are sized by `1 / zoom`, like the
  frames' labels; the handles are hidden in Preview mode, where nothing is dragged.
- **Addressed by index**: section names need not be unique (C9), so the canvas and the session name a
  section by its index in `document.sections` (`data-section`).
- **One step** (C3, C8): a section change is a `SectionStep` of the history, not a mockup's step: it
  holds the list (or its absence: undoing the first `newSection` removes the key again), each section
  object with its values (objects, so the key order read with them is kept) and every mockup's position.
  It notifies one `change` of kind `sections` with an empty `mockup` and `code`, which the editor, the
  outline and the inspector ignore and the canvas redraws on. Section steps never coalesce.
- **Frames inside** (C3): `moveSection` takes the frames wholly inside the section before the move, by
  the frame sizes the canvas lends as `session.measure`; the canvas previews the same set during the drag
  and calls the session once, on release.
- **Snapping** (C7): the moved corner is rounded to the 8-unit grid (`snapSectionMove`), the dragged
  edges of a resize too (`resizeSectionBox`, the opposite edges fixed, at least 40 × 40); Alt places
  freely. There is no edge snapping between sections and frames.
- **The saved view** (C4 to C6): the canvas never writes the document. `designer.toJSON()` passes the
  canvas's view to `session.saveView`, which compares it and the active mockup with what the document
  opens with (`documentView`: zoom clamped, 1 and 0 for absent values; `view.active` when a mockup holds
  it, else the first mockup) and writes `zoom`, `x`, `y`, `active` only when something differs, keeping
  the view's other keys after them. That is why a document opened and written back without an edit is
  the same text, even one without a `view`. `open` restores the view because the canvas reads
  `documentView(document.view)` when it joins the new session, and the session picks `view.active`.

## API

```js
session.newSection("Onboarding");                 // {section: 1}: the active frame grown by 40
session.moveSection(1, 400, 0);                   // the frames wholly inside move with it
session.resizeSection(1, { x: 400, y: 0, w: 900, h: 700 });
session.renameSection(1, "Onboarding flow");      // "" → {error: "A section's name must not be empty"}
session.saveView({ zoom: 0.75, x: 120, y: 40 });  // what designer.toJSON() does with the canvas's view
import { sectionAround, framesInside, snapSectionMove, resizeSectionBox, documentView } from "mockitdown/design";
```

## Tests

IT-72: `typescript/tests/unit/sections.test.ts` (R-TOOL-014.TC-1 and TC-2, the rules and the session's
section commands and `saveView` with hand-computed boxes) and `typescript/tests/browser/sections.spec.mjs`
(TC-1, the round trip through a fresh designer and the sample; TC-2, drawing, `newSection`, label and
corner drags and the rename on `pages/designer.html`). See [Testing](../testing.md).

## Debugging

- A dragged section leaves a frame behind: the frame is only partly inside (its measured height
  counts; a phone is 852 high), or the canvas has not measured it yet (`canvas.rendered`).
- `toJSON()` changes an untouched document: the canvas's view moved (a `fit()`, `reveal` or wheel), or
  the active mockup is not the one `view.active` names; both count as edits of the view.
- No section appears: the document's `sections` is empty, or the canvas has another session than the
  designer's.

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.3.60 | 2026-11-28 | Page written: sections on the canvas, the section commands and their undo step, the view saved by `toJSON()`, IT-72 (#44) |
