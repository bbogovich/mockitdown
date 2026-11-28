---
id: R-APP-003.CR-1
target: R-APP-003
kind: clarification
version: 0.12.7
date: 2026-11-27
issue: 56
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#56)"
from: 81f46e6ba1b2
to: 33b070570340
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
+title: Two cells from the same views
+verifies: [C1, C2]
+---
+
+Python unit tests `python/tests/test_appearance.py` `SideBySideTests`: a SwiftUI phone mockup with
+`appearance="both"` renders a stage of two cells, the light frame labelled `Light` then the dark frame
+labelled `Dark`, whose frame contents are identical (C1). `page.css` makes the stage a flex row with a
+gap and each cell `flex: 1 1 0`, `min-width: 0` and its own inline-size container, so each frame
+shrinks to its half (C2).
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,9 @@
+---
+id: TC-2
+title: Side by side in a column
+verifies: [C2]
+---
+
+Browser test (Chromium) `typescript/tests/browser/appearance.spec.mjs`: an `appearance="both"` phone
+mockup in a 700 px column shows two frames of equal width and height on one row, light left of dark,
+each at most and within 2 px of half the column minus the stage's gap, labelled Light and Dark (V1).
```
