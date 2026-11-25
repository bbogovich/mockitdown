# Charts

`Chart(kind: …)` — or a named element such as `BarChart`, `LineChart`, `PieChart` — draws the
chart as inline SVG in the pack's chart colours. Data is given as `values:` (one series),
`series:` (several, with `seriesNames:`), `labels:` for categories, `points:` for scatter, bubble and
candlestick data, and `matrix:` for heatmaps. SwiftUI's `Chart { BarMark(…) }` form works too.

```mockitdown device="fit" title="Cartesian charts" source="true"
Grid(columns: 2, spacing: 16) {
  BarChart(title: "Revenue by quarter", series: [[42, 51, 48, 63], [35, 39, 44, 52]],
           seriesNames: ["2026", "2025"], labels: ["Q1", "Q2", "Q3", "Q4"])
  BarChart(title: "Tickets by team", values: [42, 31, 18, 12], labels: ["Support", "Billing", "Mobile", "Web"],
           horizontal: true, showValues: true)
  LineChart(title: "Active users", subtitle: "Last 12 weeks", series: [[12, 14, 13, 17, 19, 18, 22, 24, 23, 27, 29, 31],
            [8, 9, 9, 11, 12, 12, 13, 15, 16, 17, 17, 19]], seriesNames: ["Web", "iOS"],
            labels: ["W1", "", "W3", "", "W5", "", "W7", "", "W9", "", "W11", ""])
  AreaChart(title: "Storage by type", series: [[2, 3, 3, 4, 5, 6], [1, 1, 2, 2, 3, 3], [1, 2, 2, 2, 2, 3]],
            seriesNames: ["Video", "Photos", "Docs"], labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], stacked: true)
  BarChart(title: "Stacked spend", series: [[5, 6, 7, 6], [3, 3, 4, 5], [2, 2, 2, 3]], seriesNames: ["Crew", "Gear", "Travel"],
           labels: ["Wk1", "Wk2", "Wk3", "Wk4"], stacked: true)
  ComboChart(title: "Orders and conversion", series: [[120, 150, 170, 160, 210, 240], [80, 95, 110, 100, 150, 170]],
             seriesNames: ["Visits (×10)", "Orders"], labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"])
}
.padding()
.frame(width: 820)
```

```mockitdown device="fit" title="Proportions and distributions" source="true" pack="mui"
Grid(columns: 3, spacing: 16) {
  PieChart(title: "Traffic sources", values: [48, 27, 15, 10], labels: ["Search", "Direct", "Social", "Email"])
  DonutChart(title: "Budget used", values: [68, 32], labels: ["Spent", "Left"], unit: "68%")
  GaugeChart(title: "Uptime", value: 99.2, min: 95, max: 100, unit: "%")
  ScatterChart(title: "Duration vs. rating", points: [[12, 3.9], [18, 4.2], [25, 4.4], [9, 3.1], [30, 4.8], [22, 3.7], [15, 4.0], [27, 4.1]])
  BubbleChart(title: "Markets", points: [[10, 40, 30], [25, 60, 80], [40, 35, 20], [55, 70, 55], [70, 50, 35]])
  RadarChart(title: "Skills", series: [[4, 3, 5, 2, 4], [3, 4, 3, 4, 3]], seriesNames: ["Ana", "Ben"],
             labels: ["Design", "Code", "Research", "Ops", "Writing"])
  Heatmap(title: "Commits by hour", matrix: [[1, 3, 5, 2, 0, 0], [2, 6, 8, 4, 1, 0], [0, 4, 9, 7, 2, 1], [1, 2, 4, 3, 1, 0], [0, 1, 2, 1, 0, 0]],
          labels: ["8", "10", "12", "14", "16", "18"], yLabels: ["Mon", "Tue", "Wed", "Thu", "Fri"])
  FunnelChart(title: "Sign-up funnel", values: [1200, 640, 310, 140], labels: ["Visited", "Started", "Verified", "Paid"])
  Treemap(title: "Disk usage", values: [42, 23, 15, 9, 6, 5], labels: ["Video", "Photos", "Apps", "Docs", "Mail", "Other"])
}
.padding()
.frame(width: 980)
```

```mockitdown device="fit" title="Finance and SwiftUI Charts" source="true" pack="swiftui"
HStack(spacing: 16) {
  CandlestickChart(title: "ACME · 1 week", points: [[100, 108, 98, 106], [106, 110, 101, 103], [103, 104, 95, 97],
                   [97, 105, 96, 104], [104, 112, 103, 111]], labels: ["Mon", "Tue", "Wed", "Thu", "Fri"])
  Chart {
    BarMark(x: .value("Day", "Mon"), y: .value("Steps", 6200))
    BarMark(x: .value("Day", "Tue"), y: .value("Steps", 8400))
    BarMark(x: .value("Day", "Wed"), y: .value("Steps", 7100))
    BarMark(x: .value("Day", "Thu"), y: .value("Steps", 9800))
    BarMark(x: .value("Day", "Fri"), y: .value("Steps", 5300))
  }
}
.padding()
.frame(width: 720)
```
