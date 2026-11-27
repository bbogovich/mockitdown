---
id: TC-1
title: Sample arguments and inline edit
verifies: [C1, C2, C3]
---

Browser test on `pages/designer.html`: Add on `Button` inserts `Button("Button")` and opens a focused
field with the text selected; typing `Save` and Enter gives `Button("Save")`; undo restores
`Button("Button")` and a second undo removes the button; Add on `List` inserts its sample call without
the sample's rows; Esc keeps the sample text.
