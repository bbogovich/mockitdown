---
id: R-DEV-002.CR-2
target: R-DEV-002
kind: revision
version: 0.12.9
date: 2026-11-27
issue: 58
summary: "as built: C2 warns only when width and height are not both given; TC-1 verifies C1-C3 (#58)"
from: 310b1b390165
to: f00f0e303821
---

## Clauses

@ C2 edit
~ If the device form is neither `fit`, a pack size nor a default size,{+ and `width` and `height` are not both given,+} then the figure assembler MUST warn "unknown device 'x'; using desktop (known: …)" with code `device` and use `desktop`.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,13 @@
+---
+id: TC-1
+title: Device precedence, unknown forms, width and height
+verifies: [C1, C2, C3]
+---
+
+Python unit tests `python/tests/test_devices.py` `DeviceSelectionTests`: the `device` option wins over
+`@Screen(device: .phone)`, which wins over `default_device: tablet`, which wins over the pack's `device`
+(`base` desktop, `android` phone, a site pack's `phone-landscape`) (C1, V1). `@Screen(device: .tv)`
+warns "unknown device 'tv'; using desktop (known: phone, phone-landscape, tablet, tablet-portrait,
+desktop, wide, fit)" with code `device` and renders a desktop, in the pack's own desktop size for `lisa`
+(C2). `width=600` on a phone gives 600 × 852, `height=500` 393 × 500, both 600 × 500; with both given,
+an unknown form is kept as named and not warned about (C2, C3, V1).
--- a/prose.md
+++ b/prose.md
@@ -1 +1,4 @@
 The site default sits between the block's own metadata and the pack's platform default.
+
+With both `width` and `height` the size is fully given, so an unknown form name is kept as written
+(it appears in `data-device`) and draws no warning.
```
