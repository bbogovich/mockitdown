---
id: R-REPO-003.CR-2
target: R-REPO-003
kind: revision
version: 0.6.1
date: 2026-11-25
issue: 1
summary: "as built: TC-3 for the reference JSON; TC-1 covers the LICENSE (#1)"
from: bb8e7e8a7dd8
to: d4779af7e224
---

## Clauses

(none)

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,5 +3,5 @@
 title: Wheel contains the shared assets
-verifies: [C2]
+verifies: [C2, C10]
 ---
 
-Automated by `python/tests/test_shared.py`: a wheel built from `python/` lists every pack's `pack.json` and `pack.css`, `page.css`, `icons.json` and `vocabulary.json`.
+Automated by `python/tests/test_shared.py`: a wheel built from `python/` lists every pack's `pack.json` and `pack.css`, `page.css`, `icons.json`, `vocabulary.json` and the `LICENSE`.
--- /dev/null
+++ b/TC-3.md
@@ -0,0 +1,7 @@
+---
+id: TC-3
+title: Reference JSON for every listed pack
+verifies: [C6, C7, C8, C9]
+---
+
+Automated by `python/tests/test_shared.py` (`ReferenceJsonTests`): `index.json` lists the groups, and every pack it names has a `<pack>.json` with its id and elements carrying exactly the keys of C7; `python/tests/test_examples.py` runs `gen_reference.py --check`.
```
