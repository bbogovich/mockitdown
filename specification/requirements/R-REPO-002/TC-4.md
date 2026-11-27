---
id: TC-4
title: Shared files in place, copied as data
verifies: [C1, C2, C3, C4, C5, C7]
---

Automated, in the files named (steps 1, 2, 3 and 5 written with R-PACK-018, #54).

1. `python/tests/test_layout.py` (`test_no_pack_outside_shared`, `test_icon_and_vocabulary_files_hold_their_tables`):
   no `pack.json`, `pack.css`, `page.css`, `icons.json` or `vocabulary.json` exists outside `shared/`, the
   build outputs and the R-PACK-018 test fixture `python/tests/fixtures/` (C1, C2, C3, C4); `icons.json`
   holds `glyphs` and `aliases` objects and `vocabulary.json` the lists `rendered`, `ignored` and
   `neutral_modules` (C3, C4).
2. `python/tests/test_shared.py::test_wheel_contains_the_shared_assets` and the TypeScript
   `package.test.ts` manifest test: each package holds its copies, and neither variant's source opens a
   path under `shared/` at run time — `test_layout.py::test_no_run_time_access_to_shared` finds no string
   naming `shared` in `python/src/mockitdown/` outside docstrings, and in `typescript/src/` no `shared/`
   outside comments except a `new URL("…shared/", import.meta.url)` that resolves, from the compiled
   module, to the package's own `dist/shared/` (C5).
3. Both builds only copy and parse the files: the Python sync and `copy-shared.mjs` read them as text
   or JSON, and no shared file is imported, evaluated or executed —
   `test_layout.py::test_builds_and_loaders_execute_nothing_shared` finds no call of `eval`, `exec`,
   `Function`, `import(`, `__import__`, `run_path` or `import_module` in both build scripts and the
   loaders of both variants (C7).
4. `python/tests/test_shared.py::test_stale_copy_is_detected`: changing one copied file makes the copy
   check fail (C6, with TC-1).
5. A `.css` file under `shared/packs/` is either `<id>/pack.css` of a directory holding `pack.json` or
   `_partials/<name>.css`; any other fails `test_layout.py::test_shared_css_is_a_pack_stylesheet_or_a_partial` (C1).
