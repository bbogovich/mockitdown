---
id: R-IMP-001.CR-1
target: R-IMP-001
kind: clarification
version: 0.12.8
date: 2026-11-27
issue: 57
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#57)"
from: f5fbe7bcb71c
to: 1827891d697a
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,12 @@
+---
+id: TC-1
+title: Component files
+verifies: [C1, C2, C3, C4]
+---
+
+Python unit tests `python/tests/test_imports.py` `FileImportTests`, with files beside the block's
+`source_path`: a struct declared in the block uses `KPI` from `import "kpi"` with no diagnostic (C1). A
+component file with `KPI` and two `Text` views makes `KPI` available, renders neither view and warns once
+`kpi.mockitdown: top-level views in an imported file are ignored` with code `import` at the first view's
+line in that file (C2, C3, V1); its `import Fluent` selects no pack (C2). Its `@Screen(device:,
+appearance:)` and an unknown `@Foo` change nothing and report nothing (C4).
```
