---
id: R-TOOL-013
title: The active mockup and inactive previews
status: active
version: 0.11.0
rev: 3
page: WEB.5
slot: reqs
order: 3
hash: cc76b4919dc9
source: [SRC-12, SRC-15, SRC-16]
realizes: [F-20]
requires: [R-TOOL-012, R-TOOL-002]
constrained_by: [A-WEB-5]
refs: [F-20, R-EDIT-006, R-EDIT-009, R-TOOL-012]
---

C1: A click on a frame, or on a row of the Mockups list, MUST make its mockup the active one, clear the selection and notify `active` (R-EDIT-006.C5).
C2: The outline, the gallery and the inspector MUST show the active mockup and follow every change of it.
C3: The canvas MUST render the active mockup as a `mockitdown-editor` with a highlighted frame, and every other mockup as a read-only `mockitdown-mockup` with its options.
C4: The session MUST offer the commands `newMockup`, `duplicateMockup` and `deleteMockup`, listed in `session.commands` (R-EDIT-009.C8), each one undo step notifying `change` with the kind `mockups`.
C5: `duplicateMockup` MUST name the copy `<name> copy`, or `<name> copy <n>` with the smallest free `<n>` from 2, and place it as a new mockup is placed (R-TOOL-012.C8).
V1: Activating a mockup on the canvas loads it into the outline and the inspector (F-20.AC4).
