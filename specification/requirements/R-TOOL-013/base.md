---
id: R-TOOL-013
title: The active mockup and inactive previews
status: active
version: 0.10.0
rev: 0
page: WEB.5
slot: reqs
order: 3
hash: 33dd88618178
source: [SRC-12, SRC-15, SRC-16]
realizes: [F-20]
requires: [R-TOOL-012, R-TOOL-002]
constrained_by: [A-WEB-5]
---

C1: A click on a frame, or on a row of the Mockups list, MUST make its mockup the active one, clear the selection and notify `active` (R-EDIT-006.C5).
C2: The outline, the gallery and the inspector MUST show the active mockup and follow every change of it.
C3: The canvas MUST render the active mockup as a `mockitdown-editor` with a highlighted frame, and every other mockup as a read-only `mockitdown-mockup` with its options.
C4: The session MUST offer the commands `newMockup`, `duplicateMockup` and `deleteMockup`, listed in `session.commands` (R-EDIT-009.C8), each one undo step notifying `change` with the kind `mockups`.
C5: `duplicateMockup` MUST name the copy `<name> copy`, or `<name> copy <n>` with the smallest free `<n>` from 2, and place it as a new mockup is placed (R-TOOL-012.C8).
V1: Activating a mockup on the canvas loads it into the outline and the inspector (F-20.AC4).
<!-- file: TC-1.md -->
---
id: TC-1
title: Activation
verifies: [C1, C2, C3]
---

Browser test on `pages/designer.html`: clicking the `Inbox` frame makes it active; the outline shows
its tree and the inspector its Mockup tab (F-20.AC4); the other frames hold `mockitdown-mockup`
elements and only `Inbox` holds a `mockitdown-editor`; choosing `Sign in` in the Mockups list activates
it.
<!-- file: TC-2.md -->
---
id: TC-2
title: Mockup commands
verifies: [C4, C5]
---

`node:test`: `newMockup`, `duplicateMockup` (`Inbox copy`, then `Inbox copy 2`) and `deleteMockup`
each record one undo step with a `change` of kind `mockups` and undo to the previous document.
<!-- file: prose.md -->
One mockup at a time is editable (SRC-12#s10, SRC-15#p1.c2): it is the one the outline, the gallery and
the inspector act on. The others render as plain previews, which keeps large canvases fast. New,
duplicate and delete are session commands, so a host's Mockup menu can offer them (SRC-16 D39).
