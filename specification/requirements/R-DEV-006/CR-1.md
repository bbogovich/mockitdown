---
id: R-DEV-006.CR-1
target: R-DEV-006
kind: clarification
version: 0.12.9
date: 2026-11-27
issue: 58
summary: "test cases backfilled: TC-1 rules, TC-2 a mockup in a documentation page, Chromium (#58)"
from: a6ed2ae0153f
to: a3a543c4c367
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,12 @@
+---
+id: TC-1
+title: Isolation rules
+verifies: [C1, C2, C3]
+---
+
+Python unit tests `python/tests/test_devices.py` `IsolationTests`, on `shared/css/page.css`: the frame
+reset sets margin, padding, border, font, letter spacing, colour, background, maximum width and box
+shadow for every HTML element the renderer writes inside a frame (the conformance corpus, SVG drawing
+elements and table columns aside), boxes are `border-box` and tables collapse (C1); `.mkd-frame` is
+`isolation: isolate`, `overflow: hidden` and `position: relative` (C2); every selector of `page.css` and
+of the base, SwiftUI and Fluent stylesheets names a mockitdown class (C3).
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,14 @@
+---
+id: TC-2
+title: A mockup in a documentation page
+verifies: [C1, C2]
+---
+
+Chromium test `typescript/tests/browser/devices.spec.mjs`: a SwiftUI mockup with a label, text, code
+block, keys, a table, a spreadsheet, a list, an icon, a toggle and a button, at `desktop` and at `fit`,
+placed once on a bare page and once inside `<article class="md-typeset">` under host rules modelled on
+Material's and Zensical's (typography, letter spacing, margins, list, table, code and key styling) and,
+when the repository's `.venv` holds Zensical, under Zensical's own stylesheet: every element in the
+frame has the same box (within half a pixel) and the same font, line height, letter spacing, colours,
+box shadow, margin, padding, list style and text transform (C1, V1). An alert's layer lies inside the
+frame, which is isolated and clips, and the page below the figure is not covered (C2).
```
