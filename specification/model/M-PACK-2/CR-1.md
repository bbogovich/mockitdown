---
id: M-PACK-2.CR-1
target: M-PACK-2
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "element rules and types overrides: F7, F8 (ING-1)"
from: c7fba55fc7e4
to: aec95cdafdd0
---

## Clauses

@ F7 insert after F6
+ rules: dict · optional — `{accepts}`, narrowing its role's rule for this element (R-PACK-016.C5)
@ F8 insert after F7
+ types: dict · optional — parameter name → type, adding to or overriding its role's `params` (R-PACK-017.C3)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,3 @@
 One element of a pack: how a framework component maps onto a render role.
+
+`rules` and `types` are read only by the design tools (R-PACK-016, R-PACK-017); rendering ignores them.
```
