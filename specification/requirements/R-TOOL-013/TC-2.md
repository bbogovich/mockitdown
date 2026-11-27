---
id: TC-2
title: Mockup commands
verifies: [C4, C5]
---

`node:test`: `newMockup`, `duplicateMockup` (`Inbox copy`, then `Inbox copy 2`) and `deleteMockup`
each record one undo step with a `change` of kind `mockups` and undo to the previous document.
