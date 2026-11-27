---
id: TC-1
title: Partials resolved by both builds
verifies: [C1, C2, C3, C4, C5, C6, C7, C8]
---

Unit tests in both variants over one fixture set, `python/tests/fixtures/partials/` read by
`python/tests/test_shared.py` and by `typescript/tests/unit/package.test.ts` (each test points the
build's resolve function at the fixture's `packs/` folder):

1. Fixture: `_partials/demo.css` = `.mkd-scope .mkd-button { color: red; }`; packs `one` and `two`
   (each `pack.json` plus a `pack.css` starting with a comment, `@import "../_partials/demo.css";` and
   one own rule). The resolved `one/pack.css` equals the comment, `.mkd-pack-one .mkd-button { color: red; }`
   and `one`'s own rule, byte for byte; `two` likewise with `.mkd-pack-two`; the same expected bytes
   are asserted in both suites (C4, C5).
2. The registry lists `one` and `two` but not `_partials` (C1).
3. An `@import` after the first rule, of `../_partials/missing.css`, or of `../two/pack.css` makes the
   resolve step fail with a message naming the pack and the path; a partial with a selector
   `.mkd-button` (no scope) or containing `prefers-color-scheme` fails naming the partial (C2, C3, C6).
4. After `npm run build` and the Python sync, no file under `dist/shared/` or `python/src/mockitdown/packs/`
   is named `*.css` outside `packs/<id>/pack.css`, and no copied `pack.css` contains `@import` (C7).
5. `PackRegistry(pack_paths=[tmp])` with `tmp/acme/pack.css` containing `@import "../_partials/x.css";`
   raises "pack 'acme': @import is resolved only in built-in packs"; `registerPack(json, css)` with the
   same CSS throws the same message (C8).
6. The existing contract tests (`test_css_is_scoped`, `test_css_has_no_appearance_branching`) pass on
   the resolved copies of every built-in pack.
