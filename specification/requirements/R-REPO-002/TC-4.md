---
id: TC-4
title: Shared files in place, copied as data
verifies: [C1, C2, C3, C4, C5, C7]
---

Automated, in the files named. Step 4 exists; steps 1, 2, 3 and 5 extend
`test_no_pack_outside_shared` and `test_shared.py` with new assertions, written by the issue that builds
R-PACK-018 (which touches the same tests).

1. `python/tests/test_layout.py`: no `pack.json`, `pack.css`, `page.css`, `icons.json` or
   `vocabulary.json` exists outside `shared/` and the build outputs (C1, C2, C3, C4); `icons.json` holds
   `glyphs` and `aliases` objects and `vocabulary.json` the lists `rendered`, `ignored` and
   `neutral_modules` (C3, C4).
2. `python/tests/test_shared.py::test_wheel_contains_the_shared_assets` and the TypeScript
   `package.test.ts` manifest test: each package holds its copies, and neither variant's source opens a
   path under `shared/` at run time — a grep over `python/src/mockitdown/` and `typescript/src/` for
   `shared/` outside comments finds no file access (C5).
3. Both builds only copy and parse the files: the Python sync and `copy-shared.mjs` read them as text
   or JSON, and no shared file is imported, evaluated or executed — a grep over both build scripts and
   loaders for `import(`, `eval`, `exec` or `Function(` applied to shared content finds none (C7).
4. `python/tests/test_shared.py::test_stale_copy_is_detected`: changing one copied file makes the copy
   check fail (C6, with TC-1).
5. A `.css` file under `shared/packs/` is either `<id>/pack.css` of a directory holding `pack.json` or
   `_partials/<name>.css`; any other fails the layout test (C1).
