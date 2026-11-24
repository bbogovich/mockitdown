---
title: "Appearance and devices"
spec_version: 0.3.0
status: draft
updated: 2026-11-24
page_id: REND.2
---

# Appearance and devices

Light and dark appearance, device sizes, the frame unit that scales a mockup to its column, device chrome and isolation from the host page.

### R-APP-001 — Appearance selection

`auto` is the natural default for a documentation site with a light/dark toggle; `both` is for
reviewing a screen's two modes together.

**Realizes.** F-9 · **Decisions.** ADR-6

| | Statement |
|---|---|
| C1 | The appearance MUST be one of `light`, `dark`, `auto` and `both`. |
| C2 | The figure assembler MUST take the appearance from the `appearance` fence attribute or render option, else from `@Screen(appearance:)`, else from the configured default (`default_appearance`, default `light`). |
| C3 | If the resolved appearance is not one of the four, then the figure assembler MUST warn "unknown appearance 'x'; using light" with code `appearance` and render `light`. |
| C4 | When the appearance is `light`, `dark` or `auto`, the figure assembler MUST render one frame with that `data-appearance`; when it is `both`, two frames, `light` then `dark`. |
| V1 | `@Screen(appearance: .dark)` renders dark unless the fence says `appearance="light"`; `@Screen(appearance: "dim")` warns and renders light. |

---

### R-APP-002 — Token application by appearance

All appearance logic is in four generated rule sets per pack; pack CSS itself never branches on
appearance (R-PACK-007.C2). An `auto` frame on a Material/Zensical page follows the page's own
toggle rather than the operating system, because that is what the reader chose.

**Realizes.** F-9 · **Decisions.** ADR-6

| | Statement |
|---|---|
| C1 | The stylesheet assembler MUST declare a pack's light tokens, and `color-scheme: light`, on `.mkd-pack-<id> .mkd-frame`. |
| C2 | The stylesheet assembler MUST declare the pack's dark tokens — its light tokens overridden by its dark tokens — and `color-scheme: dark` on `.mkd-pack-<id> .mkd-frame[data-appearance="dark"]`. |
| C3 | The stylesheet assembler MUST declare the same dark tokens on `[data-md-color-scheme="slate"] .mkd-pack-<id> .mkd-frame[data-appearance="auto"]`, so an `auto` frame is dark on a Material or Zensical page whose palette is slate. |
| C4 | The stylesheet assembler MUST declare the same dark tokens on `body:not([data-md-color-scheme]) .mkd-pack-<id> .mkd-frame[data-appearance="auto"]` inside `@media (prefers-color-scheme: dark)`, so an `auto` frame follows the browser on a page without a Material palette attribute. |
| C5 | Appearance switching MUST need no JavaScript and no rebuild. |
| V1 | On a Zensical page, toggling the palette to slate turns an `auto` frame's `--mkd-bg` to the pack's dark value; a `light` frame stays light. |

---

### R-APP-003 — Side-by-side appearances

Both renderings come from one evaluation, so they are guaranteed to show the same state.

**Realizes.** F-9

| | Statement |
|---|---|
| C1 | When the appearance is `both`, the figure assembler MUST render the screen twice from the same evaluated views, in two cells labelled `Light` and `Dark`. |
| C2 | The page stylesheet MUST lay the cells out side by side, each shrinking its frame to half the column (minus the gap). |
| V1 | An `appearance="both"` phone mockup in a 700px column shows two phone frames of equal size. |

---

### R-DEV-001 — Device forms and sizes

The default sizes are current mainstream devices in points (CSS pixels): an iPhone-class phone, an
iPad-class tablet, a laptop and a wide desktop window. Packs adjust them to their platform.

**Realizes.** F-10

| | Statement |
|---|---|
| C1 | mockitdown MUST define these device forms with sizes in logical points (width × height): `phone` 393 × 852, `phone-landscape` 852 × 393, `tablet` 1180 × 820, `tablet-portrait` 820 × 1180, `desktop` 1280 × 800, `wide` 1440 × 900. |
| C2 | A pack's `sizes` MUST override these sizes, and MAY define further device forms, for that pack. |
| C3 | The device form `fit` MUST size the frame to its content instead of a fixed size. |
| V1 | `device="phone"` renders `--mkd-w:393;--mkd-h:852`; a pack with `"sizes": {"phone": [390, 844]}` renders `--mkd-w:390;--mkd-h:844`. |

---

### R-DEV-002 — Device selection

The site default sits between the block's own metadata and the pack's platform default.

**Realizes.** F-10

| | Statement |
|---|---|
| C1 | The figure assembler MUST take the device form from the `device` fence attribute or render option, else from `@Screen(device:)`, else from the configured default device (`default_device`), else from the pack's default `device`. |
| C2 | If the device form is neither `fit`, a pack size nor a default size, then the figure assembler MUST warn "unknown device 'x'; using desktop (known: …)" with code `device` and use `desktop`. |
| C3 | When both `width` and `height` are given, the frame MUST have exactly that size; when only one is given, it MUST replace that dimension of the device size. |
| V1 | A site with `default_device: tablet` renders a block with `@Screen(device: .phone)` as a phone and a block without any device as a tablet; `width=600` on a phone gives 600 × 852. |

