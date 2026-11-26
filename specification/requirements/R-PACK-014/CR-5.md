---
id: R-PACK-014.CR-5
target: R-PACK-014
kind: revision
version: 0.8.13
date: 2026-11-25
issue: 15
summary: "as built: a selected Table row is accent with white text also on a striped desktop row (C14, #15)"
from: 9eef0103a527
to: 7751690676b2
---

## Clauses

@ C14 insert after C13
+ A `Table` row marked `.selected()` MUST be drawn with the accent background and white text on every form, also where it falls on an alternating (striped) row of a `desktop` or `wide` form.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -12 +12,3 @@
 macOS columns form shows as the row's label.
+
+A selected table row wins over the Mac's alternating row stripes: the gallery's Mac example (#15) selects the second, striped row, which used to keep its stripe under white text.
```
