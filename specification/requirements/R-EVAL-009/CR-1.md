---
id: R-EVAL-009.CR-1
target: R-EVAL-009
kind: clarification
version: 0.10.8
date: 2026-11-27
issue: 53
summary: "re-checked after the renderer split: unaffected (#53)"
from: 1cf7e4fd01d5
to: 9bca08846df3
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -4 +4,3 @@
 modifiers have no visual effect and are accepted so that real SwiftUI code can be pasted.
+
+**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.
```
