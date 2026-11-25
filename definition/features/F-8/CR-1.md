---
id: F-8.CR-1
target: F-8
kind: additive
version: 0.6.0
date: 2026-11-25
summary: "SRC-9: SwiftUI gallery defects, multi-platform chrome, macOS menu bar, meaningful samples"
from: 4678f891170f
to: 59235272ab8d
---

## Clauses

@ meta.source
- [SRC-2, SRC-3]
+ [SRC-2, SRC-3, SRC-9]
@ C7 insert after AC3
+ A mockup never paints one element over another unless the author layers them: siblings in a row keep their natural size, and text that does not fit is truncated or wrapped as the framework would.
@ C8 insert after C7
+ An element shown on its own, shrink-wrapped to its content (never narrower than that content; a narrower host scrolls), is drawn whole, including a presented surface (alert, dialog, sheet, popover, toast, tooltip) with the area it covers.
@ C9 insert after C8
+ Shapes and charts follow the framework's geometry: a circle in a wider frame is a circle centred in it, and every chart kind draws its marks from the data it is given.
@ AC4 insert after C9
+ In the pack gallery, no element sample of any pack shows two controls or labels overlapping.
@ AC5 insert after AC4
+ An alert, confirmation dialog, dialog, sheet, popover, toast or tooltip rendered alone at `device="fit"` shows its whole surface, with its title, content and actions.
@ AC6 insert after AC5
+ `Circle().frame(width: 160, height: 96)` renders a 96-point circle; scatter, bubble, heatmap and candlestick charts given only `values:` draw marks.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -5 +5,6 @@
 Nothing runs in the browser, so pages stay fast, cacheable and safe.
+
+**Layout without overlap (SRC-9).** The pack gallery showed controls drawn over each other and
+presented surfaces collapsed to a small square. A mockup is a picture of a real screen, and a real
+screen never shows siblings painted over each other: when space runs out, text truncates or wraps,
+and controls keep their size. An element shown alone at `fit` is drawn whole, including what it presents.
```
