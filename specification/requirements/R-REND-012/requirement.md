---
id: R-REND-012
title: Charts
status: active
version: 0.7.0
rev: 1
page: REND.2
slot: reqs
order: 999
source: [SRC-4, SRC-9]
realizes: [F-8]
reverse_engineered: true
hash: df4c22bb3688
---

C1: The chart role MUST render inline SVG for the kinds bar (vertical, `horizontal`, grouped for several series, `stacked`), histogram, line, area (`stacked`), combo (bars with the last series as a line), sparkline, pie, donut, scatter, bubble, radar, heatmap, funnel, treemap, gauge and candlestick, selected by `kind:` or by the base elements BarChart, LineChart, AreaChart, PieChart, DonutChart, ScatterChart, BubbleChart, RadarChart, Heatmap, FunnelChart, Treemap, GaugeChart, CandlestickChart, Histogram, ComboChart and Sparkline.
C2: Data MUST be accepted as `values:` (one series), `series:` (several; with `seriesNames:` for the legend), `labels:` (categories), `points:` (scatter/bubble `[x, y, size]`, candlestick `[open, high, low, close]`) and `matrix:` (heatmap rows, with `yLabels:`); SwiftUI `Chart { BarMark(x: .value(…), y: .value(…)) … }` MUST be read as the equivalent bar, line, area, pie or scatter data.
C3: Cartesian charts MUST draw value-axis ticks at rounded intervals, grid lines (unless `grid: false`), category labels and optional axis titles (`xLabel:`, `yLabel:`); a legend MUST be drawn when there are several named series.
C4: Each series MUST be coloured with the pack token `--mkd-chart-<n>` (n = 1…6, cycling), and every mark MUST expose its colour as `--mkd-series` so packs can restyle strokes per series; `.tint()` on a chart MUST recolour its first series.
C5: The chart MUST be drawn in a fixed logical canvas (`chartWidth`, `chartHeight`; default 360 × 200) that scales uniformly with its container.
C6: Given only `values:`, a scatter chart MUST plot the points (index, value), a bubble chart the same points with areas proportional to the values, a heatmap one row of cells shaded by value, and a candlestick chart one candle per value after the first (open = the previous value, close = the value, high and low 10% of the value range beyond them).
C7: A chart with no usable data MUST draw its axes or outline and warn "<Element> has no data" with code `chart`; it MUST NOT render an empty SVG silently.
V1: `BarChart(values: [1, 2], labels: ["a", "b"])` renders an SVG with two bars and the labels a and b.
V2: `PieChart(values: [3, 1])` renders two slices whose angles are 270° and 90°.
