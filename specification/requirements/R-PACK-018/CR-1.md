---
id: R-PACK-018.CR-1
target: R-PACK-018
kind: correction
version: 0.12.2
date: 2026-11-27
issue: 54
summary: "as built (#54): C6 also fails an @import that shares its line; C8 refuses an @import outside comments only; TC-1 names the tests, the fixture's expected copies and dist/shared/packs/ for step 4"
from: 0f020ace96f7
to: eb3da6a7f3cb
---

## Clauses

@ C6 edit
~ A build MUST fail, naming the pack and the partial, when an `@import` names a partial that does not exist, appears after the first rule, {+shares its line with anything but white space, +}or names a path outside `../_partials/`, and when a partial breaks C3.
@ C8 edit
~ A pack stylesheet loaded at run time — a site pack found through `pack_paths`, or an application pack given to `registerPack` — that contains `@import` {+outside a comment +}MUST be refused with the error "pack 'x': @import is resolved only in built-in packs".

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -7,4 +7,6 @@
 Unit tests in both variants over one fixture set, `python/tests/fixtures/partials/` read by
-`python/tests/test_shared.py` and by `typescript/tests/unit/package.test.ts` (each test points the
-build's resolve function at the fixture's `packs/` folder):
+`python/tests/test_shared.py` (`PartialTests`, and step 4 in `PackageCopyTests`) and by
+`typescript/tests/unit/package.test.ts` (each test points the build's resolve function —
+`sync_shared.resolve_pack_css`, `copy-shared.mjs` `resolvePackCss` — at the fixture's `packs/` folder;
+the expected copies are the fixture's `expected/<id>.pack.css`):
 
@@ -15,3 +17,4 @@
    are asserted in both suites (C4, C5).
-2. The registry lists `one` and `two` but not `_partials` (C1).
+2. The Python registry (`PackRegistry` over the fixture) and the TypeScript build's pack list (`packIds`) list
+   `one` and `two` but not `_partials` (C1).
 3. An `@import` after the first rule, of `../_partials/missing.css`, or of `../two/pack.css` makes the
@@ -19,7 +22,9 @@
    `.mkd-button` (no scope) or containing `prefers-color-scheme` fails naming the partial (C2, C3, C6).
-4. After `npm run build` and the Python sync, no file under `dist/shared/` or `python/src/mockitdown/packs/`
-   is named `*.css` outside `packs/<id>/pack.css`, and no copied `pack.css` contains `@import` (C7).
+4. After `npm run build` and the Python sync, no file under `dist/shared/packs/` or
+   `python/src/mockitdown/packs/` is named `*.css` other than `<id>/pack.css` beside a `pack.json`, the
+   manifest names no `_partials` path, no copied `pack.css` contains `@import`, and every copied
+   `pack.css` equals what the build's resolve step writes from `shared/` (C7, R-REPO-002.C6).
 5. `PackRegistry(pack_paths=[tmp])` with `tmp/acme/pack.css` containing `@import "../_partials/x.css";`
    raises "pack 'acme': @import is resolved only in built-in packs"; `registerPack(json, css)` with the
-   same CSS throws the same message (C8).
+   same CSS throws the same message (C8). An `@import` inside a comment is not refused.
 6. The existing contract tests (`test_css_is_scoped`, `test_css_has_no_appearance_branching`) pass on
```
