---
title: "Appearance and devices"
spec_version: 0.8.9
status: draft
updated: 2026-11-25
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
| C4 | `ios` MUST draw a status bar (time 9:41, dynamic island, cellular, Wi-Fi and battery icons) and a home indicator; `ipados` a status bar with date and battery percentage and a home indicator; `android` a status bar and a navigation handle; `macos` a title bar with traffic lights and the title (unified with the root's toolbar as R-DEV-010.C2 and C7 say); `windows` a title bar with app icon, title and minimise/maximise/close controls; `browser` a window bar with traffic lights, navigation buttons, an address field showing the `url` option (default `https://app.example.com`) and a menu button. |
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

### R-DEV-008 — Fit frames: natural width and presentations

**Requires:** R-DEV-001

**Why.** A `fit` frame was squeezed to its host's width, so wide content (a row of variants) was
drawn over itself, and presentation layers — absolutely positioned over a screen that had no size of
its own — collapsed to a small square (SRC-9#images, SRC-9#scroll).

**What changes.** A `fit` frame is exactly as large as its content, presentations included; when the
page column is narrower, the reader scrolls sideways instead of seeing a squeezed picture.

**As built.** At `fit` the screen that holds a presentation layer becomes a one-column grid: its
content takes the first rows and every layer spans all of them, so the grid — and the frame — is as
large as the larger of the two. The layer is not positioned there, which makes the screen the scrim's
containing block, so the scrim covers the whole screen. A sheet bleeds over the fit screen's padding
(the `--mkd-fit-padding` token, 16 points unless a pack sets it) to reach the frame's edges. A
tooltip's bubble is laid out beside its anchor in a small grid at `fit` (above it for `top`, below for
`bottom`, after it for `trailing`); elsewhere it stays positioned over the content. The arrow is an
element of the bubble (`mkd-tooltip__arrow`); a pack that draws its own (`::after`) hides it. Toasts
keep a pack's framework width where it has one (Material snackbars' 288 or 344 points, Bootstrap's
350) — never narrower than the text.

**R-DEV-008.TC-1 — Fit frames keep their width and hold presentations**

Python and TypeScript: render `Alert`, `Dialog`, `Sheet`, `Popover`, `Toast`, `Tooltip` and `ConfirmationDialog` alone at `fit` in every shipped pack; browser test (Playwright) asserts the surface box is at least 200 × 80 (toast: at least its text width) and inside the frame. A `fit` mockup of eight captioned toggles in a 300 px wide host: frame width equals its scroll width, the cell's scrollWidth exceeds its clientWidth. Every element sample and variant of the gallery (R-WEB-004 TC-4) is checked the same way, open menus and pickers included. (`python/tests/test_fit.py`, `typescript/tests/browser/gallery.spec.mjs`.)

**R-DEV-008.TC-2 — Sheet and tooltip at fit**

Browser test: a lone `Sheet` at `fit` is ≥ 240 points tall with a grabber and ≥ 48 points of scrim above; a lone `Tooltip` shows anchor and bubble, the bubble's box not clipped by the frame and the arrow on the anchor's side.

**Realizes.** F-8, F-10

| | Statement |
|---|---|
| C1 | At device `fit`, the frame MUST take the max-content width and height of its content and MUST NOT be squeezed or scaled by a narrower host; the figure cell MUST then scroll horizontally (`overflow-x: auto`). |
| C2 | At device `fit`, a presentation layer (`alert`, `action-sheet`, `dialog`, `sheet`, `popover`, `inspector`, `cover`, `toast`, `tooltip`) MUST contribute to the frame's size, so that the frame is at least the presented surface plus the layer's padding, and its scrim MUST cover the whole frame. |
| C3 | An element whose role presents a surface (dialog, alert, sheet, popover, toast, tooltip), written on its own rather than as a presentation modifier, MUST render the same surface as its presented form, with title, content and actions. |
| C4 | At device `fit`, a sheet MUST be drawn at least 240 points tall with its grabber, its content, and a band of dimmed backdrop at least 48 points tall above it. |
| C5 | A tooltip MUST render its anchor (the element's content, or a placeholder button when it has none) with the tooltip bubble beside it, the bubble's arrow pointing at the anchor, neither clipped by the frame. |
| C6 | A toast MUST be drawn at least as wide as its text's natural width (up to the frame's width) and at least one line tall. |
| C7 | At device `fit`, an open menu or picker written directly in the screen or in a vertical stack MUST lay out its popup in flow, so that the frame holds it. |
| C8 | At device `fit`, a dialog surface MUST be at least 240 points wide and 80 points tall. |
| C9 | At device `fit`, a sheet MUST reach the frame's sides and bottom. |
| C10 | A toast in a pack that sets no toast width MUST be drawn at its text's natural width; a pack MAY keep its framework's minimum or fixed toast width. |
| V1 | In every shipped pack whose `Alert` presents a dialog (a pack's own `Alert` that is its framework's inline banner, as in antd, bootstrap, mui and shadcn, is an `alert` role and exempt), `Alert("Title") { Text("Content"); Button("Action") }` at `fit` renders a dialog at least 200 × 80 points containing the title and the action; a `fit` HStack of eight `Toggle("Label")` in a 300-pixel host keeps its natural width and the host scrolls. |

