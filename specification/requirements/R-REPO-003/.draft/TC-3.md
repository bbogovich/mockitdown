---
id: TC-3
title: Reference JSON for every listed pack
verifies: [C6, C7, C8, C9]
---

Automated by `python/tests/test_shared.py` (`ReferenceJsonTests`): `index.json` lists the groups, and every pack it names has a `<pack>.json` with its id and elements carrying exactly the keys of C7; `python/tests/test_examples.py` runs `gen_reference.py --check`.
