---
id: TC-2
title: Duplicate identifier refused
verifies: [C9, C14, C16, C17, C19]
---

`node:test`: with `.id("save")` on one button, `rename` of another button to `save` is refused with a
message naming the identifier, and returns no edits.

As built (#22): `typescript/tests/unit/edit-set.test.ts`. Also: a node's own identifier and an unused
one are accepted, and an identifier with quotes and a backslash is written as a string literal that
the duplicate check reads back; argument, modifier, identifier, reference and comment edits keep every
node id, `setName` gives the renamed node a new one; nodes are named by id; a value that does not parse
is refused with one syntax diagnostic on line 1 whose column lies within the value, modifier arguments
that are not an argument list and a value of two arguments are refused; `rename` to `null`, `setRefs`
with `[]` and `setComment` with `null` on a node without the modifier or comment, a modifier index
past the next occurrence and a negative position are refused; an index equal to the number of
occurrences adds a modifier.
