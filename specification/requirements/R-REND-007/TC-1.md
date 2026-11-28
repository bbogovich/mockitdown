---
id: TC-1
title: Static controls, identical output, derived values, decorative icons
verifies: [C1, C2, C3, C4]
---

Python unit tests `python/tests/test_markup.py` `StaticOutputTests`: a button, toggle, checkbox, radio button, text field and link carry the
ARIA roles `button`, `switch`, `checkbox`, `radio`, `textbox` and `link` and no form element or script (C1, V1); 120
conformance sources and a block with an avatar, a chart and an overlay render byte-identical twice (C2, V1); an avatar's
hue follows its name, not its place, two charts get distinct identifiers that repeat on the next rendering, and the
renderer uses no randomness, clock or `id()` (C3); every icon of the corpus is `svg.mkd-icon` with
`aria-hidden="true"` and `focusable="false"` (C4). The TypeScript variant renders the same corpus byte for byte
(`npm run test:unit`).
