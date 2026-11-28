---
id: TC-5
title: Reference data in the package
verifies: [C13, C17]
---

`node scripts/copy-shared.mjs --check` (run by `npm test`) fails when `dist/shared/reference/` differs
from `shared/reference/`; a unit test reads `dist/shared/manifest.json` and checks that `reference` lists
`reference/index.json` and one `reference/<pack>.json` per pack, that none of them is in `files`, and
that `loadAssetsFromUrl` with a recording `fetch` requests no reference file.

As built (#29): `typescript/tests/unit/reference.test.ts`. The expected `reference` list is read from
the files of `shared/reference/`; each copy equals its source; `copy-shared.mjs --check` passes, fails
(exit 1) after one space is appended to `dist/shared/reference/base.json`, and passes again once it is
restored; `loadAssetsFromUrl` over `dist/shared/` with a recording `fetch` requests `packs/base/pack.json`
and no path containing `/reference/`.
