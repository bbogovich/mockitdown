---
id: R-EDIT-006.CR-7
target: R-EDIT-006
kind: revision
version: 0.13.8
date: 2026-11-28
issue: 29
summary: "as built (#29): session.insert(code, parent) inserts as the last child of the selection, else at the top level, and selects the new node (C20)"
from: 20ad3e29e5b2
to: 7680c4f3d15a
---

## Clauses

@ C20 insert after C19
+ `session.insert(code, parent)` MUST insert one view's code (R-EDIT-002.C4) as the last child of `parent`, a node id of the active mockup, by default of the first selected node, else at the end of the mockup's top level (`parent` null), then make the inserted node the selection, notifying one `change`, one `insert` and one `select`, and MUST be refused, changing and notifying nothing, as `apply` refuses an insert.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: Session notifications
-verifies: [C1, C2, C3, C4, C5, C6, C9, C10, C12, C13, C14, C15, C16, C17, C18, C19]
+verifies: [C1, C2, C3, C4, C5, C6, C9, C10, C12, C13, C14, C15, C16, C17, C18, C19, C20]
 ---
@@ -15,2 +15,2 @@
 `hover` notify their kinds and clear the selection; `setOptions` and `moveMockup` notify `options` and
-`move` with no edits; an unsubscribed listener hears nothing more; diagnostics follow `check` with the mockup's pack; `DESIGN_EVENTS` maps `select`, `change`, `insert`, `rename` and `diagnostics` to their event names. `delete` ("delete removes the selection as one change…") over a VStack holding a Text, an HStack of two Texts and a Text: deleting the HStack gives one `change` then one `select` of the last Text (the next sibling), deleting the last Text selects the HStack (the previous sibling), deleting both Texts of the HStack leaves its braces and selects it (the parent), deleting the only top-level node selects nothing, and a delete with nothing selected is refused and notifies nothing; the expected codes and selections were written by hand.
+`move` with no edits; an unsubscribed listener hears nothing more; diagnostics follow `check` with the mockup's pack; `DESIGN_EVENTS` maps `select`, `change`, `insert`, `rename` and `diagnostics` to their event names. `delete` ("delete removes the selection as one change…") over a VStack holding a Text, an HStack of two Texts and a Text: deleting the HStack gives one `change` then one `select` of the last Text (the next sibling), deleting the last Text selects the HStack (the previous sibling), deleting both Texts of the HStack leaves its braces and selects it (the parent), deleting the only top-level node selects nothing, and a delete with nothing selected is refused and notifies nothing; the expected codes and selections were written by hand. `insert` ("insert adds a view as the last child of the selected node…", #29) over a VStack holding an HStack holding a Text: with the HStack selected `insert("Toggle()")` appends it as the HStack's last child and notifies `change`, `insert` (the new node, element `Toggle`) and `select` of it; with nothing selected `Text("b")` goes on a new line after the VStack; code that does not parse is refused and notifies nothing; the expected codes were written by hand.
```
