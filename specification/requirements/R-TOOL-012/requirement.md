---
id: R-TOOL-012
title: "Mockup frames: labels, moving, renaming and placement"
status: active
version: 0.13.21
rev: 5
page: WEB.5
slot: reqs
order: 2
hash: d4876fcaa01f
source: [SRC-12, SRC-15]
realizes: [F-20]
requires: [R-TOOL-011, R-EDIT-007]
constrained_by: [A-WEB-5, M-EDIT-2]
refs: [F-20, R-EDIT-006, R-EDIT-007, R-TOOL-002]
---

C1: Each frame MUST carry a label above it with the mockup's name, and dragging the label by 3 CSS pixels or more MUST move the frame, setting the mockup's `x` and `y` through `session.moveMockup` when the drag ends, except in Preview mode; a press and release without such a drag MUST NOT move it.
C2: While a frame moves, each of its axes MUST snap to the nearest edge of another frame within 6 CSS pixels of either of its edges, else to an 8-unit grid; Alt held MUST suspend snapping.
C3: A double-click on the label MUST open an inline field (part `rename-field`) holding the name, Enter MUST rename the mockup to its text, Esc MUST cancel, and leaving the field MUST rename to an accepted text and cancel a refused one; not in Preview mode.
C4: A mockup's name MUST be a non-empty string, case-sensitive and possibly holding spaces, unique within the document; an empty name MUST be refused with the message "A mockup's name must not be empty".
C5: Renaming to a name another mockup holds MUST be refused with the message "A mockup named “<name>” already exists" beside the field (part `rename-error`), the field kept open and the name unchanged.
C6: A rename MUST notify `rename` (R-EDIT-006.C5) and a move MUST notify `change` with the kind `move`.
C7: A move and a rename MUST each be one undo step (R-EDIT-007).
C8: A new mockup MUST be named `Mockup <n>`, `<n>` being the smallest number from 1 that no mockup's name uses, and placed at the active mockup's `y`, 80 canvas units to the right of the rightmost frame that overlaps the active mockup vertically (the active one included), or at (0, 0) when there is no active mockup, and MUST become the active mockup.
C9: The Mockups list (R-TOOL-002.C8) MUST mark each mockup whose name has the form `Mockup <n>` (`data-default-name`) with a warning icon (part `name-warning`) whose title says that SpecItOut tools import mockups by name.
C10: Undoing a rename MUST notify `rename` from the new name to the old one and redoing it from the old name to the new one, neither notifying `change`.
C11: `session.renameMockup(from, to)` MUST rename a mockup as C4 to C7 say, `session.newMockup(code, options)` MUST add one as C8 says with the code `VStack {}` by default, notifying one `change` of kind `mockups` and one undo step, and the session's `measure` (set by the canvas showing it) MUST give the frames' sizes it places by, a frame it does not measure counting as its options' `width` and `height`, else 0.
C12: The rules of C2, C4, C5, C8 and C9 MUST be held by `mockitdown/design` (`snapMove`, `renameRefusal`, `newMockupName`, `newMockupPlace`, `isDefaultName`), which uses no DOM.
V1: Renaming a mockup to a name another mockup holds is refused with a message, and the names stay as they were (F-20.AC2).
