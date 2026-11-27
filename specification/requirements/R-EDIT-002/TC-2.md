---
id: TC-2
title: Refusals and ids
verifies: [C3, C8, C9, C14]
---

`node:test`: a node that is a modifier call or does not exist, a move into the moved node's own
descendant and an insert of code with two views or a syntax error are refused with a message and no
edits; after a move, the moved nodes keep their ids.
