---
id: TC-2
title: Coalescing
verifies: [C4, C5, C10]
---

`node:test` with a fake clock: ten changes with one key 100 ms apart form one step, a change 1500 ms
later a new one, a change with another key a new one. Browser test on `pages/designer.html`: typing a
word in an inspector field and pressing Cmd/Ctrl+Z restores the field's old value in one step; the
toolbar's Undo button is disabled on a fresh document.
