---
id: R-REND-012.CR-2
target: R-REND-012
kind: revision
version: 0.8.3
date: 2026-11-25
issue: 9
summary: "as built (#9): series: for scatter, bubble and heatmap (C8), gauge and all-zero pies (C9), bubble area proportional to size (C10); TC-3 counts polygons and polylines as marks"
from: df4c22bb3688
to: 68b974bf502c
---

## Clauses

@ C8 insert after C7
+ Given `series:` instead of `values:`, a scatter or bubble chart MUST plot each series as in C6 in its own colour, and a heatmap MUST draw one row of cells per series.
@ C9 insert after C8
+ A gauge chart without `value:` MUST draw its minimum and MUST NOT be treated as a chart with no data; a pie, donut or treemap whose values are all zero or negative has no usable data.
@ C10 insert after C9
+ A bubble's area MUST be proportional to its size (the third element of a point, or the value under C6).

## Files

```diff
--- a/TC-3.md
+++ b/TC-3.md
@@ -3,5 +3,5 @@
 title: Every kind draws marks from values
-verifies: [C6, C7]
+verifies: [C6, C7, C8, C9, C10]
 ---
 
-Python and TypeScript render tests: for every kind of C1, `values: [3, 5, 2, 6, 4]` yields an SVG with at least one mark (`circle`, `rect` or `path` besides axes); a chart with no data emits the `chart` warning.
+Python and TypeScript render tests: for every kind of C1, `values: [3, 5, 2, 6, 4]` yields an SVG with at least one mark (`circle`, `rect`, `path`, `polygon` or `polyline` besides grid lines, axes and the gauge track); a chart with no data emits the `chart` warning (a gauge without a value does not); a bubble four times the size of another has twice its radius; the conformance cases `chart-bubble-series` and `chart-heatmap-series` cover `series:` (C8).
--- a/prose.md
+++ b/prose.md
@@ -3 +3,3 @@
 **Charts never empty (SRC-9).** Scatter, bubble, heatmap and candlestick charts drew nothing when given the one-dimensional `values:` that every other kind accepts; they now derive their marks from it.
+
+As built, a chart with no data draws the axes of a cartesian chart (bar, line, area, combo, scatter, bubble, candlestick), the outline circle of a pie or donut, the baseline of a sparkline, the frame of a heatmap, funnel or treemap, and the empty grid of a radar chart. A candlestick chart derived from values labels each candle with the label of its closing value.
```
