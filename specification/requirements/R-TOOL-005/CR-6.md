---
id: R-TOOL-005.CR-6
target: R-TOOL-005
kind: correction
version: 0.13.10
date: 2026-11-28
issue: 31
summary: "as built (#31): a dropped card is inserted as the sample's call of R-TOOL-006.C1 instead of <Name>() (C5)"
from: fadec81c97a2
to: 2fcfca24fb3e
---

## Clauses

@ C5 edit
~ Dropping a gallery card MUST insert [-`<Name>()`-]{+the element as R-TOOL-006.C1 writes it (its sample's call, else `<Name>()`)+} at the indicated position (R-EDIT-002.C4) and select it; dropping outline rows MUST move their nodes there (R-EDIT-002.C8), keeping their node ids and selecting them.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -16,3 +16,3 @@
 `drop-bar` is horizontal (`data-orientation`), wider than tall and between the two texts, with the
-`grabbing` cursor; the drop gives the hand-written code with `Text()` second, selected, after exactly
+`grabbing` cursor; the drop gives the hand-written code with `Text("Content")` (the base pack's sample, R-TOOL-006.C1; `Text()` before #31) second, selected, after exactly
 one code `change`. Over the gap between the buttons the bar is vertical; Esc removes the ghost, the
```
