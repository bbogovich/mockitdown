---
id: TC-5
title: Reference data in the package
verifies: [C13, C17]
---

`node scripts/copy-shared.mjs --check` (run by `npm test`) fails when `dist/shared/reference/` differs
from `shared/reference/`; a unit test reads `dist/shared/manifest.json` and checks that `reference` lists
`reference/index.json` and one `reference/<pack>.json` per pack, that none of them is in `files`, and
that `loadAssetsFromUrl` with a recording `fetch` requests no reference file.
