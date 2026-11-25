---
id: R-WEB-002.CR-2
target: R-WEB-002
kind: editorial
version: 0.6.7
date: 2026-11-25
issue: 7
summary: "reviewed against ADR-19 as clarified (#7); prose: elements created on demand by the pack gallery (R-WEB-004)"
from: eea2354c57af
to: bbb4be950d40
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -31 +31,5 @@
 started; it is the hook tests and editors use after setting an attribute or `code`.
+
+Pages that show many mockups can create them on demand: the pack gallery (R-WEB-004) sets `code` on
+a new element before inserting it, so each one renders once, and waits on `rendered` to know when a
+whole pack is done.
```
