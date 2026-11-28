---
id: ADR-3.CR-2
target: ADR-3
kind: clarification
version: 0.12.11
date: 2026-11-27
issue: 81
summary: "re-checked against R-MDX-001, R-MDX-004, R-MDX-005: unaffected (#81)"
from: 2d8d5462f4a3
to: d789d605f518
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -10 +10,4 @@
 Checked at 0.10.1: R-MDX-004 changed after this decision only by a clarification that dropped a known-deviation note (0.2.1); the decision stands.
+
+
+**Re-checked at specification 0.12.10.** Re-read against R-MDX-001, R-MDX-004, R-MDX-005 (changed at 0.12.10: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
```
