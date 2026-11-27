---
id: R-DIAG-003.CR-2
target: R-DIAG-003
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "code argument also covers labelled arguments an element does not understand: C1 (ING-1)"
from: 139a96227d3b
to: 191c5bdb2ee7
---

## Clauses

@ C1 edit
~ Diagnostics MUST use these codes: `syntax` (lexing or parsing), `empty` (no views), `directive` (unknown directive), `pack` (pack selection or loading), `import` (component files), `unknown` (unknown element, view or name), `view` (an expression that is not a view), `foreach`, `recursion`, `argument` (struct [-arguments),-]{+arguments, and labelled arguments an element does not understand),+} `struct` (struct without body), `modifier` (unknown modifier, invalid class name), `value` (value evaluation), `role` (pack element with an unknown role), `icon`, `asset`, `device`, `appearance`, `chrome`, `chart` (a chart with no data) and `fence` (fence attributes).

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -2 +2,4 @@
 [Diagnostics](diagnostics.md) page lists each code with its severity and typical message.
+
+`argument` also covers a labelled argument that an element does not understand (R-EVAL-004.C9), a
+warning.
```
