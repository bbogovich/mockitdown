---
id: TC-1
title: Drop into the view
verifies: [C1, C3, C5, C6, C7, C11, C12]
---

Browser test on `pages/designer.html`: drag the `Text` card onto the gap between a `VStack`'s first and
second children in the view; the bar is horizontal at that gap; after the drop the code holds the new
`Text(…)` as the stack's second child, selected (F-19.AC1); one undo removes it; Esc during a drag
inserts nothing.

As built (#30): `typescript/tests/browser/drag-drop.spec.mjs` opens the hand-written
`tests/browser/fixtures/drag-sample.mkdesign` (a `VStack` of `Text("First")`, `Text("Second")` and an
`HStack` of two buttons) in the designer of `pages/designer.html` and drags with the pointer
(`page.mouse`). Over the gap between the texts the VStack's box is the `drop-target` and the
`drop-bar` is horizontal (`data-orientation`), wider than tall and between the two texts, with the
`grabbing` cursor; the drop gives the hand-written code with `Text()` second, selected, after exactly
one code `change`. Over the gap between the buttons the bar is vertical; Esc removes the ghost, the
shield and the bar, and releasing afterwards changes nothing. There is no undo yet (R-EDIT-007): the
undo step is checked as the one `change`.
