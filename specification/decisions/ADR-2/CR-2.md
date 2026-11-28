---
id: ADR-2.CR-2
target: ADR-2
kind: clarification
version: 0.12.11
date: 2026-11-27
issue: 81
summary: "re-checked against R-EVAL-011, R-LANG-003, R-LANG-004: unaffected (#81)"
from: 93d5d673d8de
to: 63696b3c5f0c
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -11 +11,4 @@
 Checked at 0.10.1: R-EVAL-011 and R-MDX-004 changed after this decision only by clarifications that dropped known-deviation notes (0.2.1); the decision stands.
+
+
+**Re-checked at specification 0.12.10.** Re-read against R-EVAL-011, R-LANG-003, R-LANG-004 (changed at 0.12.0, 0.12.9: SRC-19 import map (0.12.0), which changes how imports are found and nothing this item obliges; test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
```
