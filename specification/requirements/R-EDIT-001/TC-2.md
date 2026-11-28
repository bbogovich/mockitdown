---
id: TC-2
title: Ids survive edits
verifies: [C6, C9, C10, C15, C16]
---

`node:test` (`typescript/tests/unit/tree.test.ts`): parse a formatted source with comments, a `let`, a `ForEach` and an `if`; apply, with
`reparse`, an insertion before a node, a replacement inside a sibling's arguments and a removal of
another sibling; every node whose name was not in an edited range keeps its id, the inserted node has
a new id, and no id of a removed node reappears in later trees.

Also: replacing a node's name gives it a new id while its siblings keep theirs; an edit that breaks the
source returns `tree: null` with the syntax diagnostic, and the old tree still reparses; edits out of
order, overlapping or out of range throw a `RangeError`.
