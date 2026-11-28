---
id: R-TOOL-004.CR-7
target: R-TOOL-004
kind: correction
version: 0.13.10
date: 2026-11-28
issue: 31
summary: "as built (#31): Add inserts the sample's call of R-TOOL-006.C1 instead of <Name>() (C8)"
from: 8f9075965b8d
to: e532bb21162a
---

## Clauses

@ C8 edit
~ An Add button on each card, a double-click on the card or Enter on the focused card MUST insert [-`<Name>()`-]{+the element as R-TOOL-006.C1 writes it (its sample's call, else `<Name>()`)+} through `session.insert` (R-EDIT-006.C20): as the last child of the first selected node, else at the end of the mockup's top level, select the new node and dispatch `mockitdown-insert` (R-EDIT-006.C5).

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -17,4 +17,4 @@
 `mockitdown-mockup` (`device="fit"`, `pack="base"`) and the last none until it is scrolled to; Add on
-`Toggle` gives the hand-written code with `Toggle()` as the stack's last child, selected, and one
-`mockitdown-insert` from the designer. A second test adds `Text` by double-click and `Divider` by Enter
+`Toggle` gives the hand-written code with `Toggle("Label")` (the base pack's sample since #31, R-TOOL-006.C1) as the stack's last child, selected, and one
+`mockitdown-insert` from the designer. A second test adds `Text` (as `Text("Content")`) by double-click and `Divider` (as `Divider()`) by Enter
 with nothing selected, each on a new line at the end of the top level.
--- a/prose.md
+++ b/prose.md
@@ -17,4 +17,4 @@
 
-**As built (#29).** The inserted code is the bare call `<Name>()`; R-TOOL-006 gives it the sample's
-arguments. Inserting at the root uses the top-level `insert` of R-EDIT-002 (`parent: null`) through the
+**As built (#29).** The inserted code was the bare call `<Name>()`; since #31 it is the sample's call
+of R-TOOL-006.C1 (`Toggle("Label")` in the base pack), and a struct is still `<Name>()`. Inserting at the root uses the top-level `insert` of R-EDIT-002 (`parent: null`) through the
 session's `insert` command, so the gallery itself holds no editing rule (A-WEB-5.K2). Components are
```
