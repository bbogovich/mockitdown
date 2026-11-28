---
id: R-PACK-010.CR-2
target: R-PACK-010
kind: revision
version: 0.12.13
date: 2026-11-27
issue: 61
summary: "as built (#61): C4 a hidden pack's reference file has group null; C5 the conformance corpus holds hidden packs' own-element cases; TC-1 names the egg-page test and gains step 4"
from: 94da3f8dd651
to: 29e20608073f
---

## Clauses

@ C4 insert after C3
+ The `group` of a hidden pack's `shared/reference/<id>.json` (R-REPO-003.C6) MUST be `null`, since a hidden pack belongs to no Reference menu group.
@ C5 insert after C4
+ The conformance corpus (`tools/gen_conformance.py`) MUST hold the `pack-<id>-own-<n>` cases of a hidden pack's own elements, as for any pack with reference data.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: Hidden packs work but are not listed
-verifies: [C1, C2, C3]
+verifies: [C1, C2, C3, C4, C5]
 ---
@@ -14,5 +14,9 @@
    has `hidden` equal to `["hologram", "lcars", "phosphor"]`, no group lists any of them, and each has
-   `shared/reference/<id>.json` with every element of the pack; `gen_reference.py --check` passes (C2).
-3. `python/tests/test_examples.py::test_reference_pages_are_current` and the nav test: the example site
+   `shared/reference/<id>.json` with `group` null and every element of the pack; `gen_reference.py --check`
+   passes (C2, C4).
+3. `python/tests/test_examples.py::test_reference_pages_are_current` and
+   `test_hidden_packs_have_egg_pages_only`: the example site
    has no Reference page and no nav entry for a hidden pack, and `docs/eggs/<id>.md` exists for each of
    the three while `mkdocs.yml`'s nav names none of them (C2, C3).
+4. `python/tests/test_conformance.py::test_check_passes`: the corpus holds `pack-lcars-own-1` and the
+   other own-element cases of the hidden packs, and the TypeScript conformance test renders them alike (C5).
--- a/prose.md
+++ b/prose.md
@@ -3,2 +3,2 @@
 listed in it, so the generator writes their reference data like any pack's and lists them apart, under
-`hidden` in the index; the gallery and its home page read that list (R-WEB-004, R-WEB-006).
+`hidden` in the index; the gallery and its home page read that list (R-WEB-004, R-WEB-006). A hidden pack's reference file has no menu group, so its `group` is null, and the gallery leaves the group out of its facts; with reference data, its own elements also reach the conformance corpus, so both variants are compared on them.
```
