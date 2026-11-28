---
id: TC-1
title: Device precedence, unknown forms, width and height
verifies: [C1, C2, C3]
---

Python unit tests `python/tests/test_devices.py` `DeviceSelectionTests`: the `device` option wins over
`@Screen(device: .phone)`, which wins over `default_device: tablet`, which wins over the pack's `device`
(`base` desktop, `android` phone, a site pack's `phone-landscape`) (C1, V1). `@Screen(device: .tv)`
warns "unknown device 'tv'; using desktop (known: phone, phone-landscape, tablet, tablet-portrait,
desktop, wide, fit)" with code `device` and renders a desktop, in the pack's own desktop size for `lisa`
(C2). `width=600` on a phone gives 600 × 852, `height=500` 393 × 500, both 600 × 500; with both given,
an unknown form is kept as named and not warned about (C2, C3, V1).
