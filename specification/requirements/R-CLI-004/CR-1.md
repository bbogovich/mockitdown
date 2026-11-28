---
id: R-CLI-004.CR-1
target: R-CLI-004
kind: clarification
version: 0.12.8
date: 2026-11-27
issue: 57
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#57)"
from: d2bf74a8594c
to: f4773ee28c53
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
+title: check summaries and the JSON report
+verifies: [C1, C2, C3]
+---
+
+Python unit tests `python/tests/test_cli.py` `CheckCommandTests`: checking a good file, a file with an
+unknown element and a file with an unknown icon prints the error line, `<file>: ok (0 errors, 0
+warnings)`, `<file>: FAILED (1 errors, 0 warnings)` and `<file>: ok (0 errors, 1 warnings)` (the icon is
+found while rendering) and exits 1; without the bad file it exits 0 (C1, C3, V1). `--json` prints a
+parsable array with `file` and `ok` per file and each diagnostic as exactly `severity`, `code`,
+`message`, `line`, `col` and `source`, and exits 1 (C2, C3, V1).
```
