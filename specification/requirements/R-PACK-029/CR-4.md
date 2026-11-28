---
id: R-PACK-029.CR-4
target: R-PACK-029
kind: clarification
version: 0.12.11
date: 2026-11-27
issue: 81
summary: "re-checked against R-PACK-008: unaffected (#81)"
from: 2945e83ca484
to: 355802776a96
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -6 +6,4 @@
 Re-checked after R-PACK-018 was recorded as built (#54: an include sharing its line fails the build, only an `@import` outside comments is refused at run time; #55: TC-2 and TC-3 as built, the four partials named): no obligation of this requirement changed.
+
+
+**Re-checked at specification 0.12.10.** Re-read against R-PACK-008 (changed at 0.12.10: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
```
