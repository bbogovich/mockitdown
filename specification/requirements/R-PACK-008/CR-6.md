---
id: R-PACK-008.CR-6
target: R-PACK-008
kind: clarification
version: 0.12.10
date: 2026-11-27
issue: 59
summary: test cases backfilled (#59)
from: 05ec55436cf9
to: 0bf899f462df
---

## Clauses

(none)

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -6,8 +6,8 @@
 
-Automated. Steps 2 to 5 are existing tests; steps 1 and 6 are new, written by the specification backfill
-issue for the pack area, and step 6 grows with each pack issue of C8.
+Automated. Steps 1 and 6 were written by the test backfill for the pack area (#59); steps 1 and 6 grow with
+each pack issue of C8 (its pack is then listed and placed).
 
-1. `python/tests/test_packs.py::test_shipped_packs` (new): `mockitdown packs` lists exactly the ids of C1,
-   C7 (without `lcars`, `phosphor`, `hologram`) and of C8 that are built, and `mockitdown packs --all`
-   adds the three easter eggs; every listed pack's `framework` and `version` keys are non-empty (C1, C6,
+1. `python/tests/test_packs.py` `ShippedPackTests.test_shipped_packs`: `mockitdown packs` lists exactly the ids of C1,
+   C7 (without `lcars`, `phosphor`, `hologram`) and of C8 that are built, no pack outside C1, C7 and C8 is
+   built, and `mockitdown packs --all` adds the three easter eggs; every listed pack's `framework` and `version` keys are non-empty (C1, C6,
    C7, C8).
@@ -22,3 +22,3 @@
    control tests: style modifiers map to `variant` and render the framework's variants (C5).
-6. `python/tests/test_site_nav.py::test_group_order` (new): the Reference nav and `shared/reference/index.json`
+6. `python/tests/test_site_nav.py` `TestSiteNav.test_group_order`: the Reference nav and `shared/reference/index.json`
    list the Retro and Mobile groups in the order of C9, leaving out packs not yet built (C9).
```
