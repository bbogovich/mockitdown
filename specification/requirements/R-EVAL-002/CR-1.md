---
id: R-EVAL-002.CR-1
target: R-EVAL-002
kind: revision
version: 0.12.9
date: 2026-11-27
issue: 58
summary: "as built: C4 the implicit preview instance shows a required property's name as placeholder; TC-1 verifies C1-C4 (#58)"
from: 49e7e8f7ea18
to: 1c90e6fe0f5a
---

## Clauses

@ C4 insert after C3
+ When the evaluator renders that implicit instance (C2), a property with no default and no argument MUST take its own name as placeholder text (a view property: no views), with no diagnostic; structs that instance uses get no placeholders.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,13 @@
+---
+id: TC-1
+title: What a block renders
+verifies: [C1, C2, C3, C4]
+---
+
+Python unit tests `python/tests/test_evaluate.py` `BlockContentTests`: top-level statements and those of
+`#Preview` and `#Preview("Named")` blocks render in source order, and declared structs are not rendered
+when there are statements (C1). A block of declarations only renders its last struct, called without
+arguments, without diagnostics; its property `title` without a default shows as `title`, `count = 3`
+as `3`, while an explicit `Card()` still reports the missing argument (C2, C4, V1). An empty block, a
+comment, a lone `let`, a false `if` and a lone import each produce exactly the warning "the mockup has no
+views" with code `empty` (C3, V1).
--- a/prose.md
+++ b/prose.md
@@ -1,2 +1,3 @@
 A block that only declares a view renders it, as Xcode's preview canvas would; this lets authors
-paste a view struct without writing an extra call.
+paste a view struct without writing an extra call. Its required properties show their own names
+(`title`), so the preview reads like a template rather than failing.
```
