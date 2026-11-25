---
id: R-REND-012.CR-1
target: R-REND-012
kind: revision
version: 0.7.0
date: 2026-11-25
summary: "SRC-9: scatter, bubble, heatmap and candlestick derive marks from values; no silent empty chart"
from: 2a020c95627d
to: df4c22bb3688
---

## Clauses

@ meta.source
- [SRC-4]
+ [SRC-4, SRC-9]
@ C6 insert after C5
+ Given only `values:`, a scatter chart MUST plot the points (index, value), a bubble chart the same points with areas proportional to the values, a heatmap one row of cells shaded by value, and a candlestick chart one candle per value after the first (open = the previous value, close = the value, high and low 10% of the value range beyond them).
@ C7 insert after C6
+ A chart with no usable data MUST draw its axes or outline and warn "<Element> has no data" with code `chart`; it MUST NOT render an empty SVG silently.

## Files

```diff
--- /dev/null
+++ b/TC-3.md
@@ -0,0 +1,7 @@
+---
+id: TC-3
+title: Every kind draws marks from values
+verifies: [C6, C7]
+---
+
+Python and TypeScript render tests: for every kind of C1, `values: [3, 5, 2, 6, 4]` yields an SVG with at least one mark (`circle`, `rect` or `path` besides axes); a chart with no data emits the `chart` warning.
--- a/prose.md
+++ b/prose.md
@@ -1 +1,3 @@
 Dashboards are among the most common mockup subjects. The chart engine draws the common chart types directly, so a mockup needs neither a chart library nor JavaScript, and charts follow the pack's palette in light and dark.
+
+**Charts never empty (SRC-9).** Scatter, bubble, heatmap and candlestick charts drew nothing when given the one-dimensional `values:` that every other kind accepts; they now derive their marks from it.
```
