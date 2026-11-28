---
id: R-PACK-009.CR-3
target: R-PACK-009
kind: correction
version: 0.12.10
date: 2026-11-27
issue: 59
summary: "as built: V1 base lists 134 elements, the 90 core ones and the 44 other requirements add; TC-1 verifies C1-C3 (#59)"
from: e8cb549762e6
to: e104bcc2cd72
---

## Clauses

@ V1 replace
- `mockitdown elements base` lists exactly the 90 core elements.
+ `mockitdown elements base` lists the 90 core elements of C1 and the 44 that R-REND-011.C1, R-ANN-001.C5, R-ANN-002 and R-REND-012.C1 add to `base`, 134 in all.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,12 @@
+---
+id: TC-1
+title: The core vocabulary of base
+verifies: [C1, C2, C3]
+---
+
+Python unit tests `python/tests/test_pack_registry.py` `CoreVocabularyTests`: the 90 core elements of C1 by family, plus the elements other
+requirements add to `base`, are exactly `base`'s own elements (134), every pack inherits all 90, and
+`mockitdown elements base` lists exactly those (C1, V1); `base`'s modifiers are exactly the mappings of C2, and
+`.buttonStyle(.bordered)`, `.controlSize(.large)` and `.buttonBorderShape(.capsule)` render `data-variant`,
+`data-size` and `data-shape` (C2); `base` declares `Wireframe` and `Mockitdown`, defaults to `desktop` and has chrome
+`none` on every form, and `import Wireframe` renders a desktop figure without chrome (C3).
```
