---
id: TC-1
title: Hidden packs work but are not listed
verifies: [C1, C2, C3]
---

Automated. Step 1 ties C1 to existing behaviour and needs a new assertion; steps 2 and 3 are new with C2.

1. `python/tests/test_packs.py::test_hidden_packs` (new): `mockitdown packs` lists none of `lcars`,
   `phosphor`, `hologram`, `mockitdown packs --all` lists all three, and rendering `Text("Hi")` with
   `pack="lcars"`, and with `import LCARS`, gives no error diagnostic and the pack lineage
   `["base", "lcars"]` (C1, C3).
2. `python/tests/test_shared.py::test_hidden_packs_have_reference_data` (new): `shared/reference/index.json`
   has `hidden` equal to `["hologram", "lcars", "phosphor"]`, no group lists any of them, and each has
   `shared/reference/<id>.json` with every element of the pack; `gen_reference.py --check` passes (C2).
3. `python/tests/test_examples.py::test_reference_pages_are_current` and the nav test: the example site
   has no Reference page and no nav entry for a hidden pack, and `docs/eggs/<id>.md` exists for each of
   the three while `mkdocs.yml`'s nav names none of them (C2, C3).
