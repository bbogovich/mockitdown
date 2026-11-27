---
id: F-2.CR-1
target: F-2
kind: additive
version: 0.9.0
date: 2026-11-26
summary: "dotted element names: C7, AC4 (ING-1)"
from: 5a32f9e2a2c1
to: cd6548c29744
---

## Clauses

@ meta.source
- [SRC-2, SRC-3]
+ [SRC-2, SRC-3, SRC-12]
@ C7 insert after AC3
+ Element names may be dotted, as SwiftUI and component libraries write nested types (`Badge.Ribbon`); such a call names one element.
@ AC4 insert after C7
+ `Badge.Ribbon("New")` renders the same element as the pack's joined name `BadgeRibbon("New")` in both variants.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -7 +7,4 @@
 Fluent, Material or SAPUI5 screen — only the element names change.
+
+**Dotted element names (SRC-12#s13).** Component libraries name sub-components with a dot
+(`Badge.Ribbon`, `Card.Meta`); packs had to join them (`BadgeRibbon`). Both spellings now work.
```
