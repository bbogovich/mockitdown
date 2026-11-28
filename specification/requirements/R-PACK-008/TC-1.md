---
id: TC-1
title: The shipped packs
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9]
---

Automated. Steps 1 and 6 were written by the test backfill for the pack area (#59); steps 1 and 6 grow with
each pack issue of C8 (its pack is then listed and placed).

1. `python/tests/test_packs.py` `ShippedPackTests.test_shipped_packs`: `mockitdown packs` lists exactly the ids of C1,
   C7 (without `lcars`, `phosphor`, `hologram`) and of C8 that are built, no pack outside C1, C7 and C8 is
   built, and `mockitdown packs --all` adds the three easter eggs; every listed pack's `framework` and `version` keys are non-empty (C1, C6,
   C7, C8).
2. `test_packs_load_and_roles_exist`, `test_tokens_have_light_and_dark` and `test_module_names_are_unique`:
   every pack loads, declares import modules, light and dark tokens, and its elements map to real roles;
   the registry makes each extend `base` (R-PACK-003.C1) (C2).
3. `python/tests/test_syntax.py` and the conformance cases of the `swiftui` area: `import SwiftUI`
   selects `swiftui` (C3).
4. `test_every_element_renders` and the Reference pages (R-PACK-012, `gen_reference.py --check`):
   every element a pack defines renders, with its `doc` line and variants listed (C4).
5. The conformance corpus (R-REPO-004.C2, every shipped pack at least once) and the SwiftUI and Material
   control tests: style modifiers map to `variant` and render the framework's variants (C5).
6. `python/tests/test_site_nav.py` `TestSiteNav.test_group_order`: the Reference nav and `shared/reference/index.json`
   list the Retro and Mobile groups in the order of C9, leaving out packs not yet built (C9).