---

### R-DEV-009 — The macOS menu bar

**Requires:** R-DEV-010

On the Mac, the menu bar's titles and commands are designed text and part of the application's
interface (SRC-9). It is an option because most screens are reviewed without it. Menus are declared
the SwiftUI way, with `.commands`, so the mockup reads like the app's own code.

```swift
import SwiftUI
@Screen(app: "Notes", menubar: "File")
NavigationSplitView { … } detail: { … }
  .commands {
    CommandGroup(after: .newItem) { Button("New Folder").keyboardShortcut("n", modifiers: [.shift, .command]) }
    CommandMenu("Format") { Button("Bold").keyboardShortcut("b"); Divider(); Toggle("Show Ruler", isOn: true) }
  }
```

**R-DEV-009.TC-1 — Menu bar and open menu**

Python and TypeScript render tests (conformance cases added to `shared/conformance/`): V1 source; assert the bar's items in order, the clock text, the open File menu's rows, shortcut glyphs, separator, disabled row and submenu chevron.

**R-DEV-009.TC-2 — Menu bar only with macOS chrome**

`menubar=true` with `device=phone` warns code `chrome` and draws no bar; with `device=desktop` the window's top edge is 24 points below the frame's top.

**Realizes.** F-10

| | Statement |
|---|---|
| C1 | The render option `menubar` (fence attribute `menubar`, CLI `--menubar`, `mockitdown-mockup` attribute `menubar`, `@Screen(menubar:)`) MUST accept `true`, `false` (default) or the title of a menu; any value other than `false` MUST draw the macOS menu bar, and a title MUST additionally draw that menu open. |
| C2 | The menu bar MUST be drawn only with `macos` chrome; with any other chrome the renderer MUST ignore it and warn "menubar needs macOS chrome" with code `chrome`. |
| C3 | The menu bar MUST span the full width of the frame above the window, 24 points tall, translucent (`--mkd-menubar-bg`), and MUST hold, left to right: the Apple menu glyph, the application name in bold, the application's menus, a flexible gap, and the status items Control Center, Wi-Fi, battery and the clock `Mon Nov 23  9:41 AM` (fixed text, for deterministic output). |
| C4 | The application name MUST be the `app` option (fence attribute `app`, `@Screen(app:)`), defaulting to the window title, then `App`. |
| C5 | The application's menus MUST come from `.commands { … }` on the root view: `CommandMenu("T") { … }` adds menu T before Window; `CommandGroup(replacing:&#124;before:&#124;after: <placement>) { … }` edits a standard menu at the SwiftUI placement (`.appInfo`, `.appSettings`, `.newItem`, `.saveItem`, `.printItem`, `.undoRedo`, `.pasteboard`, `.textEditing`, `.sidebar`, `.toolbar`, `.windowSize`, `.windowArrangement`, `.help`). |
| C6 | Without `.commands`, and around its additions, the menu bar MUST show the standard menus App, File, Edit, View, Window and Help with macOS's standard items for each placement (for example File: New ⌘N, Open… ⌘O, Close ⌘W, Save ⌘S; Edit: Undo ⌘Z, Redo ⇧⌘Z, Cut ⌘X, Copy ⌘C, Paste ⌘V, Select All ⌘A; App: About <App>, Settings… ⌘,, Hide <App> ⌘H, Quit <App> ⌘Q). |
| C7 | An open menu MUST be drawn as a dropdown under its title (the title highlighted), overlapping the window, as a translucent rounded panel holding one row per item: `Button` (title; `.keyboardShortcut("k", modifiers: …)` drawn right-aligned as ⌃⌥⇧⌘ glyphs then the key, default modifier ⌘), `Divider` (separator), `Menu` (submenu: title and a trailing chevron), `Toggle` (checkmark when on), and `.disabled(true)` items greyed. |
| C8 | A `CommandMenu` or `Menu` inside `.commands` MAY carry `.open()` (or `isPresented: true`), which opens it like naming it in `menubar`; at most one menu bar menu MUST be drawn open (the first). |
| C9 | The menu bar MUST be part of the frame's height: at a fixed device the window MUST fill the frame below it. |
| V1 | `menubar="File"` on a desktop SwiftUI mockup with `.commands { CommandMenu("Shapes") { Button("Circle").keyboardShortcut("c", modifiers: [.shift, .command]) } }` renders the bar with App…File, Edit, View, Shapes, Window, Help, the clock, and an open File menu whose first row is New with ⌘N. |

