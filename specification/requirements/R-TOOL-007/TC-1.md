---
id: TC-1
title: Variant change and undo
verifies: [C1, C4, C8]
---

Browser test (`tests/browser/inspector.spec.mjs`, IT-63) on `pages/designer.html`: in the sample's
"Sign in" mockup (mui), select the `Button`, whose pack declares the variants text, outlined and
contained; the inspector shows the four groups; the variant choice lists exactly those after the unset
choice; choosing outlined adds `.variant("outlined")` to the code and the rendered `data-variant` within
500 ms, as one change; Undo restores both (F-19.AC4). Typing " now" at the end of the label field gives
`Button("Sign in now")` with the focus kept in the field, and one Undo gives the sample back with
nothing left to undo (R-EDIT-007.C5).
