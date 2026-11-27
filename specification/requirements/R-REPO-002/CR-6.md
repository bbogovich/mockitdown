---
id: R-REPO-002.CR-6
target: R-REPO-002
kind: clarification
version: 0.12.2
date: 2026-11-27
issue: 54
summary: "as built (#54): TC-4 names the tests of steps 1, 2, 3 and 5 and the fixture exemption of step 1"
from: ee34340db6a8
to: b36f791e8a09
---

## Clauses

(none)

## Files

```diff
--- a/TC-4.md
+++ b/TC-4.md
@@ -6,9 +6,8 @@
 
-Automated, in the files named. Step 4 exists; steps 1, 2, 3 and 5 extend
-`test_no_pack_outside_shared` and `test_shared.py` with new assertions, written by the issue that builds
-R-PACK-018 (which touches the same tests).
+Automated, in the files named (steps 1, 2, 3 and 5 written with R-PACK-018, #54).
 
-1. `python/tests/test_layout.py`: no `pack.json`, `pack.css`, `page.css`, `icons.json` or
-   `vocabulary.json` exists outside `shared/` and the build outputs (C1, C2, C3, C4); `icons.json` holds
-   `glyphs` and `aliases` objects and `vocabulary.json` the lists `rendered`, `ignored` and
+1. `python/tests/test_layout.py` (`test_no_pack_outside_shared`, `test_icon_and_vocabulary_files_hold_their_tables`):
+   no `pack.json`, `pack.css`, `page.css`, `icons.json` or `vocabulary.json` exists outside `shared/`, the
+   build outputs and the R-PACK-018 test fixture `python/tests/fixtures/` (C1, C2, C3, C4); `icons.json`
+   holds `glyphs` and `aliases` objects and `vocabulary.json` the lists `rendered`, `ignored` and
    `neutral_modules` (C3, C4).
@@ -16,7 +15,11 @@
    `package.test.ts` manifest test: each package holds its copies, and neither variant's source opens a
-   path under `shared/` at run time — a grep over `python/src/mockitdown/` and `typescript/src/` for
-   `shared/` outside comments finds no file access (C5).
+   path under `shared/` at run time — `test_layout.py::test_no_run_time_access_to_shared` finds no string
+   naming `shared` in `python/src/mockitdown/` outside docstrings, and in `typescript/src/` no `shared/`
+   outside comments except a `new URL("…shared/", import.meta.url)` that resolves, from the compiled
+   module, to the package's own `dist/shared/` (C5).
 3. Both builds only copy and parse the files: the Python sync and `copy-shared.mjs` read them as text
-   or JSON, and no shared file is imported, evaluated or executed — a grep over both build scripts and
-   loaders for `import(`, `eval`, `exec` or `Function(` applied to shared content finds none (C7).
+   or JSON, and no shared file is imported, evaluated or executed —
+   `test_layout.py::test_builds_and_loaders_execute_nothing_shared` finds no call of `eval`, `exec`,
+   `Function`, `import(`, `__import__`, `run_path` or `import_module` in both build scripts and the
+   loaders of both variants (C7).
 4. `python/tests/test_shared.py::test_stale_copy_is_detected`: changing one copied file makes the copy
@@ -24,2 +27,2 @@
 5. A `.css` file under `shared/packs/` is either `<id>/pack.css` of a directory holding `pack.json` or
-   `_partials/<name>.css`; any other fails the layout test (C1).
+   `_partials/<name>.css`; any other fails `test_layout.py::test_shared_css_is_a_pack_stylesheet_or_a_partial` (C1).
```
