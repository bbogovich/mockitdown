---
id: R-CLI-001.CR-1
target: R-CLI-001
kind: clarification
version: 0.12.8
date: 2026-11-27
issue: 57
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#57)"
from: 0ec0d1efb95f
to: 46dc74352a42
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,13 @@
+---
+id: TC-1
+title: Commands, standard input and exit codes
+verifies: [C1, C2, C3]
+---
+
+Python unit tests `python/tests/test_cli.py` `CommandTests`, through `cli.main` with captured streams:
+`--version` prints `mockitdown <version>` and exits 0, `--help` names the five subcommands, an unknown
+subcommand exits 2; the installed console script beside the interpreter (skipped when the package is not
+installed) prints the version and exits 2 for `render` without a file (C1, V1). `render -` and `check -`
+read standard input (C2). A good file exits 0, a file with an error exits 1 for `render` and `check`, a
+missing file and an unknown pack for `elements` exit 1 with `mockitdown: <message>` on standard error,
+and a missing file argument, a non-integer `--width` and `check` without files exit 2 (C3, V1).
```
