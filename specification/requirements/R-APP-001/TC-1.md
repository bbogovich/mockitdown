---
id: TC-1
title: Appearance selection
verifies: [C1, C2, C3, C4]
---

Python unit tests `python/tests/test_appearance.py` `AppearanceSelectionTests`: `APPEARANCES` is
light, dark, auto, both; each is accepted as a fence attribute, `appearance="dim"` is refused with
"appearance must be one of light, dark, auto, both", and `--appearance dim` is a CLI usage error (C1).
`@Screen(appearance: .dark)` renders dark unless the option says `light`; without either the
configured `default_appearance` applies, `light` by default (C2, V1). `@Screen(appearance: "dim")` gives
exactly the warning "unknown appearance 'dim'; using light" with code `appearance` and a light frame, as
does the option `sepia` (C3, V1). `light`, `dark` and `auto` render one frame with that
`data-appearance`; `both` renders two, light then dark (C4).
The conformance cases `appearance-*` and `diag-unknown-appearance` hold the same output in both
variants (IT-8, IT-10).
