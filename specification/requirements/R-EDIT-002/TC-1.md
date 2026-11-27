---
id: TC-1
title: The edit corpus
verifies: [C1, C2, C4, C5, C6, C7, C8, C10, C11, C12, C13, C15, C16, C17, C18]
---

`node:test` (`typescript/tests/unit/edit-corpus.test.ts`) over `shared/conformance/edit/index.json`:
for each case, `edit(source, op)` yields exactly `<name>.expected.mockitdown` (or the message of
`<name>.error.txt`), applying `edits` to the source yields the same text, and the edited source renders
with no diagnostic the original lacked. A meta-test fails when the corpus lacks one of the situations
of C16 (each case's `op.json` carries a `covers` list).
