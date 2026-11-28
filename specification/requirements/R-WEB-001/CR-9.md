---
id: R-WEB-001.CR-9
target: R-WEB-001
kind: correction
version: 0.13.8
date: 2026-11-28
issue: 29
summary: "as built (#29): TC-5 names reference.test.ts"
from: b45eb588e06e
to: 7c385d995da9
---

## Clauses

(none)

## Files

```diff
--- a/TC-5.md
+++ b/TC-5.md
@@ -10 +10,7 @@
 that `loadAssetsFromUrl` with a recording `fetch` requests no reference file.
+
+As built (#29): `typescript/tests/unit/reference.test.ts`. The expected `reference` list is read from
+the files of `shared/reference/`; each copy equals its source; `copy-shared.mjs --check` passes, fails
+(exit 1) after one space is appended to `dist/shared/reference/base.json`, and passes again once it is
+restored; `loadAssetsFromUrl` over `dist/shared/` with a recording `fetch` requests `packs/base/pack.json`
+and no path containing `/reference/`.
```