---

### R-DEV-003 — Frame unit scaling

Scaling the whole frame with one unit keeps proportions exact: text, padding, radii and borders
shrink together, the way a screenshot would. The unit is capped at 1px so mockups are never
blown up beyond their real size.

**Realizes.** F-10 · **Decisions.** ADR-7

| | Statement |
|---|---|
| C1 | The page stylesheet MUST define, on every frame with a device size, the frame unit `--u: min(1px, calc(100cqw / var(--mkd-w)))`, where `100cqw` is the width of the frame's cell, and MUST size the frame `var(--mkd-w) × var(--u)` wide and `var(--mkd-h) × var(--u)` tall. |
| C2 | A frame MUST therefore never be larger than its logical size and MUST shrink proportionally, as one picture, to fit a narrower column. |
| C3 | In `fit` mode the page stylesheet MUST set `--u: 1px`, size the frame to its content (`max-content`, capped at the column width) with automatic height. |
| C4 | The figure and each cell MUST be CSS size containers (`container-type: inline-size`) so that `cqw` refers to the available column width. |
| V1 | A desktop frame (1280 points) in a 640px column renders 640px wide and 400px tall with all text and spacing halved; in a 1600px column it renders 1280px wide. |

---

### R-DEV-004 — Length rewriting

Pack authors write ordinary CSS in pixels — easy to compare with a framework's own specifications —
and the assembler makes it scale. Inline lengths from modifiers use the same unit (R-REND-004.C2).

**R-DEV-004.TC-1 — Stylesheet scales and scopes**

Automated by `tests/test_render.py::EvaluateRenderTests::test_stylesheet_scales_and_scopes`.

**Realizes.** F-10 · **Decisions.** ADR-7

| | Statement |
|---|---|
| C1 | When assembling the stylesheet, the stylesheet assembler MUST rewrite every `px` length in pack CSS and in token values whose absolute value exceeds 1 to `calc(N * var(--u))`, keeping N as written. |
| C2 | The stylesheet assembler MUST keep lengths of 1px or less unchanged, so hairlines stay crisp at every scale. |
| C3 | The stylesheet assembler MUST NOT rewrite a number that is part of an identifier, a hex colour or another unit. |
| C4 | The page stylesheet (`page.css`) MUST NOT be rewritten; its lengths are page lengths. |
| V1 | `padding: 12px 1px; border: 0.5px solid; width: 2.5px` becomes `padding: calc(12 * var(--u)) 1px; border: 0.5px solid; width: calc(2.5 * var(--u))`. |

---

### R-DEV-005 — Device chrome

Chrome puts the screen in context — a phone, a Windows app, a web page — without the author
drawing it. The fixed time and status icons make renderings reproducible.

**Realizes.** F-10

| | Statement |
|---|---|
| C1 | The chrome kinds MUST be `none`, `ios`, `ipados`, `macos`, `windows`, `android` and `browser`. |
| C2 | The figure assembler MUST take the chrome from the `chrome` option when it is not `auto`, else from `@Screen(chrome:)` when given and not `auto`, else from the pack's `chrome` map for the resolved device (none when unmapped). |
| C3 | If the chrome kind is unknown, then the figure assembler MUST warn "unknown chrome 'x' (known: …)" with code `chrome` and draw none. |
| C4 | `ios` MUST draw a status bar (time 9:41, dynamic island, cellular, Wi-Fi and battery icons) and a home indicator; `ipados` a status bar with date and battery percentage; `android` a status bar and a navigation handle; `macos` a title bar with traffic lights and the title; `windows` a title bar with app icon, title and minimise/maximise/close controls; `browser` a window bar with traffic lights, navigation buttons, an address field showing the `url` option (default `https://app.example.com`) and a menu button. |
| C5 | Chrome MUST be static markup with classes `mkd-chrome` and one of `mkd-chrome--status`, `mkd-chrome--titlebar`, `mkd-chrome--browser`, `mkd-chrome--home` and `data-chrome=<kind>`, styled by the base pack and restyled by packs. |
| V1 | A SwiftUI phone mockup shows the iOS status bar and home indicator; `chrome="browser" url="https://shop.example.com"` shows that address. |

---

### R-DEV-006 — Isolation from the host page

Documentation themes style every `ul`, `table` and `code` in the content area; without isolation,
a list inside a mockup would gain the theme's bullets and margins.

**Realizes.** F-8

| | Statement |
|---|---|
| C1 | The page stylesheet MUST reset, inside frames, the host typography and box model that documentation themes apply (for example Material's and Zensical's `.md-typeset` margins, list styles, table and code styling), so that a mockup renders the same on any site. |
| C2 | Every frame MUST establish its own stacking context and clip its content (`isolation: isolate`, `overflow: hidden`), so presentations and overlays stay inside the screen. |
| C3 | All mockitdown CSS MUST be scoped to mockitdown classes, so it never restyles the host page. |
| V1 | A mockup inside a Zensical page and the same mockup in `mockitdown render --standalone` output look the same. |

---

### R-REND-011 — Non-standard component roles

