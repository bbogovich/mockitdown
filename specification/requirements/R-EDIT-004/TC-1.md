---
id: TC-1
title: Edit-mode conformance cases
verifies: [C3, C4, C5, C6, C7, C8, C9, C11, C12, C13, C14]
---

`gen_conformance.py` renders the edit-mode cases (`edit-*` names, `edit: true`) with Python; both
suites compare their output with the expected HTML (R-REPO-004.C5). A Python unit test checks, for each
edit-mode case, that every element carrying `data-el` that a view node produced carries `data-mkd-node`,
that the derived ones carry `data-mkd-derived` naming a `ForEach`, `if` or struct call, and that marks
and tables carry neither.

As built (#23): the cases are `edit-nested-stacks`, `edit-list-cards`, `edit-modifier-chain`,
`edit-slots`, `edit-presentation`, `edit-foreach`, `edit-if-else`, `edit-struct` (C13: the content a call
passes is not derived), `edit-literal`, `edit-import` (C11, C12) and `edit-marks` (C8, with the Elements
table and the source). `python/tests/test_edit_mode.py` holds, for each, every `data-el` element in
document order with its two attributes, written by hand from the source before the renderer produced
them; it also checks the Python numbering (`mockitdown.syntax.nodes.view_nodes`) on a crafted source
and the preview of a declarations-only block (C14). `typescript/tests/unit/edit-mode.test.ts` checks
that the evaluator's ordinals equal `parseTree`'s for every corpus case, and a crafted render.
