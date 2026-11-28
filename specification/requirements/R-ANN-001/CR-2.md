---
id: R-ANN-001.CR-2
target: R-ANN-001
kind: correction
version: 0.13.25
date: 2026-11-28
issue: 46
summary: "as built (#46): TC-1 names the conformance case, the unit tests and the browser test (IT-74, fit and phone frames); prose says how an overlay keeps its marks"
from: d39b3d42c845
to: a780b13f7c9f
---

## Clauses

(none)

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -6,4 +6,8 @@
 
-Conformance cases `annotate-overlay-callouts` (a `Dialog`, a `Toast` and a floating action button each
-with `.callout(n)`, one presented through `.overlay`) in both suites: each overlay's callout mark is in
-the expected HTML. Browser test: each mark is visible and centred on its overlay's corner within 4 px.
+Conformance case `annotate-overlay-callouts` (a `Dialog`, a `Toast` and a floating action button each
+with `.callout(n)`, a second `Toast` presented through `.overlay`) in both suites: each overlay's callout
+mark is in the expected HTML. Unit tests `OverlayCalloutTests` (`python/tests/test_overlay_callouts.py`):
+the overlay's root is decorated inside its layer and its anchored mark follows the layer; an inline toast
+is decorated in place. Browser test (Chromium, `typescript/tests/browser/overlay-callouts.spec.mjs`,
+IT-74): in a fit frame and in a phone frame, each mark is visible and centred on its overlay's top-left
+corner within 4 px.
--- a/prose.md
+++ b/prose.md
@@ -3,2 +3,4 @@
 **Overlays keep their marks (F-15.C5).** A dialog, a toast or a floating action button with
-`.callout(…)` draws the callout like any other element.
+`.callout(…)` draws the callout like any other element. As built (#46): such an overlay is lifted out of the flow into a
+screen-level layer, and its marks used to be dropped with it; now the overlay's root is decorated inside
+its layer, and its anchored mark follows that layer (R-ANN-003.C3).
```
