---
id: TC-1
title: Drop into the view
verifies: [C1, C3, C5, C6]
---

Browser test on `pages/designer.html`: drag the `Text` card onto the gap between a `VStack`'s first and
second children in the view; the bar is horizontal at that gap; after the drop the code holds the new
`Text(…)` as the stack's second child, selected (F-19.AC1); one undo removes it; Esc during a drag
inserts nothing.
