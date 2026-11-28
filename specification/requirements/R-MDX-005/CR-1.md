---
id: R-MDX-005.CR-1
target: R-MDX-005
kind: correction
version: 0.12.10
date: 2026-11-27
issue: 59
summary: "as built: C1 the block label is quoted ('Inbox'); TC-1 verifies C1-C4 (#59)"
from: acd59bff39db
to: 092fafca61cf
---

## Clauses

@ C1 edit
~ The fence MUST log every diagnostic of a block to the logger `mkdocs.extensions.mockitdown` — errors at ERROR level, warnings at WARNING level — as "mockitdown block <label>: <diagnostic>", where the label is the block's title or its first non-empty line cut to 48 [-characters.-]{+characters, quoted as a Python string literal (`'Inbox'`).+}

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,12 @@
+---
+id: TC-1
+title: Build log, strict mode and shown warnings
+verifies: [C1, C2, C3, C4]
+---
+
+Python unit tests `python/tests/test_markdown_ext.py` `BuildLogTests`: a block with an unknown element and an unknown modifier logs one ERROR and one
+WARNING to `mkdocs.extensions.mockitdown`, each "mockitdown block '<first line>': <diagnostic>"; the label is the
+first non-empty line cut to 48 characters, or the fence title, quoted (C1); with `strict: true` an unknown element and
+an unknown fence attribute each raise `SuperFencesException` with the message of C2, while a warning alone does not
+(C2, V1); without strict, a block with errors renders its error box and the page goes on to the next block (C3); a
+warning appears in the page's diagnostic box only with `show_warnings: true`, and in the log either way (C4).
```
