---
id: R-EDIT-006.CR-8
target: R-EDIT-006
kind: revision
version: 0.13.9
date: 2026-11-28
issue: 30
summary: "as built (#30): session.insert takes an index (C20); session.move moves siblings as one change, ids kept and selected (C21)"
from: 7680c4f3d15a
to: 25af62cee292
---

## Clauses

@ C20 edit
~ `session.insert(code, [-parent)`-]{+parent, index)`+} MUST insert one view's code (R-EDIT-002.C4) [-as-]{+before statement child `index` of `parent` (default `end`,+} the last [-child of `parent`,-]{+child),+} a node id of the active mockup, by default of the first selected node, else [-at the end of-]{+in+} the mockup's top level (`parent` null), then make the inserted node the selection, notifying one `change`, one `insert` and one `select`, and MUST be refused, changing and notifying nothing, as `apply` refuses an insert.
@ C21 insert after C20
+ `session.move(nodes, parent, index)` MUST move sibling nodes of the active mockup (R-EDIT-002.C8, C32) as one change, the moved nodes keeping their ids and becoming the selection, and MUST be refused, changing and notifying nothing, as `apply` refuses a move.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: Session notifications
-verifies: [C1, C2, C3, C4, C5, C6, C9, C10, C12, C13, C14, C15, C16, C17, C18, C19, C20]
+verifies: [C1, C2, C3, C4, C5, C6, C9, C10, C12, C13, C14, C15, C16, C17, C18, C19, C20, C21]
 ---
@@ -16 +16,5 @@
 `move` with no edits; an unsubscribed listener hears nothing more; diagnostics follow `check` with the mockup's pack; `DESIGN_EVENTS` maps `select`, `change`, `insert`, `rename` and `diagnostics` to their event names. `delete` ("delete removes the selection as one change…") over a VStack holding a Text, an HStack of two Texts and a Text: deleting the HStack gives one `change` then one `select` of the last Text (the next sibling), deleting the last Text selects the HStack (the previous sibling), deleting both Texts of the HStack leaves its braces and selects it (the parent), deleting the only top-level node selects nothing, and a delete with nothing selected is refused and notifies nothing; the expected codes and selections were written by hand. `insert` ("insert adds a view as the last child of the selected node…", #29) over a VStack holding an HStack holding a Text: with the HStack selected `insert("Toggle()")` appends it as the HStack's last child and notifies `change`, `insert` (the new node, element `Toggle`) and `select` of it; with nothing selected `Text("b")` goes on a new line after the VStack; code that does not parse is refused and notifies nothing; the expected codes were written by hand.
+
+As built (#30): "drop positions, checks and drops …" in `typescript/tests/unit/design-session.test.ts` inserts at an
+index through `drop` (C20) and moves a node after its sibling with its id kept and selected, in one change (C21);
+the expected code is written by hand.
```
