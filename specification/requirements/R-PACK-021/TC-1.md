---
id: TC-1
title: The gsos pack, automated
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, C11]
---

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `gsos`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C9 names (C1, C2, C3, C9).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C10).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the `Desktop` sample's volume icons are in its right-hand column; an `AliasIcon` label has `font-style: italic`; an icon with `.iconColor(.red)` is drawn red (C4, C5, C6, C7, C8).
4. The conformance case `gsos-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C11).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["gsos"]`
   and renders in the Examples tab without a diagnostic (C10).
