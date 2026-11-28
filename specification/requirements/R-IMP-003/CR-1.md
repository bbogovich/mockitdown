---
id: R-IMP-003.CR-1
target: R-IMP-003
kind: clarification
version: 0.12.8
date: 2026-11-27
issue: 57
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#57)"
from: 64e0c562d52e
to: d1216904ab4a
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,12 @@
+---
+id: TC-1
+title: Nested imports and cycles
+verifies: [C1, C2]
+---
+
+Python unit tests `python/tests/test_imports.py` `NestedImportTests`: `lib/a` importing `b` resolves it
+beside `a`; both files' structs are available, and for a struct both declare, `b`'s is taken first and
+`a`'s replaces it with the R-IMP-004.C1 warning (C1). Files `a` and `b` importing each other both load,
+with no diagnostic (C2, V1). A file imported by the block, by a nested import and again as
+`kpi.mockitdown` and `./kpi.mockitdown` is loaded once (its ignored-view warning appears once), and
+another mockup loads it again (C2).
```
