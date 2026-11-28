---
id: R-REPO-002.CR-9
target: R-REPO-002
kind: correction
version: 0.13.7
date: 2026-11-28
issue: 28
summary: "as built (#28): TC-3 names the tests that check the roles.json copies"
from: aaa619f4ef48
to: 0035fc6f5b6e
---

## Clauses

(none)

## Files

```diff
--- a/TC-3.md
+++ b/TC-3.md
@@ -6,5 +6,7 @@
 
-`python/tests/test_shared.py` (the copy test of TC-1 covers `shared/language/`, which then holds
-`roles.json`) and `typescript/scripts/copy-shared.mjs --check`, run by `npm test`: `shared/language/roles.json`
-exists once, in `shared/`, and each package holds an identical copy beside `vocabulary.json`; no other
-`roles.json` exists outside `shared/language/` and the build outputs.
+`python/tests/test_shared.py` (the copy test of TC-1 covers `shared/language/`, which holds `roles.json`;
+the wheel test expects `mockitdown/roles.json`), `python/tests/test_roles.py::PackagedTableTests` and
+`python/tests/test_layout.py::test_no_pack_outside_shared` (no `roles.json` outside `shared/` and the
+build outputs); in TypeScript, `typescript/tests/unit/package.test.ts` and `roles.test.ts`:
+`dist/shared/roles.json` is an identical copy of `shared/language/roles.json`, beside `vocabulary.json`,
+and listed in `manifest.json`.
```
