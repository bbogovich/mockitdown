---
id: ADR-15.CR-2
target: ADR-15
kind: clarification
version: 0.10.8
date: 2026-11-27
issue: 53
summary: "re-checked after the renderer split: unaffected (#53)"
from: 98c91312fe07
to: 86029e2ed0c4
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -7 +7,3 @@
 Checked at 0.10.1 after R-ANN-003.C6 (marks inside a dialog): the screen-level layer and its inline fallback are kept, only positioned within the dialog; D1, D2 and C1 stand.
+
+**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.
```
