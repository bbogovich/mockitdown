---
id: A-PACK-2.CR-1
target: A-PACK-2
kind: revision
version: 0.11.0
date: 2026-11-27
summary: "SRC-18: provides every shipped pack, not the first eight; pack.css copies resolved from partials"
from: 0179b395b9be
to: ea4a154de6c9
---

## Clauses

@ P1 replace
- provides: the directories `base`, `swiftui`, `fluent`, `mui`, `angular-material`, `sapui5`, `bootstrap` and `shadcn`, each with `pack.json` and `pack.css` (`mockitdown/packs/<id>/`)
+ provides: one directory per shipped pack (R-PACK-008, R-PACK-019 to R-PACK-029), each with `pack.json` and `pack.css` (`mockitdown/packs/<id>/`), the `pack.css` copies resolved from the stylesheet partials they include (R-PACK-018)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,3 @@
 The framework knowledge of mockitdown, as data. Realizes R-PACK-008 and R-PACK-009.
+
+**At 0.11.0 (SRC-18#answers, question 1).** P1 no longer lists the first eight packs only: it provides every shipped pack.
```
