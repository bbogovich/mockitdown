---
id: TC-2
title: Refusals and ids
verifies: [C1, C3, C8, C9, C11, C14, C22, C23, C24]
---

`node:test` (`typescript/tests/unit/edit.test.ts`): a node that is a modifier call or does not exist, a move into the moved node's own
descendant and an insert of code with two views or a syntax error are refused with a message and no
edits; after a move, the moved nodes keep their ids.
Nodes are named by id, by `n6` and by 6 with the same result; an edit of a tree continues its ids,
and inserted nodes get new ones; `indentUnit` gives two or three spaces, a tab, or four spaces for a
source without indentation; an index past the children or negative, and a parent with only labelled
closures, are refused.
