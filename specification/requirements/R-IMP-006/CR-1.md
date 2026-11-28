---
id: R-IMP-006.CR-1
target: R-IMP-006
kind: clarification
version: 0.12.8
date: 2026-11-27
issue: 57
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#57)"
from: c4546ffb959d
to: 7e250d318881
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,11 @@
+---
+id: TC-1
+title: Module imports load no file
+verifies: [C1, C2]
+---
+
+Python unit tests `python/tests/test_imports.py` `ModuleImportTests`, with `Charts.mockitdown`,
+`Kpi.mockitdown` and `Fluent.mockitdown` beside the block: `import Charts` neither loads the file nor
+warns; `import Kpi` warns `import Kpi names no known pack` (code `pack`) and does not load the file, so
+its struct is unknown; `import Fluent` selects the Fluent pack (C1, V1). `import "Kpi"` loads the file
+(C2).
```
