---
id: TC-1
title: Python package copy matches shared
verifies: [C6]
---

Automated by `python/tests/test_shared.py`: every file under `shared/packs` (except `_partials/`), `shared/css`, `shared/icons` and `shared/language` has a copy in the installed package, identical except for a `pack.css` that includes partials, whose copy equals its resolution (R-PACK-018.TC-1); `typescript/scripts/copy-shared.mjs --check`, run by `npm test`, checks `dist/shared/` the same way.