Real applications are full of components no UI kit ships — spreadsheets, boards, editors, chat threads, schedules. They are part of the core vocabulary so a mockup of any app can show them, styled by whichever pack is in use. The example site's *Beyond the framework kits* page exercises every one.

**Realizes.** F-8

| | Statement |
|---|---|
| C1 | The renderer MUST provide the roles spreadsheet, stickynote, board, boardcolumn, kanbancard, code, message, tree, treeitem, timeline, timelineitem, gantt, schedule, kbd, skeleton, swatches, canvas, media, emptystate, stat and map, and the base pack MUST name them Spreadsheet, StickyNote, Board, BoardColumn, KanbanCard, CodeEditor, CodeBlock, Terminal, MessageBubble, Comment, Tree, TreeItem, Timeline, TimelineItem, Gantt, Schedule, Kbd, Skeleton, ColorSwatches, Canvas, Whiteboard, VideoPlayer, EmptyState, Stat and Map, so every pack inherits them. |
| C2 | The spreadsheet role MUST draw column letters and row numbers, cell values from `rows:` (numbers right-aligned), the range named by `selection:` (A1 notation) with a border and tint and its row and column headers marked, the cell named by `active:`, a formula bar when `formula:` is given, cell fills from `highlight:` and sheet tabs from `sheets:`. |
| C3 | The code role MUST draw one line per source line with optional line numbers, the lines listed in `highlight:` marked, and keyword, string, number, comment, function and type spans for the languages swift, js/ts, python, go, rust, json, sql, shell and html; with `variant: terminal` it MUST draw a terminal window in which lines starting with a prompt are shown as commands. |
| C4 | The gantt role MUST place each task `(name, start, length[, progress])` on a scale of `scale:` columns, draw a zero-length task as a milestone and draw `today:` as a vertical line; the schedule role MUST place each event `(title, day, start hour, end hour[, colour])` in its day column between `startHour` and `endHour` and draw `now:` as a horizontal line. |
| C5 | The canvas role MUST be a positioned container in which children placed with `.position(x:y:)` (R-ANN-003) are laid out absolutely. |
| C6 | Component roles MUST take their colours, radii and type from pack tokens so that every pack restyles them without new markup. |
| V1 | `Spreadsheet(rows: [[1, 2]], selection: "A1:B1")` renders column headers A and B, row header 1, and both cells inside the selection. |
| V2 | `Gantt(scale: ["W1","W2"], tasks: [("A", 0, 1), ("M", 1, 0)])` renders one bar and one milestone. |

---

### R-REND-012 — Charts

Dashboards are among the most common mockup subjects. The chart engine draws the common chart types directly, so a mockup needs neither a chart library nor JavaScript, and charts follow the pack's palette in light and dark.

**Realizes.** F-8

| | Statement |
|---|---|
| C1 | The chart role MUST render inline SVG for the kinds bar (vertical, `horizontal`, grouped for several series, `stacked`), histogram, line, area (`stacked`), combo (bars with the last series as a line), sparkline, pie, donut, scatter, bubble, radar, heatmap, funnel, treemap, gauge and candlestick, selected by `kind:` or by the base elements BarChart, LineChart, AreaChart, PieChart, DonutChart, ScatterChart, BubbleChart, RadarChart, Heatmap, FunnelChart, Treemap, GaugeChart, CandlestickChart, Histogram, ComboChart and Sparkline. |
| C2 | Data MUST be accepted as `values:` (one series), `series:` (several; with `seriesNames:` for the legend), `labels:` (categories), `points:` (scatter/bubble `[x, y, size]`, candlestick `[open, high, low, close]`) and `matrix:` (heatmap rows, with `yLabels:`); SwiftUI `Chart { BarMark(x: .value(…), y: .value(…)) … }` MUST be read as the equivalent bar, line, area, pie or scatter data. |
| C3 | Cartesian charts MUST draw value-axis ticks at rounded intervals, grid lines (unless `grid: false`), category labels and optional axis titles (`xLabel:`, `yLabel:`); a legend MUST be drawn when there are several named series. |
| C4 | Each series MUST be coloured with the pack token `--mkd-chart-<n>` (n = 1…6, cycling), and every mark MUST expose its colour as `--mkd-series` so packs can restyle strokes per series; `.tint()` on a chart MUST recolour its first series. |
| C5 | The chart MUST be drawn in a fixed logical canvas (`chartWidth`, `chartHeight`; default 360 × 200) that scales uniformly with its container. |
| V1 | `BarChart(values: [1, 2], labels: ["a", "b"])` renders an SVG with two bars and the labels a and b. |
| V2 | `PieChart(values: [3, 1])` renders two slices whose angles are 270° and 90°. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.3.0 | 2026-11-24 | New R-REND-011: Non-standard component roles; New R-REND-012: Charts |
| 0.2.1 | 2026-11-24 | As built: the implementation now matches the clauses; known-deviation note removed |
| 0.2.0 | 2026-11-24 | Page created |
| 0.2.1 | 2026-11-24 | As built: the implementation now matches the clauses; known-deviation note removed |
| 0.2.0 | 2026-11-24 | Page created |
