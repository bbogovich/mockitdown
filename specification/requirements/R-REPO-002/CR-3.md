---
id: R-REPO-002.CR-3
target: R-REPO-002
kind: clarification
version: pending
date: 2026-11-26
issue: 51
summary: "TC-3 covers C8, the roles.json copy (audit #51)"
from: 82f6c4808181
to: fd4891635e66
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-3.md
@@ -0,0 +1,10 @@
+---
+id: TC-3
+title: Role rule table shared and copied
+verifies: [C8]
+---
+
+`python/tests/test_shared.py` (the copy test of TC-1 covers `shared/language/`, which then holds
+`roles.json`) and `typescript/scripts/copy-shared.mjs --check`, run by `npm test`: `shared/language/roles.json`
+exists once, in `shared/`, and each package holds an identical copy beside `vocabulary.json`; no other
+`roles.json` exists outside `shared/language/` and the build outputs.
```
