---
id: TC-2
title: Sections
verifies: [C1, C2, C3, C7, C8, C9, C10]
---

Browser test (`sections.spec.mjs`, IT-72): the sections layer comes first in the world, behind the
frames; `newSection("Onboarding")` encloses the active frame with 40 units of margin, its label at the
top-left, and undoes in one step; dragging the label moves the section, snapped to the grid and freely
with Alt, and the frame wholly inside it, but not the ones partly outside; dragging a corner resizes it
on both axes; a double-click renames it, an empty name refused beside the field; each undoes in one
step with Cmd/Ctrl+Z. Unit part (`sections.test.ts`): `sectionAround`, `framesInside` with edges
included, `snapSectionMove`, `resizeSectionBox` with the minimum size, `documentView`; the session's
`newSection` (creating `sections`, its undo removing the key), `moveSection` carrying the frames wholly
inside and undoing to the written text with an unknown section key kept, `resizeSection`,
`renameSection`, the refusals changing nothing and the `change` of kind `sections`. Every expected value
is written by hand before the code runs.