---

### R-DEV-010 — Multi-platform chrome for SwiftUI

**Requires:** R-DEV-001

SwiftUI runs on iPhone, iPad and Mac, and one source often serves all three (SRC-9). Each form gets
its platform's chrome, and the shared containers adapt as SwiftUI adapts them.

On a Mac the window's title bar becomes the root view's toolbar row, as in macOS 26: a navigation stack's bar, a
split view's columns or a sidebar-adaptable tab view run up to the top edge with the traffic lights floating over
their leading end; a plain view's `.navigationTitle` and `.toolbar` are drawn in the title bar itself. A view without
either keeps the classic centred window title. The sidebar's own title is the window's: macOS shows it in the
toolbar, not in the sidebar.

`windowed` shows how an iPad app looks in iPadOS 26's windowing: the app's window, with its traffic lights, over
the wallpaper. It means nothing for other chrome, so the renderer warns rather than guessing.

**R-DEV-010.TC-1 — Chrome per form**

Python and TypeScript render tests: the V1 source at phone, tablet and desktop; assert `data-chrome` ios/ipados/macos, the floating sidebar at desktop and tablet (C6) and the collapsed stack at phone; browser screenshot reviewed manually (TC-M1).

**R-DEV-010.TC-2 — Windowed iPad app**

`windowed=true device=tablet` renders the window with traffic lights inset over the wallpaper.

**R-DEV-010.TC-M1 — Visual comparison with Apple's platforms**

TC-M: compare phone, tablet and desktop renders with iOS 26, iPadOS 26 and macOS 26 screenshots from Apple's Human Interface Guidelines.

**Realizes.** F-10

