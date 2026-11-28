---
id: R-DEV-001.CR-1
target: R-DEV-001
kind: clarification
version: 0.12.9
date: 2026-11-27
issue: 58
summary: "test cases backfilled: TC-1 verifies C1-C3 (#58)"
from: bb0abe4e9b7f
to: 856fa9bae9e8
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,11 @@
+---
+id: TC-1
+title: Device forms, pack sizes and fit
+verifies: [C1, C2, C3]
+---
+
+Python unit tests `python/tests/test_devices.py` `DeviceFormTests`: `DEVICES` holds exactly the six forms
+of C1 with their sizes, and each renders without diagnostics as `--mkd-w`/`--mkd-h` with `data-device`
+(C1). A site pack with `"sizes": {"phone": [390, 844], "watch": [198, 242]}` renders its phone 390 × 844
+and its own `watch` form without a warning, while `base` keeps 393 × 852 and warns about `watch`; the
+shipped `android` phone is 412 × 915 (C2, V1). `device="fit"` renders `data-fit="true"` and no size (C3).
```
