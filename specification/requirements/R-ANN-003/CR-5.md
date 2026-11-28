---
id: R-ANN-003.CR-5
target: R-ANN-003
kind: correction
version: 0.13.25
date: 2026-11-28
issue: 46
summary: "as built (#46): C3 covers every overlay layer (presented alert, confirmation dialog, sheet, cover, popover, inspector) and an overlay's own marks; TC-1 verifies C3 and C6, names the alert case, the unit tests and the browser test (IT-74)"
from: 4519fe184a78
to: c507c0c849f7
---

## Clauses

@ C3 replace
- Marks created inside a modal dialog MUST be emitted after the dialog's layer, so their anchors precede them.
+ Marks created inside an overlay layer (a modal dialog, a presented alert, confirmation dialog, sheet, cover, popover or inspector) and the marks of an overlay itself (a dialog, toast or floating action button) MUST be emitted after that layer, so their anchors precede them.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,8 +3,11 @@
 title: Marks inside a dialog
-verifies: [C6]
+verifies: [C3, C6]
 ---
 
-Conformance case `annotate-dialog-contents` (a callout on a button inside a `Dialog`) in both suites.
-Browser test (Chromium): the callout's centre lies within 4 px of the button's top-left corner, once
-with anchor positioning and once with the fallback layer forced (anchor positioning disabled through
-the stylesheet's `@supports` branch).
+Conformance cases `annotate-dialog-contents` (a callout on a button inside a `Dialog`) and
+`annotate-in-dialog` (one inside an `.alert`) in both suites; the unit tests `DialogContentsTests`
+(`python/tests/test_overlay_callouts.py`: a `Dialog`, an `.alert` and a `.sheet`, the anchored mark after
+the layer). Browser test (Chromium, `typescript/tests/browser/overlay-callouts.spec.mjs`, IT-74): for a
+`Dialog` and an `.alert`, in a fit frame and in a phone frame, the callout's centre lies within 4 px of the
+button's top-left corner, once with anchor positioning and once with the fallback layer forced (anchor
+positioning disabled through the stylesheet's `@supports` branch).
--- a/prose.md
+++ b/prose.md
@@ -7,3 +7,5 @@
 contents are positioned against the dialog, so a callout on a dialog's button sits on that button rather
-than at the screen's top-left corner.
+than at the screen's top-left corner. As built (#46), every overlay layer is followed by the anchored
+marks of the views inside it: a presented alert or sheet emitted its contents' marks before its layer, so
+in a device frame Chromium could not resolve their anchors and drew them at the screen's corner.
 
```
