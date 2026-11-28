---
id: R-DIAG-004.CR-1
target: R-DIAG-004
kind: clarification
version: 0.12.8
date: 2026-11-27
issue: 57
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#57)"
from: eda87db86b0c
to: fbacc57e7692
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
+title: The error box
+verifies: [C1, C2, C3, C4]
+---
+
+Python unit tests `python/tests/test_diagnostics.py` `ErrorBoxTests`: a block with one unknown element
+and one unknown modifier starts with `div.mkd-error[role=alert]`, its `div.mkd-error__title` reading
+`mockitdown: 1 error` and one escaped list item, before the figure (C1, C2, C3, V1); with `show_warnings`
+the same title and two items, and a block with only a warning is titled `mockitdown: warnings` (C2, C3,
+V1); two unknown elements give `mockitdown: 2 errors` (C2). A clean block, and a block with only warnings
+when they are not shown, starts with the figure and has no box (C4).
```
