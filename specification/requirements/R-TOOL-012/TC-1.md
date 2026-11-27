---
id: TC-1
title: Rename refused
verifies: [C3, C4, C5, C6, C7]
---

Browser test on `pages/designer.html` with mockups `Sign in`, `Inbox`, `Message`: double-click
`Message`, type `Inbox`, Enter; the field shows the refusal message, the names are unchanged and no
`mockitdown-rename` fires (F-20.AC2); renaming to `inbox` succeeds (case-sensitive), fires one
`mockitdown-rename` and undoes.
