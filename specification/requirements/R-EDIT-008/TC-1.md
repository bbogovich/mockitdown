---
id: TC-1
title: Commands and undo
verifies: [C1, C2, C3, C4, C5, C6, C7, C10, C11, C12, C13]
---

`node:test` (`typescript/tests/unit/commands.test.ts`, IT-64) on a hand-written mockup
(`VStack { Text("Title"); Button("A").id("ok"); // the row; HStack { Text("Left").id("left") } }`),
every expected code written by hand: a duplicate of the button gives `.id("ok-2")` directly after it,
selected, and a second duplicate of the original `.id("ok-3")`; duplicating the title and the stack
copies each after itself with the nested `left` becoming `left-2`; `copy` gives the stack with its
comment at column 0; a cut of the button selects the stack, and its text pasted into the stack goes in
as the last child with `ok` kept, after the title (a leaf) as `ok-2`, with nothing selected at the end
of the top level as `ok-3`; several pasted views go after the last of several selected nodes; a paste
of invalid text (`Button("A"`), of a `let`, of nothing and of a struct is refused with no step and no
notification; moveUp at the first position and moveDown at the last record no step, moveDown and
moveUp of the title and moveUp of two siblings move them as one step each; `selectRange` and
`toggleSelected` as C8 says; duplicate, the moves and cut with nothing selected, and duplicate and the
moves of an argument view (`Section(header: Text("H"))`), are refused with no step; every command undoes and redoes with the code and the selection restored
(the AC9 check of F-19).
