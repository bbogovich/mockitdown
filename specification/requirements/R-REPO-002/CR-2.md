---
id: R-REPO-002.CR-2
target: R-REPO-002
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "roles.json is shared language data copied into both packages: C8 (ING-1)"
from: e4fe28e55a3e
to: 82f6c4808181
---

## Clauses

@ meta.source
- [SRC-8]
+ [SRC-8, SRC-12]
@ C8 insert after V1
+ The role rule table (R-PACK-016) MUST exist only as `shared/language/roles.json`, and each variant's build MUST copy it into its package beside `vocabulary.json`.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -3 +3,4 @@
 The Python build copies the files with `python/tools/sync_shared.py`, run by `python/setup.py` at every build from a checkout; the copies are ignored by git and travel in the sdist.
+
+The role rule table joins the vocabulary as shared language data (R-PACK-016). Both packages carry it,
+and the copy tests of C6 cover it; only the TypeScript design tools read it for now.
```
