---
id: TC-3
title: Role rule table shared and copied
verifies: [C8]
---

`python/tests/test_shared.py` (the copy test of TC-1 covers `shared/language/`, which then holds
`roles.json`) and `typescript/scripts/copy-shared.mjs --check`, run by `npm test`: `shared/language/roles.json`
exists once, in `shared/`, and each package holds an identical copy beside `vocabulary.json`; no other
`roles.json` exists outside `shared/language/` and the build outputs.
