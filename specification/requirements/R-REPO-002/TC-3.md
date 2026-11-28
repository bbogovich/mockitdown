---
id: TC-3
title: Role rule table shared and copied
verifies: [C8]
---

`python/tests/test_shared.py` (the copy test of TC-1 covers `shared/language/`, which holds `roles.json`;
the wheel test expects `mockitdown/roles.json`), `python/tests/test_roles.py::PackagedTableTests` and
`python/tests/test_layout.py::test_no_pack_outside_shared` (no `roles.json` outside `shared/` and the
build outputs); in TypeScript, `typescript/tests/unit/package.test.ts` and `roles.test.ts`:
`dist/shared/roles.json` is an identical copy of `shared/language/roles.json`, beside `vocabulary.json`,
and listed in `manifest.json`.
