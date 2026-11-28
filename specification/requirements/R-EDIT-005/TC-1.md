---
id: TC-1
title: Round trip and key order
verifies: [C1, C5, C6, C7, C10, C15]
---

`node:test` (`typescript/tests/unit/design.test.ts`), importing `mockitdown/design` in Node through the
package's own subpath export: the hand-written fixture documents of `typescript/tests/fixtures/design/`
(`mail.mkdesign` with sections, view, imports and unknown keys at every level, `minimal.mkdesign`,
`unicode.mkdesign` with index-like unknown keys) read and write back to the same text; a document whose
keys are out of order is written with the known keys in M-EDIT-1 and M-EDIT-2 order and the others after
them in read order; a document built with `newDesign` and written equals `minimal.mkdesign`; a code string
with tabs, CRLF and trailing spaces is kept verbatim. `dist/design.js` reaches only relative modules, none
of them a custom-element module, and reads, writes and edits a document with every browser and network
global made to throw.
