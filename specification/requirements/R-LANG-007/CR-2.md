---
id: R-LANG-007.CR-2
target: R-LANG-007
kind: correction
version: 0.13.24
date: 2026-11-28
issue: 45
summary: "as built (#45): the parser already parsed dotted callees (C8); TC-2 names the tests"
from: ba3547bf7f0f
to: a4f5c08d47b1
---

## Clauses

(none)

## Files

```diff
--- a/TC-2.md
+++ b/TC-2.md
@@ -8 +8,4 @@
 member-access callee; `Text("a").font(.title)` still parses as a modifier chain.
+
+Automated by `python/tests/test_syntax.py::DottedCalleeTests` and the parser tests of
+`typescript/tests/unit/dotted-names.test.ts`.
```