| | Statement |
|---|---|
| C1 | The `swiftui` pack MUST draw `phone` forms in iOS 26 chrome (status bar with time, Dynamic Island, cellular, Wi-Fi and battery; home indicator), `tablet` forms in iPadOS 26 chrome (status bar with time and date, Wi-Fi, battery percentage; home indicator) and `desktop` and `wide` forms in macOS 26 chrome. |
| C2 | macOS 26 chrome MUST draw a window with rounded corners (`--mkd-window-radius`, 16 points), a shadow, and traffic lights 12 points in diameter; when the root view has a toolbar or navigation title, the title bar MUST be unified with it — title leading after the traffic lights, toolbar items trailing as Liquid Glass capsules — otherwise a centred title. |
| C3 | With `macos` chrome, a `NavigationSplitView`'s sidebar MUST be drawn as the macOS 26 floating sidebar (an inset rounded translucent panel running under the title bar, the traffic lights over it) with a sidebar toggle button in the toolbar. |
| C4 | The render option `windowed` (fence attribute `windowed`, CLI `--windowed`, `mockitdown-mockup` attribute `windowed`, `@Screen(windowed:)`) with `ipados` chrome MUST draw an iPadOS 26 app window — rounded corners, traffic lights at its top leading corner — over a wallpaper (`--mkd-wallpaper`), inset from the frame, the status bar and home indicator drawn over the wallpaper. |
| C5 | The `swiftui` pack SHOULD adapt shared elements to the form: `NavigationSplitView` collapses to its sidebar in a `NavigationStack` on a phone; `TabView(.sidebarAdaptable)` shows a sidebar on tablet and desktop; `Form` (automatic) uses the grouped style on phone and tablet and the columns style on desktop. |
| C6 | With `ipados` chrome, a `NavigationSplitView`'s sidebar MUST be drawn as the iPadOS 26 floating sidebar: an inset, rounded Liquid Glass panel over the detail's background, with the sidebar's title and rows inside it and a sidebar toggle button in the toolbar. |
| C7 | The title bar MUST be unified with the root's own toolbar row — the traffic lights drawn over its leading end — when the root view is a `NavigationStack` whose content has a `.navigationTitle` or `.toolbar`, a `NavigationSplitView`, or a `.sidebarAdaptable` `TabView`. |
| C8 | With `macos` or `ipados` chrome, a toolbar button that has an icon MUST show only its icon. |
| C9 | With `macos` chrome, the sidebar toggle MUST stand at the trailing end of the sidebar's part of the toolbar row. |
| C10 | With any chrome other than `ipados`, the renderer MUST ignore `windowed` and warn "windowed needs iPadOS chrome; ignored" with code `chrome`. |
| C11 | With `ipados` chrome, the sidebar toggle MUST be a Liquid Glass circle at the sidebar's top leading corner, beside the traffic lights when `windowed`. |
| C12 | A `NavigationSplitView` column that is not a `NavigationStack` MUST draw its `.toolbar` items in its header, trailing its title. |
| C13 | For any other root view carrying `.navigationTitle` or `.toolbar`, the macOS title bar MUST be 52 points tall and draw that title leading after the traffic lights, in place of the window title, and the toolbar items trailing. |
| C14 | With `macos` or `ipados` chrome, adjacent toolbar buttons MUST share one Liquid Glass capsule. |
| C15 | With `macos` chrome, the sidebar's own navigation title MUST be drawn leading in the toolbar row beside the sidebar when no other column has a title, and not inside the sidebar. |
| C16 | With `macos` chrome, the titles of the columns after the sidebar MUST be drawn leading in the toolbar row. |
| V1 | The same `NavigationSplitView` source renders with an iOS status bar at `phone`, an iPadOS status bar at `tablet` and a macOS window with a floating sidebar at `desktop`. |

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

**Charts never empty (SRC-9).** Scatter, bubble, heatmap and candlestick charts drew nothing when given the one-dimensional `values:` that every other kind accepts; they now derive their marks from it.

As built, a chart with no data draws the axes of a cartesian chart (bar, line, area, combo, scatter, bubble, candlestick), the outline circle of a pie or donut, the baseline of a sparkline, the frame of a heatmap, funnel or treemap, and the empty grid of a radar chart. A candlestick chart derived from values labels each candle with the label of its closing value.

**R-REND-012.TC-3 — Every kind draws marks from values**

Python and TypeScript render tests: for every kind of C1, `values: [3, 5, 2, 6, 4]` yields an SVG with at least one mark (`circle`, `rect`, `path`, `polygon` or `polyline` besides grid lines, axes and the gauge track); a chart with no data emits the `chart` warning (a gauge without a value does not); a bubble four times the size of another has twice its radius; the conformance cases `chart-bubble-series` and `chart-heatmap-series` cover `series:` (C8).

**Realizes.** F-8

