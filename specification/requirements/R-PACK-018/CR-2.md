---
id: R-PACK-018.CR-2
target: R-PACK-018
kind: clarification
version: 0.12.4
date: 2026-11-27
issue: 54
summary: prose names the as-built C6 and C8 details; re-checked against ADR-17 (#54)
from: eb3da6a7f3cb
to: 06ba8496c1ad
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -22 +22,3 @@
 **Verification.** TC-1 (resolution in both builds), TC-2 (the duplicate check), TC-3 (rendering unchanged).
+
+**As built (#54).** The build also fails on an include that shares its line with other text (C6), and only an `@import` outside a comment is refused at run time (C8). Re-checked against ADR-17 as re-checked in the same release: no obligation changed.
```
