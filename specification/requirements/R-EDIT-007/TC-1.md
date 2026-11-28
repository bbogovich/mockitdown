---
id: TC-1
title: Undo restores document and selection
verifies: [C1, C2, C3, C6, C7, C8, C9]
---

`node:test` (`tests/unit/undo.test.ts`, IT-62): a seeded random sequence of 50 operations, commands
and code changes (insert, delete, setText, setCode, setOptions, moveMockup, move, with random
selections and active mockups between them) on a two-mockup session; undoing all restores the original
document text and selection, redoing all the final ones, each undo and redo notifying one `change`
whose edits turn the code before it into the code after it; undo of a delete selects the deleted node
again with its id, redo the delete's selection, and undo of another mockup's step makes it active;
options and moves undo as changes of their own kind with no edits; a new step after two undos makes
`canRedo` false; 250 steps keep at least the latest 200.
