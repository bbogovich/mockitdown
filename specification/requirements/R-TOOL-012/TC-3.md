---
id: TC-3
title: Naming, placing and snapping rules
verifies: [C2, C4, C5, C8, C10, C11, C12]
---

`node:test` (`frames.test.ts`, IT-70) with hand-computed values: `newMockupName` (none, a gap, a
lowercase name that does not count, the next number), `isDefaultName`, `renameRefusal` (taken, case
different, its own, empty), `snapMove` (grid, Alt, an edge within 6 px at 100 % but not at 200 %, a left
edge), `newMockupPlace` (the rightmost frame overlapping the active one vertically, a frame below and
one ending where the active one starts not counting, no active frame). The session: `renameMockup`
refusals notify nothing and leave no step, a rename notifies `rename`, the active mockup and
`view.active` follow, undo and redo notify `rename` back and forth; steps before a rename still undo
on the renamed mockup; a move is one step of kind `move`; `newMockup` places by `measure`, becomes
active, notifies `change` of kind `mockups` and undoes and redoes, and without `measure` places by the
options' sizes.
