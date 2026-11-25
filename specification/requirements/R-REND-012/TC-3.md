---
id: TC-3
title: Every kind draws marks from values
verifies: [C6, C7, C8, C9, C10]
---

Python and TypeScript render tests: for every kind of C1, `values: [3, 5, 2, 6, 4]` yields an SVG with at least one mark (`circle`, `rect`, `path`, `polygon` or `polyline` besides grid lines, axes and the gauge track); a chart with no data emits the `chart` warning (a gauge without a value does not); a bubble four times the size of another has twice its radius; the conformance cases `chart-bubble-series` and `chart-heatmap-series` cover `series:` (C8).
