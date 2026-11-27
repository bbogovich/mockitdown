---
id: R-REPO-002.CR-5
target: R-REPO-002
kind: revision
version: 0.11.0
date: 2026-11-27
summary: "SRC-18: built-in packs include stylesheet partials (C1); the copy check compares resolved pack.css copies (C6); TC-4 covers C1-C5, C7"
from: 319f43ba9e92
to: ee34340db6a8
---

## Clauses

@ meta.source
- [SRC-8, SRC-12]
+ [SRC-8, SRC-12, SRC-18]
@ C1 edit
~ The built-in packs MUST exist only as [-`shared/packs/<id>/pack.json`-]{+`shared/packs/<id>/pack.json`, `shared/packs/<id>/pack.css`+} and [-`shared/packs/<id>/pack.css`.-]{+the stylesheet partials `shared/packs/_partials/<name>.css` they include (R-PACK-018).+}
@ C6 replace
- A test in each variant MUST fail when its package copy differs from `shared/` after a build.
+ A test in each variant MUST fail when its package copy differs, after a build, from what the build writes from `shared/`: an identical copy of every file, except a `pack.css` that includes partials, whose copy is resolved as R-PACK-018.C4 says.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -6,2 +6,2 @@
 
-Automated by `python/tests/test_shared.py`: every file under `shared/packs`, `shared/css`, `shared/icons` and `shared/language` has an identical copy in the installed package.
+Automated by `python/tests/test_shared.py`: every file under `shared/packs` (except `_partials/`), `shared/css`, `shared/icons` and `shared/language` has a copy in the installed package, identical except for a `pack.css` that includes partials, whose copy equals its resolution (R-PACK-018.TC-1); `typescript/scripts/copy-shared.mjs --check`, run by `npm test`, checks `dist/shared/` the same way.
--- /dev/null
+++ b/TC-4.md
@@ -0,0 +1,25 @@
+---
+id: TC-4
+title: Shared files in place, copied as data
+verifies: [C1, C2, C3, C4, C5, C7]
+---
+
+Automated, in the files named. Step 4 exists; steps 1, 2, 3 and 5 extend
+`test_no_pack_outside_shared` and `test_shared.py` with new assertions, written by the issue that builds
+R-PACK-018 (which touches the same tests).
+
+1. `python/tests/test_layout.py`: no `pack.json`, `pack.css`, `page.css`, `icons.json` or
+   `vocabulary.json` exists outside `shared/` and the build outputs (C1, C2, C3, C4); `icons.json` holds
+   `glyphs` and `aliases` objects and `vocabulary.json` the lists `rendered`, `ignored` and
+   `neutral_modules` (C3, C4).
+2. `python/tests/test_shared.py::test_wheel_contains_the_shared_assets` and the TypeScript
+   `package.test.ts` manifest test: each package holds its copies, and neither variant's source opens a
+   path under `shared/` at run time — a grep over `python/src/mockitdown/` and `typescript/src/` for
+   `shared/` outside comments finds no file access (C5).
+3. Both builds only copy and parse the files: the Python sync and `copy-shared.mjs` read them as text
+   or JSON, and no shared file is imported, evaluated or executed — a grep over both build scripts and
+   loaders for `import(`, `eval`, `exec` or `Function(` applied to shared content finds none (C7).
+4. `python/tests/test_shared.py::test_stale_copy_is_detected`: changing one copied file makes the copy
+   check fail (C6, with TC-1).
+5. A `.css` file under `shared/packs/` is either `<id>/pack.css` of a directory holding `pack.json` or
+   `_partials/<name>.css`; any other fails the layout test (C1).
--- a/prose.md
+++ b/prose.md
@@ -8 +8,5 @@
 Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.
+**Stylesheet partials (SRC-18#health).** A pack stylesheet may include shared partials
+(R-PACK-018); the partials live in `shared/packs/_partials/` and reach the packages only inside the
+resolved `pack.css` copies, so the copy check compares a copy with its resolution rather than with the
+file in `shared/`.
```
