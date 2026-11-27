---
id: R-LANG-007.CR-1
target: R-LANG-007
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "dotted callees parse as calls (F-2.C7): C8, TC-2 (ING-1)"
from: 77ed00c0d287
to: ba3547bf7f0f
---

## Clauses

@ meta.source
- [SRC-2]
+ [SRC-2, SRC-12]
@ C8 insert after V1
+ The parser MUST parse a member access whose name begins with an uppercase letter, followed on the same line by an argument list or a trailing closure (`Badge.Ribbon("New")`, `Card.Meta { … }`), as a call whose callee is that member access.

## Files

```diff
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,8 @@
+---
+id: TC-2
+title: Dotted callees
+verifies: [C8]
+---
+
+Parser unit tests in both suites: `Badge.Ribbon("New")` and `Card.Meta { Text("x") }` parse as calls with a
+member-access callee; `Text("a").font(.title)` still parses as a modifier chain.
--- a/prose.md
+++ b/prose.md
@@ -3 +3,4 @@
 same line is what makes newline-separated statements unambiguous — the same rule Swift applies.
+
+A dotted element name such as `Badge.Ribbon("New")` parses as one call with a dotted callee (C8); the
+evaluator resolves it (R-EVAL-003.C9).
```
