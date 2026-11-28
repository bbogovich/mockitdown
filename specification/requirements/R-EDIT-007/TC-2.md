---
id: TC-2
title: Coalescing
verifies: [C4, C10, C11, C12, C13]
---

`node:test` with a fake clock (`tests/unit/undo.test.ts`, IT-62): ten changes with one key 100 ms apart
and an eleventh 950 ms after the tenth form one step, a change 1500 ms later a new one, a change with
another key a new one, changes without a key one step each; the same key after an undo and a redo a new
step; a burst that comes back to its start leaves no step; `setText` with a key coalesces. Browser test
on `pages/designer.html` (`tests/browser/undo.spec.mjs`): the toolbar's Undo and Redo are disabled on a
fresh document; after deleting the button, Cmd/Ctrl+Z restores the sample document and the button's
selection in one change, Shift+Cmd/Ctrl+Z and Ctrl+Y redo, the toolbar's buttons do the same, the keys
do nothing in the gallery's search field, and a newly opened document has nothing to undo. Typing a
word in an inspector field and undoing it in one step (C5) is tested with the inspector (R-TOOL-007).
