---
id: TC-1
title: check summaries and the JSON report
verifies: [C1, C2, C3]
---

Python unit tests `python/tests/test_cli.py` `CheckCommandTests`: checking a good file, a file with an
unknown element and a file with an unknown icon prints the error line, `<file>: ok (0 errors, 0
warnings)`, `<file>: FAILED (1 errors, 0 warnings)` and `<file>: ok (0 errors, 1 warnings)` (the icon is
found while rendering) and exits 1; without the bad file it exits 0 (C1, C3, V1). `--json` prints a
parsable array with `file` and `ok` per file and each diagnostic as exactly `severity`, `code`,
`message`, `line`, `col` and `source`, and exits 1 (C2, C3, V1).
