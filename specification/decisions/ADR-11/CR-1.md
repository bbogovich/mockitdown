---
id: ADR-11.CR-1
target: ADR-11
kind: clarification
version: 0.12.11
date: 2026-11-27
issue: 81
summary: "re-checked against R-ASSET-005: unaffected (#81)"
from: 64684ac0f7d1
to: 1a1b8d462db8
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -5 +5,4 @@
 **Consequences.** The alias table grows with use; packs can remap names through their `icons` key.
+
+
+**Re-checked at specification 0.12.10.** Re-read against R-ASSET-005 (changed at 0.12.7: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
```
