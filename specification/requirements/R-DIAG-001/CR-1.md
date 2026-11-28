---
id: R-DIAG-001.CR-1
target: R-DIAG-001
kind: clarification
version: 0.12.8
date: 2026-11-27
issue: 57
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#57)"
from: 1bcdb2634e6c
to: 1d603f86538d
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,14 @@
+---
+id: TC-1
+title: Diagnostic content and printed form
+verifies: [C1, C2, C3]
+---
+
+Python unit tests `python/tests/test_diagnostics.py` `ContentTests`: severities are exactly `error` and
+`warning`; a default location is line and column 0 with no file; an unknown element reports severity,
+message, code `unknown` and its line and column; a component file's ignored view carries the file's
+resolved name and its line (C1). `str()` gives `error [unknown] at line 3:5: m`, `warning [icon] at
+a.mockitdown:2:9: m`, the file name alone or `?` without a line, and no code part when the code is empty;
+rendered unknown icons and elements print in that form (C2, V1). An unknown element and a syntax error
+are errors; an unknown modifier, an unknown icon, an unknown directive and a missing image are warnings
+(C3).
```
