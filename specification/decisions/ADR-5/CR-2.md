---
id: ADR-5.CR-2
target: ADR-5
kind: clarification
version: 0.12.11
date: 2026-11-27
issue: 81
summary: "re-checked against R-MDX-006, R-REND-006, R-REND-007: unaffected (#81)"
from: a04c27658f6f
to: 1910822cd0a2
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -10 +10,4 @@
 **Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.
+
+
+**Re-checked at specification 0.12.10.** Re-read against R-MDX-006, R-REND-006, R-REND-007 (changed at 0.12.10: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
```
