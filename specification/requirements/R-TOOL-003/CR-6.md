---
id: R-TOOL-003.CR-6
target: R-TOOL-003
kind: revision
version: 0.13.8
date: 2026-11-28
issue: 29
summary: "as built (#29): the gallery panel holds mockitdown-gallery (C16)"
from: 2fefcccb7f66
to: 261e8a549d46
---

## Clauses

@ C16 replace
- Until their components exist, the gallery and properties panels MUST hold placeholders, the properties panel naming the first selected element.
+ The gallery panel MUST hold a `mockitdown-gallery` (R-TOOL-004) that joins the designer's session and takes its `import-base`, and until the inspector exists the properties panel MUST hold a placeholder naming the first selected element.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -25,3 +25,4 @@
 
-Until the gallery (R-TOOL-004) and the inspector exist, their panels hold placeholders. Delete is the
+The gallery panel holds the gallery element (R-TOOL-004, #29); until the inspector exists, the properties
+panel holds a placeholder. Delete is the
 session's `delete` command (R-EDIT-006.C19), so the host hears one `mockitdown-change` and then one
```
