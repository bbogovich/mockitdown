---
id: ADR-4.CR-3
target: ADR-4
kind: clarification
version: 0.12.11
date: 2026-11-27
issue: 81
summary: "re-checked against R-PACK-001, R-PACK-002, R-PACK-003, R-REND-002: unaffected (#81)"
from: c06adc61ab6b
to: 1e38812db0d5
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -12 +12,4 @@
 **Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.
+
+
+**Re-checked at specification 0.12.10.** Re-read against R-PACK-001, R-PACK-002, R-PACK-003, R-REND-002 (changed at 0.12.10: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
```
