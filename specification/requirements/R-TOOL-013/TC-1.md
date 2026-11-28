---
id: TC-1
title: Activation
verifies: [C1, C2, C3]
---

Browser test (`mockups.spec.mjs`, IT-71) on `pages/designer.html` with its sample (`Sign in`, `Inbox`
active): clicking the `Sign in` frame makes it active, then clicking the `Inbox` frame makes it active
again; each time the outline shows the active mockup's tree and the inspector its Mockup tab with its
device (F-20.AC4), and only the active frame holds the `mockitdown-editor` (`data-active`), the other a
`mockitdown-mockup`; choosing `Sign in` in the Mockups list activates it (`aria-current` on its row), and
Enter on the `Inbox` row activates `Inbox`.