| | Statement |
|---|---|
| C1 | The chart role MUST render inline SVG for the kinds bar (vertical, `horizontal`, grouped for several series, `stacked`), histogram, line, area (`stacked`), combo (bars with the last series as a line), sparkline, pie, donut, scatter, bubble, radar, heatmap, funnel, treemap, gauge and candlestick, selected by `kind:` or by the base elements BarChart, LineChart, AreaChart, PieChart, DonutChart, ScatterChart, BubbleChart, RadarChart, Heatmap, FunnelChart, Treemap, GaugeChart, CandlestickChart, Histogram, ComboChart and Sparkline. |
| C2 | Data MUST be accepted as `values:` (one series), `series:` (several; with `seriesNames:` for the legend), `labels:` (categories), `points:` (scatter/bubble `[x, y, size]`, candlestick `[open, high, low, close]`) and `matrix:` (heatmap rows, with `yLabels:`); SwiftUI `Chart { BarMark(x: .value(…), y: .value(…)) … }` MUST be read as the equivalent bar, line, area, pie or scatter data. |
| C3 | Cartesian charts MUST draw value-axis ticks at rounded intervals, grid lines (unless `grid: false`), category labels and optional axis titles (`xLabel:`, `yLabel:`); a legend MUST be drawn when there are several named series. |
| C4 | Each series MUST be coloured with the pack token `--mkd-chart-<n>` (n = 1…6, cycling), and every mark MUST expose its colour as `--mkd-series` so packs can restyle strokes per series; `.tint()` on a chart MUST recolour its first series. |
| C5 | The chart MUST be drawn in a fixed logical canvas (`chartWidth`, `chartHeight`; default 360 × 200) that scales uniformly with its container. |
| C6 | Given only `values:`, a scatter chart MUST plot the points (index, value), a bubble chart the same points with areas proportional to the values, a heatmap one row of cells shaded by value, and a candlestick chart one candle per value after the first (open = the previous value, close = the value, high and low 10% of the value range beyond them). |
| C7 | A chart with no usable data MUST draw its axes or outline and warn "<Element> has no data" with code `chart`; it MUST NOT render an empty SVG silently. |
| C8 | Given `series:` instead of `values:`, a scatter or bubble chart MUST plot each series as in C6 in its own colour, and a heatmap MUST draw one row of cells per series. |
| C9 | A gauge chart without `value:` MUST draw its minimum and MUST NOT be treated as a chart with no data; a pie, donut or treemap whose values are all zero or negative has no usable data. |
| C10 | A bubble's area MUST be proportional to its size (the third element of a point, or the value under C6). |
| V1 | `BarChart(values: [1, 2], labels: ["a", "b"])` renders an SVG with two bars and the labels a and b. |
| V2 | `PieChart(values: [3, 1])` renders two slices whose angles are 270° and 90°. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.8.9 | 2026-11-25 | as built: unified title bar rules (C7, C13), icon-only toolbar buttons sharing a glass capsule (C8, C14), macOS sidebar toggle and titles in the toolbar row (C9, C15, C16), windowed ignored without iPadOS chrome (C10), iPad toggle (C11), split column toolbar (C12), windowed on CLI and element (C4) (#13); as built: ipados draws a home indicator; macos title bar unified per R-DEV-010 (#13) |
| 0.8.8 | 2026-11-25 | C6: iPadOS 26 floating glass sidebar (review of #12) |
| 0.8.3 | 2026-11-25 | as built (#9): series: for scatter, bubble and heatmap (C8), gauge and all-zero pies (C9), bubble area proportional to size (C10); TC-3 counts polygons and polylines as marks |
| 0.8.1 | 2026-11-25 | as built (#8): toast at least its text's width, natural width unless the pack sets one (C6, C10); open menus and pickers in flow at fit (C7); fit dialog at least 240 x 80 (C8); sheet reaches the frame's sides and bottom (C9); V1 exempts packs whose own Alert is the framework's inline banner (antd, bootstrap, mui, shadcn) |
| 0.7.0 | 2026-11-25 | New R-DEV-009: The macOS menu bar; SRC-9: scatter, bubble, heatmap and candlestick derive marks from values; no silent empty chart |
| 0.3.0 | 2026-11-24 | New R-REND-011: Non-standard component roles |
| 0.2.1 | 2026-11-24 | As built: the implementation now matches the clauses; known-deviation note removed |
| 0.2.0 | 2026-11-24 | Page created |
| 0.8.8 | 2026-11-25 | C6: iPadOS 26 floating glass sidebar (review of #12) |
| 0.8.3 | 2026-11-25 | as built (#9): series: for scatter, bubble and heatmap (C8), gauge and all-zero pies (C9), bubble area proportional to size (C10); TC-3 counts polygons and polylines as marks |
| 0.8.1 | 2026-11-25 | as built (#8): toast at least its text's width, natural width unless the pack sets one (C6, C10); open menus and pickers in flow at fit (C7); fit dialog at least 240 x 80 (C8); sheet reaches the frame's sides and bottom (C9); V1 exempts packs whose own Alert is the framework's inline banner (antd, bootstrap, mui, shadcn) |
| 0.7.0 | 2026-11-25 | New R-DEV-009: The macOS menu bar; SRC-9: scatter, bubble, heatmap and candlestick derive marks from values; no silent empty chart |
| 0.3.0 | 2026-11-24 | New R-REND-011: Non-standard component roles |
| 0.2.1 | 2026-11-24 | As built: the implementation now matches the clauses; known-deviation note removed |
| 0.2.0 | 2026-11-24 | Page created |
