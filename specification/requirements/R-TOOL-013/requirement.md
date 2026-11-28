---
id: R-TOOL-013
title: The active mockup and inactive previews
status: active
version: 0.14.0
rev: 6
page: WEB.5
slot: reqs
order: 3
hash: 5b4fd954931a
source: [SRC-21, SRC-12, SRC-15, SRC-16]
realizes: [F-20]
requires: [R-TOOL-012, R-TOOL-002]
constrained_by: [A-WEB-5]
refs: [F-20, R-EDIT-006, R-EDIT-009, R-TOOL-012]
---

C1: A click on a frame, or a click, Enter or Space on a row of the Mockups list, MUST make its mockup the active one through `session.setActive`, clear the selection and notify `active` (R-EDIT-006.C5).
C2: The outline, the gallery and the inspector MUST show the active mockup and follow every change of it, and MUST show no mockup once the last one is deleted.
C3: The canvas MUST render the active mockup as a `mockitdown-editor` with a highlighted frame, and every other mockup as a read-only `mockitdown-mockup` with its options.
C4: The session MUST offer the commands `newMockup`, `duplicateMockup` and `deleteMockup`, listed in `session.commands` (R-EDIT-009.C8) before `undo` with the labels "New Mockup", "Duplicate Mockup" and "Delete Mockup" and no shortcut, `newMockup` always enabled and the other two whenever there is an active mockup, each one undo step notifying `change` with the kind `mockups`.
C5: `duplicateMockup(name)` MUST copy the named mockup, the active one by default, with its code, its options and every other key, name the copy `<name>-copy`, or `<name>-copy-<n>` with the smallest free `<n>` from 2 when that name is taken, place it as a new mockup is placed (R-TOOL-012.C8) beside the mockup it copies, and make the copy the active mockup.
C6: `deleteMockup(name)` MUST remove the named mockup, the active one by default; deleting the active mockup MUST make the next mockup in document order active, else the one before it, else none, the active mockup changing before `change` is notified; undoing it MUST put the mockup back at its place, active again if it was.
C7: `duplicateMockup` and `deleteMockup` MUST refuse, changing and notifying nothing, a name no mockup holds and, without a name, a session with no active mockup; `session.run` MUST pass them the argument `mockup`.
C8: The naming rule of C5 MUST be held by `mockitdown/design` as `duplicateMockupName`, which uses no DOM.
V1: Activating a mockup on the canvas loads it into the outline and the inspector (F-20.AC4).
