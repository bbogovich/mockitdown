---
id: TC-1
title: The edit corpus
verifies: [C1, C2, C4, C5, C6, C7, C8, C10, C11, C12, C13, C15, C16, C17, C18, C19, C20, C21, C22, C23, C24, C25, C26, C27, C28, C29, C30, C31, C32]
---

`node:test` (`typescript/tests/unit/edit-corpus.test.ts`) over `shared/conformance/edit/index.json`:
for each case, `edit(source, op)` yields exactly `<name>.expected.mockitdown` (or the message of
`<name>.error.txt`), applying `edits` to the source yields the same text, and the edited source renders
with no diagnostic the original lacked. A meta-test fails when the corpus lacks one of the situations
of C16 (each case's `op.json` carries a `covers` list).

As built (#21): 61 cases (`insert-*`, `remove-*`, `move-*`, `refuse-*`), each source opening with a `//`
line saying what it exercises. The meta-test requires the `covers` tags `insert:`, `remove:` and
`move:` `first`/`middle`/`last`, `insert:empty`, `insert:no-closure`, `remove:all`, `move:empty`,
`move:no-closure`, `insert:top-level` (#29: `insert-top-level`, after the last statement and before a struct declared below it, and `insert-top-level-empty`, a source holding only a comment), `source:comments`, `blank-lines`, `let`, `foreach`, `if`, `struct`, `indent:unit`,
`tabs`, `relative`, and one `refuse:` tag per refusal (C3, C9, C14, C20 to C24); a refused case carries
a `refuse:` tag and only a refused case does. It also fails on a file in `edit/` that belongs to no case.

As built (#30): `move-top-level` (hand-written, tag `move:top-level`) moves a button out of its `VStack`
to the top level before the view after the stack (C32).
