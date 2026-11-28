---
id: R-LANG-008.CR-1
target: R-LANG-008
kind: clarification
version: 0.12.9
date: 2026-11-27
issue: 58
summary: "test cases backfilled: TC-1 verifies C1-C3 (#58)"
from: c4b3337f27d5
to: c6826c89dad2
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,11 @@
+---
+id: TC-1
+title: Collection and tuple literals
+verifies: [C1, C2, C3]
+---
+
+Python unit tests `python/tests/test_expressions.py` `CollectionLiteralTests`: an array of two tuples, a
+dictionary, entries across line feeds with a trailing comma, `[]`, `[:]` as an empty dictionary and nested
+literals (C1, V1); `[1, "a": 2]` and `["a": 2, 1]` raise "a collection literal mixes array and dictionary
+entries" (C2, V1); two or more expressions or any labelled ones form a tuple, across line feeds too,
+while `(1 + 2)` and `((1))` are the expression itself (C3).
```
