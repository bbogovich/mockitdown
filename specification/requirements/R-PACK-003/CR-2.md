---
id: R-PACK-003.CR-2
target: R-PACK-003
kind: correction
version: 0.12.10
date: 2026-11-27
issue: 59
summary: "as built: C3 merges attrs too; TC-1 verifies C1-C7 (#59)"
from: a1345accc671
to: 6a58c8608b1a
---

## Clauses

@ C3 edit
~ The pack registry MUST merge `elements`, `modifiers`, `chrome`, [-`sizes`-]{+`sizes`, `icons`+} and [-`icons`-]{+`attrs`+} over the parent's, the child's entries replacing the parent's entries of the same name.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,13 @@
+---
+id: TC-1
+title: Inheritance, merging, fonts and lineage
+verifies: [C1, C2, C3, C4, C5, C6, C7]
+---
+
+Python unit tests `python/tests/test_pack_registry.py` `InheritanceTests`: `base` has no parent, a pack without `extends` extends `base`, and every
+pack's lineage starts at `base` (C1); a pack extending itself raises "a pack cannot extend itself" (C2); a pack
+extending `fluent` that redefines `Button`, adds an element and overrides one modifier, chrome form, size, icon and
+argument map keeps every other Fluent entry (C3, V1); one light token is replaced and the dark tokens are Fluent's (C4,
+V1); a font alias resolves from the nearest pack, then its ancestors, and an unmapped name to itself (C5);
+`own_elements` holds only the pack's own definitions (C6); the lineage is base, fluent, the pack, and its stylesheet
+holds base, then Fluent, then its own CSS before its own token rules (C7, V1).
```
