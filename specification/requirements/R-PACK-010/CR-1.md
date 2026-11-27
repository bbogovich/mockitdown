---
id: R-PACK-010.CR-1
target: R-PACK-010
kind: revision
version: 0.11.0
date: 2026-11-27
summary: "SRC-18: hidden packs get reference data listed under hidden in the index (C2); the shipped hidden packs and their egg pages (C3); TC-1"
from: e7d6b5b5b895
to: 94da3f8dd651
---

## Clauses

@ meta.source
- [SRC-5]
+ [SRC-4, SRC-5, SRC-18]
@ C2 insert after C1
+ `tools/gen_reference.py` MUST also write `shared/reference/<id>.json` for every hidden pack and list the hidden packs, sorted by id, under the key `hidden` of `shared/reference/index.json` (`{"groups": […], "hidden": [id, …]}`), outside every group; it MUST NOT write a Reference page or a navigation entry for a hidden pack.
@ C3 insert after C2
+ The shipped hidden packs MUST be `lcars`, `phosphor` and `hologram`, each with a hidden page of the example site under `eggs/` that the site's navigation does not list.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,18 @@
+---
+id: TC-1
+title: Hidden packs work but are not listed
+verifies: [C1, C2, C3]
+---
+
+Automated. Step 1 ties C1 to existing behaviour and needs a new assertion; steps 2 and 3 are new with C2.
+
+1. `python/tests/test_packs.py::test_hidden_packs` (new): `mockitdown packs` lists none of `lcars`,
+   `phosphor`, `hologram`, `mockitdown packs --all` lists all three, and rendering `Text("Hi")` with
+   `pack="lcars"`, and with `import LCARS`, gives no error diagnostic and the pack lineage
+   `["base", "lcars"]` (C1, C3).
+2. `python/tests/test_shared.py::test_hidden_packs_have_reference_data` (new): `shared/reference/index.json`
+   has `hidden` equal to `["hologram", "lcars", "phosphor"]`, no group lists any of them, and each has
+   `shared/reference/<id>.json` with every element of the pack; `gen_reference.py --check` passes (C2).
+3. `python/tests/test_examples.py::test_reference_pages_are_current` and the nav test: the example site
+   has no Reference page and no nav entry for a hidden pack, and `docs/eggs/<id>.md` exists for each of
+   the three while `mkdocs.yml`'s nav names none of them (C2, C3).
--- a/prose.md
+++ b/prose.md
@@ -1 +1,4 @@
 Easter-egg packs reward readers of the documentation without cluttering the lists of real frameworks.
+**In the gallery (SRC-18#gallery).** The easter eggs must be reachable in the pack gallery without being
+listed in it, so the generator writes their reference data like any pack's and lists them apart, under
+`hidden` in the index; the gallery and its home page read that list (R-WEB-004, R-WEB-006).
```
