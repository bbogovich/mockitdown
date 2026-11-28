---
id: R-CLI-005.CR-1
target: R-CLI-005
kind: clarification
version: 0.12.8
date: 2026-11-27
issue: 57
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#57)"
from: cbb41a333d67
to: 25e9fa5516eb
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
+title: The stylesheet command
+verifies: [C1, C2, C3]
+---
+
+Python unit tests `python/tests/test_cli.py` `CssCommandTests`: `css --pack fluent` holds the Fluent and
+base rules and no MUI rule, a second `--pack mui` adds MUI, `css` alone holds every registered pack, and
+`-P` adds a site pack's rules (C1, V1). The default output is shorter than `--pretty`'s and keeps no
+comment (C2). `-o docs/assets/mockitdown.css` in an empty directory creates `docs/assets/` and writes the
+file, with nothing on standard output (C3, V1).
```
