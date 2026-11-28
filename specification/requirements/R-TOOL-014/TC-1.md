---
id: TC-1
title: Round trip
verifies: [C4, C5, C6]
---

Browser test (`sections.spec.mjs`, IT-72) on `pages/designer.html`: three phone mockups and a section;
a frame moved and renamed, another activated by a click, a zoom step and a wheel pan; `toJSON()` written
with `writeDesign` holds the positions, names, options, code, the section unchanged and the view (zoom
0.75, the canvas's position, the active mockup); a fresh designer opening it shows the same view and
active mockup and writes the same text (F-20.AC3, F-20.AC7); the sample opened and written back without
an edit is the sample. Unit part (`sections.test.ts`): `saveView` writes nothing for an unchanged view,
writes the view and the active mockup with an unknown view key kept after them, follows the active
mockup, adds no `view` to a document without one until something differs, and records no undo step.
Every expected value is written by hand before the code runs.
