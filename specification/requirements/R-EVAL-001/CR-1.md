---
id: R-EVAL-001.CR-1
target: R-EVAL-001
kind: clarification
version: 0.12.9
date: 2026-11-27
issue: 58
summary: "test cases backfilled: TC-1 verifies C1-C3 (#58)"
from: 2f9acbb7704d
to: 360b9029e107
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,16 @@
+---
+id: TC-1
+title: Evaluation always completes
+verifies: [C1, C2, C3]
+---
+
+Python unit tests `python/tests/test_evaluate.py` `CompletionTests`: `evaluate` turns a module into a
+`Screen` with its views, the pack chosen by `import SwiftUI`, the `@Screen` metadata and the structs
+used, as data (C1). Sixteen sources with semantic problems (unknown elements, names, modifiers and
+directives, bad `ForEach`, out-of-range subscripts, missing arguments, recursion, bad operators) each
+yield a screen and diagnostics, never an exception (C1, C2). An unknown element renders as an `unknown`
+view holding its trailing closure's views and an unknown name as `nil` text, and a block with one
+unknown element and one unknown modifier keeps every other view with one error and one warning
+(C2, V1). Statements run in order (a `let` rebinds for what follows), an `if` branch's `let` shadows
+without leaking, a closure parameter shadows an outer name, and a struct's body does not see the
+block's names (C3).
```
