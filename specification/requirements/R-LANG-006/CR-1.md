---
id: R-LANG-006.CR-1
target: R-LANG-006
kind: clarification
version: 0.2.1
date: 2026-11-24
summary: "As built: the implementation now matches the clauses; known-deviation note removed"
from: 3fb242113249
to: 35a1a1107812
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -2,5 +2 @@
 precedence ladder without assignment, casts or custom operators.
-
-**Known deviation.** On `main` (0.1.0) the lexer reads the `0` of `t.0` as a number token, so
-tuple element access does not parse (C8); the evaluator already supports it. Use `ForEach` closure
-parameters to destructure tuples until this is fixed.
```
