---
id: R-ANN-002.CR-1
target: R-ANN-002
kind: clarification
version: 0.12.7
date: 2026-11-27
issue: 56
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#56)"
from: 7eca90db0097
to: 5b6d643fced6
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,21 @@
+---
+id: TC-1
+title: Pointer, selection, highlight and tap marks
+verifies: [C1, C2, C3, C4]
+---
+
+Python unit tests `python/tests/test_annotations.py` `PointerSelectionTests`:
+`.pointer(.<kind>, alignment: .topTrailing)` for each of arrow, hand, ibeam, grab, crosshair and touch
+draws `span.mkd-deco__pointer[data-align=topTrailing]` holding `span.mkd-pointer[data-kind=<kind>]`
+with that kind's own drawing (six different drawings); `.pointer()` draws an arrow at `center`;
+`.cursor` renders as `.pointer` (C1). `List { … }.dragSelect()` draws `span.mkd-deco__marquee` in the
+anchored and the fallback layer; `.dragSelect(.green)` and `.marquee(.green)` set `--mkd-marquee`; the
+base stylesheet gives the mark a negative inset, a border and a `color-mix` tint of `--mkd-marquee`
+(C2, V1). `.highlight()` and `.highlight(.red)` draw `span.mkd-deco__highlight` (a solid ring);
+`.tap()` and `.tap(alignment: .leading)` draw `span.mkd-deco__tap` at the alignment (C3). On a canvas,
+`SelectionRect().frame(width: 60, height: 40).position(x: 50, y: 50)` and `Pointer(.hand).position(…)`
+render `.mkd-marquee` and `.mkd-pointer` sized by the frame and centred at the position, with the same
+drawing and stylesheet rule as the modifiers' marks (C4).
+The conformance cases `annotate-pointer-*`, `annotate-cursor-alias`, `annotate-drag-select`,
+`annotate-marquee-color`, `annotate-highlight`, `annotate-tap` and `annotate-free-elements` hold the
+same output byte for byte in both variants (IT-8, IT-10).
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,10 @@
+---
+id: TC-2
+title: The selection rectangle surrounds the view
+verifies: [C2]
+---
+
+Browser test (Chromium) `typescript/tests/browser/annotations.spec.mjs`: a `List` of two rows with
+`.dragSelect()`, rendered with the package's Node entry and put on a blank page with its stylesheet.
+The visible selection rectangle lies outside the list's box on all four sides, by more than 0 and less
+than 16 px, with a border wider than 0 and a translucent background colour (V1).
```
