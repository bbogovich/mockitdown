---
id: R-REPO-004.CR-9
target: R-REPO-004
kind: correction
version: 0.12.17
date: 2026-11-27
issue: 21
summary: "as built (#21): TC-4 verifies C15 (gen_conformance.py skips edit/)"
from: 1830783b2936
to: 68a9d3ba6a57
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-4.md
@@ -0,0 +1,9 @@
+---
+id: TC-4
+title: The edit corpus is no set of render cases
+verifies: [C15]
+---
+
+Automated by `test_edit_corpus_is_ignored` in `python/tests/test_conformance.py`: `shared/conformance/edit/`
+exists, none of its files is counted as a corpus file, and in a copy of the corpus with an extra file
+under `edit/`, `gen_conformance.py --check` passes and the file is still there afterwards.
```
