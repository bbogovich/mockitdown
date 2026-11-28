---
id: TC-1
title: Session notifications
verifies: [C1, C2, C3, C4, C5, C6, C9, C10, C12, C13, C14, C15, C16, C17, C18, C19, C20]
---

`node:test` (`typescript/tests/unit/design-session.test.ts`): a session over a two-mockup document; `apply`
of an insert and of a remove each notify one `change` with `kind: "code"` and edits that, applied in turn
to the original code, give the current code, the insert followed by one `insert` naming the new node and
its element; a move notifies one `change` for several edits; the selection keeps a surviving node and
drops a removed one; a refused operation notifies nothing; a syntax error in the code keeps the last valid
tree and notifies `diagnostics`, an operation is then refused, and fixed code keeps the untouched ids;
`nodeFor` maps each ordinal of an edit-mode render of the mockup to a node of its tree; selecting two
non-siblings or an unknown id is refused and the same selection notifies nothing; `setActive` and
`hover` notify their kinds and clear the selection; `setOptions` and `moveMockup` notify `options` and
`move` with no edits; an unsubscribed listener hears nothing more; diagnostics follow `check` with the mockup's pack; `DESIGN_EVENTS` maps `select`, `change`, `insert`, `rename` and `diagnostics` to their event names. `delete` ("delete removes the selection as one change…") over a VStack holding a Text, an HStack of two Texts and a Text: deleting the HStack gives one `change` then one `select` of the last Text (the next sibling), deleting the last Text selects the HStack (the previous sibling), deleting both Texts of the HStack leaves its braces and selects it (the parent), deleting the only top-level node selects nothing, and a delete with nothing selected is refused and notifies nothing; the expected codes and selections were written by hand. `insert` ("insert adds a view as the last child of the selected node…", #29) over a VStack holding an HStack holding a Text: with the HStack selected `insert("Toggle()")` appends it as the HStack's last child and notifies `change`, `insert` (the new node, element `Toggle`) and `select` of it; with nothing selected `Text("b")` goes on a new line after the VStack; code that does not parse is refused and notifies nothing; the expected codes were written by hand.
