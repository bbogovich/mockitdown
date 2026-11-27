---
id: TC-1
title: Undo restores document and selection
verifies: [C1, C2, C3, C6, C7, C8, C9]
---

`node:test`: a random sequence of 50 operations on a session; undoing all restores the original
document and selection, redoing all the final ones, each undo and redo notifying one `change`; a new
operation after two undos makes `canRedo` false; 250 steps keep at least the latest 200.
