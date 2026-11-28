---
title: "Appearance and devices"
spec_version: 0.12.12
status: draft
updated: 2026-11-27
page_id: REND.2
---

# Appearance and devices

Light and dark appearance, device sizes, the frame unit that scales a mockup to its column, device chrome and isolation from the host page.

### R-APP-001 — Appearance selection

`auto` is the natural default for a documentation site with a light/dark toggle; `both` is for
reviewing a screen's two modes together.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-APP-001.TC-1 — Appearance selection**

Python unit tests `python/tests/test_appearance.py` `AppearanceSelectionTests`: `APPEARANCES` is
light, dark, auto, both; each is accepted as a fence attribute, `appearance="dim"` is refused with
"appearance must be one of light, dark, auto, both", and `--appearance dim` is a CLI usage error (C1).
`@Screen(appearance: .dark)` renders dark unless the option says `light`; without either the
configured `default_appearance` applies, `light` by default (C2, V1). `@Screen(appearance: "dim")` gives
exactly the warning "unknown appearance 'dim'; using light" with code `appearance` and a light frame, as
does the option `sepia` (C3, V1). `light`, `dark` and `auto` render one frame with that
`data-appearance`; `both` renders two, light then dark (C4).
The conformance cases `appearance-*` and `diag-unknown-appearance` hold the same output in both
variants (IT-8, IT-10).

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

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-APP-002.TC-1 — Token rules per appearance**

Python unit tests `python/tests/test_appearance.py` `TokenTests`, for base, fluent and mui: the
stylesheet declares `color-scheme: light` and every light token on `.mkd-pack-<id> .mkd-frame` (C1);
`color-scheme: dark` and every token of the light set overridden by the dark set on
`…[data-appearance="dark"]` (C2), on `[data-md-color-scheme="slate"] … [data-appearance="auto"]` (C3)
and on `body:not([data-md-color-scheme]) … [data-appearance="auto"]` inside
`@media (prefers-color-scheme: dark)` (C4). An `auto` figure and the stylesheet hold no script (C5).

**R-APP-002.TC-2 — An auto frame follows the page**

Browser tests (Chromium) `typescript/tests/browser/appearance.spec.mjs`: `auto`, `light` and `dark`
frames rendered with the package's Node entry on a page without any script, with the base stylesheet.
With `data-md-color-scheme="default"` on the body the auto frame's `--mkd-bg` is base's light value;
setting the attribute to `slate` turns it to the dark value and its `color-scheme` to dark, while the
light frame stays light, and back (C3, C5, V1). Without the attribute the auto frame follows
`prefers-color-scheme` as the browser emulates light and dark; adding the attribute takes over (C4, C5).

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

**R-APP-003.TC-1 — Two cells from the same views**

Python unit tests `python/tests/test_appearance.py` `SideBySideTests`: a SwiftUI phone mockup with
`appearance="both"` renders a stage of two cells, the light frame labelled `Light` then the dark frame
labelled `Dark`, whose frame contents are identical (C1). `page.css` makes the stage a flex row with a
gap and each cell `flex: 1 1 0`, `min-width: 0` and its own inline-size container, so each frame
shrinks to its half (C2).

**R-APP-003.TC-2 — Side by side in a column**

Browser test (Chromium) `typescript/tests/browser/appearance.spec.mjs`: an `appearance="both"` phone
mockup in a 700 px column shows two frames of equal width and height on one row, light left of dark,
each at most and within 2 px of half the column minus the stage's gap, labelled Light and Dark (V1).

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

**R-DEV-001.TC-1 — Device forms, pack sizes and fit**

Python unit tests `python/tests/test_devices.py` `DeviceFormTests`: `DEVICES` holds exactly the six forms
of C1 with their sizes, and each renders without diagnostics as `--mkd-w`/`--mkd-h` with `data-device`
(C1). A site pack with `"sizes": {"phone": [390, 844], "watch": [198, 242]}` renders its phone 390 × 844
and its own `watch` form without a warning, while `base` keeps 393 × 852 and warns about `watch`; the
shipped `android` phone is 412 × 915 (C2, V1). `device="fit"` renders `data-fit="true"` and no size (C3).

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

With both `width` and `height` the size is fully given, so an unknown form name is kept as written
(it appears in `data-device`) and draws no warning.

**R-DEV-002.TC-1 — Device precedence, unknown forms, width and height**

Python unit tests `python/tests/test_devices.py` `DeviceSelectionTests`: the `device` option wins over
`@Screen(device: .phone)`, which wins over `default_device: tablet`, which wins over the pack's `device`
(`base` desktop, `android` phone, a site pack's `phone-landscape`) (C1, V1). `@Screen(device: .tv)`
warns "unknown device 'tv'; using desktop (known: phone, phone-landscape, tablet, tablet-portrait,
desktop, wide, fit)" with code `device` and renders a desktop, in the pack's own desktop size for `lisa`
(C2). `width=600` on a phone gives 600 × 852, `height=500` 393 × 500, both 600 × 500; with both given,
an unknown form is kept as named and not warned about (C2, C3, V1).

**Realizes.** F-10

| | Statement |
|---|---|
| C1 | The figure assembler MUST take the device form from the `device` fence attribute or render option, else from `@Screen(device:)`, else from the configured default device (`default_device`), else from the pack's default `device`. |
| C2 | If the device form is neither `fit`, a pack size nor a default size, and `width` and `height` are not both given, then the figure assembler MUST warn "unknown device 'x'; using desktop (known: …)" with code `device` and use `desktop`. |
| C3 | When both `width` and `height` are given, the frame MUST have exactly that size; when only one is given, it MUST replace that dimension of the device size. |
| V1 | A site with `default_device: tablet` renders a block with `@Screen(device: .phone)` as a phone and a block without any device as a tablet; `width=600` on a phone gives 600 × 852. |

---

### R-DEV-003 — Frame unit scaling

Scaling the whole frame with one unit keeps proportions exact: text, padding, radii and borders
shrink together, the way a screenshot would. The unit is capped at 1px so mockups are never
blown up beyond their real size.

**R-DEV-003.TC-1 — The frame unit rules**

Python unit tests `python/tests/test_devices.py` `FrameUnitTests`, on `shared/css/page.css`: the
`.mkd-frame` rule defines `--u: min(1px, calc(100cqw / var(--mkd-w, 1280)))` and sizes the frame
`var(--mkd-w) × var(--u)` by `var(--mkd-h) × var(--u)`, unscaled in the assembled stylesheet (C1, C2);
`[data-fit="true"]` sets `--u: 1px`, `max-content` width and automatic height, and the cell holding it
`max-width: 100%`, `overflow-x: auto` and no size container (C3); `.mkd-figure` and `.mkd-cell` are
`container-type: inline-size`, and a figure holds its frames in cells (C4).

**R-DEV-003.TC-2 — Frame scaling in a browser**

Chromium test `typescript/tests/browser/devices.spec.mjs`, mockups rendered by the package's Node entry
on a page without script: a desktop frame in a 640 px column measures 640 × 400 px and in a 1600 px or
1280 px column 1280 × 800 px, its text's padding and font size scaled by the same factor (C1, C2, V1);
with `appearance="both"` each phone frame fills its own cell at the phone's aspect ratio (C4); a `fit`
frame has `--u: 1px`, holds its content without overflow and keeps the same width in a 700 px and a
120 px column, the cell scrolling sideways (C3).

**Realizes.** F-10 · **Decisions.** ADR-7

| | Statement |
|---|---|
| C1 | The page stylesheet MUST define, on every frame with a device size, the frame unit `--u: min(1px, calc(100cqw / var(--mkd-w)))`, where `100cqw` is the width of the frame's cell, and MUST size the frame `var(--mkd-w) × var(--u)` wide and `var(--mkd-h) × var(--u)` tall. |
| C2 | A frame MUST therefore never be larger than its logical size and MUST shrink proportionally, as one picture, to fit a narrower column. |
| C3 | In `fit` mode the page stylesheet MUST set `--u: 1px` and size the frame to its content (`max-content`) with automatic height; a narrower column scrolls the cell (R-DEV-008.C1). |
| C4 | The figure and each cell MUST be CSS size containers (`container-type: inline-size`) so that `cqw` refers to the available column width, except a cell holding a `fit` frame, which sizes to its frame. |
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

**R-DEV-005.TC-1 — Chrome kinds, selection and markup**

Python unit tests `python/tests/test_devices.py` `ChromeTests`: every kind of C1 renders without
diagnostics (C1). The `chrome` option wins over `@Screen(chrome:)`, `auto` in either falls through, and
the pack's map gives `ios` for a SwiftUI phone, `ipados` for its tablet and `none` for an unmapped form
or an Android desktop (C2). `chrome="bogus"` and `@Screen(chrome: .bogus)` warn "unknown chrome 'bogus'
(known: …)" with code `chrome` and draw no chrome (C3). The parts of each kind: 9:41, the island,
cellular, Wi-Fi and battery icons and the home indicator for `ios`; the date, 100% and the home
indicator for `ipados`; status bar and handle for `android`; three traffic lights and the title for
`macos`; app icon, title and minimise, maximise, close for `windows`; lights, back, forward, reload, the
address (default `https://app.example.com`, the `url` option or `@Screen(url:)`) and the menu for
`browser` (C4, V1). Each kind's markup carries `mkd-chrome`, its part classes and its `data-chrome`, and
the base stylesheet styles the four part classes (C5).

**Realizes.** F-10

| | Statement |
|---|---|
| C1 | The chrome kinds MUST be `none`, `ios`, `ipados`, `macos`, `windows`, `android` and `browser`. |
| C2 | The figure assembler MUST take the chrome from the `chrome` option when it is not `auto`, else from `@Screen(chrome:)` when given and not `auto`, else from the pack's `chrome` map for the resolved device (none when unmapped). |
| C3 | If the chrome kind is unknown, then the figure assembler MUST warn "unknown chrome 'x' (known: …)" with code `chrome` and draw none. |
| C4 | `ios` MUST draw a status bar (time 9:41, dynamic island, cellular, Wi-Fi and battery icons) and a home indicator; `ipados` a status bar with date and battery percentage and a home indicator; `android` a status bar and a navigation handle; `macos` a title bar with traffic lights and the title (unified with the root's toolbar as R-DEV-010.C2 and C7 say); `windows` a title bar with app icon, title and minimise/maximise/close controls; `browser` a window bar with traffic lights, navigation buttons, an address field showing the `url` option, else `@Screen(url:)` (default `https://app.example.com`) and a menu button. |
| C5 | Chrome MUST be static markup with classes `mkd-chrome` and one of `mkd-chrome--status`, `mkd-chrome--titlebar`, `mkd-chrome--browser`, `mkd-chrome--home` (or a part class another requirement names, R-DEV-007, R-DEV-010) and `data-chrome=<kind>`, styled by the base pack and restyled by packs. |
| V1 | A SwiftUI phone mockup shows the iOS status bar and home indicator; `chrome="browser" url="https://shop.example.com"` shows that address. |

---

### R-DEV-006 — Isolation from the host page

Documentation themes style every `ul`, `table` and `code` in the content area; without isolation,
a list inside a mockup would gain the theme's bullets and margins.

**R-DEV-006.TC-1 — Isolation rules**

Python unit tests `python/tests/test_devices.py` `IsolationTests`, on `shared/css/page.css`: the frame
reset sets margin, padding, border, font, letter spacing, colour, background, maximum width and box
shadow for every HTML element the renderer writes inside a frame (the conformance corpus, SVG drawing
elements and table columns aside), boxes are `border-box` and tables collapse (C1); `.mkd-frame` is
`isolation: isolate`, `overflow: hidden` and `position: relative` (C2); every selector of `page.css` and
of the base, SwiftUI and Fluent stylesheets names a mockitdown class (C3).

**R-DEV-006.TC-2 — A mockup in a documentation page**

Chromium test `typescript/tests/browser/devices.spec.mjs`: a SwiftUI mockup with a label, text, code
block, keys, a table, a spreadsheet, a list, an icon, a toggle and a button, at `desktop` and at `fit`,
placed once on a bare page and once inside `<article class="md-typeset">` under host rules modelled on
Material's and Zensical's (typography, letter spacing, margins, list, table, code and key styling) and,
when the repository's `.venv` holds Zensical, under Zensical's own stylesheet: every element in the
frame has the same box (within half a pixel) and the same font, line height, letter spacing, colours,
box shadow, margin, padding, list style and text transform (C1, V1). An alert's layer lies inside the
frame, which is isolated and clips, and the page below the figure is not covered (C2).

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


**Re-checked at specification 0.12.10.** Re-read against R-DEV-001 (changed at 0.12.9: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).

**R-DEV-008.TC-1 — Fit frames keep their width and hold presentations**

Python and TypeScript: render `Alert`, `Dialog`, `Sheet`, `Popover`, `Toast`, `Tooltip` and `ConfirmationDialog` alone at `fit` in every shipped pack; browser test (Playwright) asserts the surface box is at least 200 × 80 (toast: at least its text width) and inside the frame. A `fit` mockup of eight captioned toggles in a 300 px wide host: frame width equals its scroll width, the cell's scrollWidth exceeds its clientWidth. Every element sample and variant of the gallery (R-WEB-004 TC-4) is checked the same way, open menus and pickers included. (`python/tests/test_fit.py`, `typescript/tests/browser/gallery-render.spec.mjs`.)

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

The status items follow macOS's own order (battery, Wi-Fi, Control Center, then the clock), and the
standard menus carry the items a SwiftUI app gets on macOS 26 for each placement, so a `CommandGroup`
edits exactly the group it names; an empty `CommandGroup(replacing:)` removes that group without
leaving a doubled separator. Only one menu is drawn open, because macOS shows only one at a time;
the title highlighted in the bar tells the reader which. A mistyped menu title or placement draws the
bar anyway, with a warning, so the mistake is visible rather than silently dropped.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-DEV-009.TC-1 — Menu bar and open menu**

Python and TypeScript render tests (conformance cases added to `shared/conformance/`): V1 source; assert the bar's items in order, the clock text, the open File menu's rows, shortcut glyphs, separator, disabled row and submenu chevron. Also: the option's spellings (`true`, empty, a title, `@Screen`, fence, CLI, element attribute) and the app name's defaults; `CommandGroup` replacing, before and after; `.open()` on a menu and on a submenu (cascading); a title naming no menu and an unknown placement warn with code `chrome`.

**R-DEV-009.TC-2 — Menu bar only with macOS chrome**

`menubar=true` with `device=phone` warns code `chrome` and draws no bar; with `device=desktop` the window's top edge is 24 points below the frame's top.

**Realizes.** F-10

| | Statement |
|---|---|
| C1 | The render option `menubar` (fence attribute `menubar`, CLI `--menubar`, `mockitdown-mockup` attribute `menubar`, `@Screen(menubar:)`) MUST accept `true`, `false` (default) or the title of a menu; any value other than `false` (an empty value, such as the attribute or the CLI flag given without one, included) MUST draw the macOS menu bar, and a title MUST additionally draw that menu open. |
| C2 | The menu bar MUST be drawn only with `macos` chrome; with any other chrome the renderer MUST ignore it and warn "menubar needs macOS chrome" with code `chrome`. |
| C3 | The menu bar MUST span the full width of the frame above the window, 24 points tall, translucent (`--mkd-menubar-bg`), and MUST hold, left to right: the Apple menu glyph, the application name in bold, the application's menus, a flexible gap, and the status items in macOS's order — battery, Wi-Fi, Control Center — and the clock `Mon Nov 23  9:41 AM` (fixed text, for deterministic output). |
| C4 | The application name MUST be the `app` option (fence attribute `app`, `@Screen(app:)`), defaulting to the window title, then `App`. |
| C5 | The application's menus MUST come from `.commands { … }` on the root view: `CommandMenu("T") { … }` adds menu T before Window; `CommandGroup(replacing:&#124;before:&#124;after: <placement>) { … }` edits a standard menu at the SwiftUI placement (`.appInfo`, `.appSettings`, `.systemServices`, `.appVisibility`, `.appTermination`, `.newItem`, `.saveItem`, `.importExport`, `.printItem`, `.undoRedo`, `.pasteboard`, `.textEditing`, `.textFormatting`, `.toolbar`, `.sidebar`, `.windowSize`, `.singleWindowList`, `.windowList`, `.windowArrangement`, `.help`). |
| C6 | Without `.commands`, and around its additions, the menu bar MUST show the standard menus App, File, Edit, View, Window and Help with macOS's standard items for each placement (for example File: New ⌘N, Open… ⌘O, Close ⌘W, Save ⌘S; Edit: Undo ⌘Z, Redo ⇧⌘Z, Cut ⌘X, Copy ⌘C, Paste ⌘V, Select All ⌘A; App: About <App>, Settings… ⌘,, Hide <App> ⌘H, Quit <App> ⌘Q). |
| C7 | An open menu MUST be drawn as a dropdown under its title (the title highlighted), overlapping the window, as a translucent rounded panel holding one row per item: `Button` (title; `.keyboardShortcut("k", modifiers: …)` drawn right-aligned as ⌃⌥⇧⌘ glyphs then the key, default modifier ⌘), `Divider` (separator), `Menu` (submenu: title and a trailing chevron), `Toggle` (checkmark when on), and `.disabled(true)` items greyed. |
| C8 | A `CommandMenu` or `Menu` inside `.commands` MAY carry `.open()` (or `isPresented: true`), which opens it like naming it in `menubar`; at most one menu bar menu MUST be drawn open (the first). |
| C9 | The menu bar MUST be part of the frame's height: at a fixed device the window MUST fill the frame below it, keeping its macOS 26 window form (R-DEV-010.C2: rounded corners, shadow, traffic lights, unified title bar) under the bar rather than on the frame's own edge. |
| C10 | A `menubar` title that names no menu MUST draw the bar with no menu open and warn "menubar names no menu" with the title and code `chrome`. |
| C11 | A `CommandGroup` without `replacing:`, `before:` or `after:`, or naming a placement not listed in C5, MUST be ignored with a warning of code `chrome`. |
| C12 | An open menu MAY draw a `Button`'s or `Menu`'s `systemImage` as an icon before its title, a `Section`'s title as a header row, and an open submenu (`.open()` on a `Menu` inside it) cascading beside its highlighted row. |
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


**Re-checked at specification 0.12.10.** Re-read against R-DEV-001 (changed at 0.12.9: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).

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

Some things keep their own colour whatever the theme — a terminal is dark, a video frame black, a sticky note's ink near-black on its paper — so those few declarations are fixed; everything else follows the pack's tokens. Corner radii are written once in the base stylesheet, and a pack that rounds differently overrides the rule.

**R-REND-011.TC-1 — The component roles**

Python unit tests `python/tests/test_component_roles.py` `ComponentRoleTests`: each role of C1 exists, `base` defines
its elements on it and every pack inherits them (C1); a spreadsheet draws column letters and row numbers, its values
with numbers marked for right alignment, the `A1:B1` selection with its border and its headers marked, the active cell,
the formula bar, a fill and sheet tabs, and no formula bar without `formula:` (C2, V1); a code block numbers its lines,
marks a highlighted line, and draws keyword, string, number, comment, function and type spans for swift, js, ts,
python, go, rust, json, sql, shell and html, and a terminal draws a window with prompts and commands apart from output
(C3); a gantt chart places bars on its scale, a zero-length task as a milestone, progress and today, and a schedule
places events in their day columns between its hours and draws now (C4, V2); a canvas places positioned children
absolutely (C5); the components' markup is the same in base, Fluent, Material UI, Carbon and Windows 95, and the base
stylesheet gives them colours only through tokens except the fixed colours C6 allows, and type only through tokens
except the formula bar's fx glyph (C6).

**Realizes.** F-8

| | Statement |
|---|---|
| C1 | The renderer MUST provide the roles spreadsheet, stickynote, board, boardcolumn, kanbancard, code, message, tree, treeitem, timeline, timelineitem, gantt, schedule, kbd, skeleton, swatches, canvas, media, emptystate, stat and map, and the base pack MUST name them Spreadsheet, StickyNote, Board, BoardColumn, KanbanCard, CodeEditor, CodeBlock, Terminal, MessageBubble, Comment, Tree, TreeItem, Timeline, TimelineItem, Gantt, Schedule, Kbd, Skeleton, ColorSwatches, Canvas, Whiteboard, VideoPlayer, EmptyState, Stat and Map, so every pack inherits them. |
| C2 | The spreadsheet role MUST draw column letters and row numbers, cell values from `rows:` (numbers right-aligned), the range named by `selection:` (A1 notation) with a border and tint and its row and column headers marked, the cell named by `active:`, a formula bar when `formula:` is given, cell fills from `highlight:` and sheet tabs from `sheets:`. |
| C3 | The code role MUST draw one line per source line with optional line numbers, the lines listed in `highlight:` marked, and keyword, string, number, comment, function and type spans for the languages swift, js/ts, python, go, rust, json, sql, shell and html; with `variant: terminal` it MUST draw a terminal window in which lines starting with a prompt are shown as commands. |
| C4 | The gantt role MUST place each task `(name, start, length[, progress])` on a scale of `scale:` columns, draw a zero-length task as a milestone and draw `today:` as a vertical line; the schedule role MUST place each event `(title, day, start hour, end hour[, colour])` in its day column between `startHour` and `endHour` and draw `now:` as a horizontal line. |
| C5 | The canvas role MUST be a positioned container in which children placed with `.position(x:y:)` (R-ANN-003) are laid out absolutely. |
| C6 | Component roles MUST take their colours and type from pack tokens so that every pack restyles them without new markup; a fixed colour is allowed only where the real thing does not follow the theme (the terminal and video surfaces, the sticky note's ink, avatar hues, white marks on a coloured ground, shadows), and radii are fixed in the base stylesheet, which a pack overrides. |
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
| 0.12.12 | 2026-11-27 | re-checked with the items it cites after the #81 audit: unaffected (#81) |
| 0.12.11 | 2026-11-27 | re-checked against R-DEV-001: unaffected (#81) |
| 0.12.10 | 2026-11-27 | as built: C6 fixed colours where the real thing keeps its colour, radii fixed in base; TC-1 verifies C1-C6 (#59) |
| 0.12.9 | 2026-11-27 | test cases backfilled: TC-1 verifies C1-C3 (#58); test cases backfilled: TC-1 rules, TC-2 a mockup in a documentation page, Chromium (#58); as built: C4 browser address also from @Screen(url:); C5 part classes of R-DEV-007 and R-DEV-010; TC-1 verifies C1-C5 (#58); as built: C2 warns only when width and height are not both given; TC-1 verifies C1-C3 (#58); as built: C3 a fit frame is not capped, its cell scrolls (R-DEV-008.C1); C4 a fit frame's cell is no size container; TC-1 rules, TC-2 Chromium measurements (#58) |
| 0.12.7 | 2026-11-27 | test cases backfilled: every C clause verified by a TC naming its tests (#56) |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.6 | 2026-11-27 | test cases name the split gallery specs (#50) (#53) |
| 0.8.11 | 2026-11-25 | as built (#14): empty menubar value draws the bar; status items in macOS order (battery, Wi-Fi, Control Center, clock); every SwiftUI command placement; warnings for an unknown menu title (C10) and placement (C11); icons, section headers and cascading submenus (C12) |
| 0.8.10 | 2026-11-25 | re-based on R-DEV-010@0.8.9: the window keeps its form below the menu bar |
| 0.8.9 | 2026-11-25 | as built: unified title bar rules (C7, C13), icon-only toolbar buttons sharing a glass capsule (C8, C14), macOS sidebar toggle and titles in the toolbar row (C9, C15, C16), windowed ignored without iPadOS chrome (C10), iPad toggle (C11), split column toolbar (C12), windowed on CLI and element (C4) (#13); as built: ipados draws a home indicator; macos title bar unified per R-DEV-010 (#13) |
| 0.8.8 | 2026-11-25 | C6: iPadOS 26 floating glass sidebar (review of #12) |
| 0.8.3 | 2026-11-25 | as built (#9): series: for scatter, bubble and heatmap (C8), gauge and all-zero pies (C9), bubble area proportional to size (C10); TC-3 counts polygons and polylines as marks |
| 0.8.1 | 2026-11-25 | as built (#8): toast at least its text's width, natural width unless the pack sets one (C6, C10); open menus and pickers in flow at fit (C7); fit dialog at least 240 x 80 (C8); sheet reaches the frame's sides and bottom (C9); V1 exempts packs whose own Alert is the framework's inline banner (antd, bootstrap, mui, shadcn) |
| 0.7.0 | 2026-11-25 | SRC-9: scatter, bubble, heatmap and candlestick derive marks from values; no silent empty chart |
| 0.2.1 | 2026-11-24 | As built: the implementation now matches the clauses; known-deviation note removed |
| 0.2.0 | 2026-11-24 | Page created |
| 0.12.11 | 2026-11-27 | re-checked against R-DEV-001: unaffected (#81) |
| 0.12.10 | 2026-11-27 | as built: C6 fixed colours where the real thing keeps its colour, radii fixed in base; TC-1 verifies C1-C6 (#59) |
| 0.12.9 | 2026-11-27 | test cases backfilled: TC-1 verifies C1-C3 (#58); test cases backfilled: TC-1 rules, TC-2 a mockup in a documentation page, Chromium (#58); as built: C4 browser address also from @Screen(url:); C5 part classes of R-DEV-007 and R-DEV-010; TC-1 verifies C1-C5 (#58); as built: C2 warns only when width and height are not both given; TC-1 verifies C1-C3 (#58); as built: C3 a fit frame is not capped, its cell scrolls (R-DEV-008.C1); C4 a fit frame's cell is no size container; TC-1 rules, TC-2 Chromium measurements (#58) |
| 0.12.7 | 2026-11-27 | test cases backfilled: every C clause verified by a TC naming its tests (#56) |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.6 | 2026-11-27 | test cases name the split gallery specs (#50) (#53) |
| 0.8.11 | 2026-11-25 | as built (#14): empty menubar value draws the bar; status items in macOS order (battery, Wi-Fi, Control Center, clock); every SwiftUI command placement; warnings for an unknown menu title (C10) and placement (C11); icons, section headers and cascading submenus (C12) |
| 0.8.10 | 2026-11-25 | re-based on R-DEV-010@0.8.9: the window keeps its form below the menu bar |
| 0.8.9 | 2026-11-25 | as built: unified title bar rules (C7, C13), icon-only toolbar buttons sharing a glass capsule (C8, C14), macOS sidebar toggle and titles in the toolbar row (C9, C15, C16), windowed ignored without iPadOS chrome (C10), iPad toggle (C11), split column toolbar (C12), windowed on CLI and element (C4) (#13); as built: ipados draws a home indicator; macos title bar unified per R-DEV-010 (#13) |
| 0.8.8 | 2026-11-25 | C6: iPadOS 26 floating glass sidebar (review of #12) |
| 0.8.3 | 2026-11-25 | as built (#9): series: for scatter, bubble and heatmap (C8), gauge and all-zero pies (C9), bubble area proportional to size (C10); TC-3 counts polygons and polylines as marks |
| 0.8.1 | 2026-11-25 | as built (#8): toast at least its text's width, natural width unless the pack sets one (C6, C10); open menus and pickers in flow at fit (C7); fit dialog at least 240 x 80 (C8); sheet reaches the frame's sides and bottom (C9); V1 exempts packs whose own Alert is the framework's inline banner (antd, bootstrap, mui, shadcn) |
| 0.7.0 | 2026-11-25 | SRC-9: scatter, bubble, heatmap and candlestick derive marks from values; no silent empty chart |
| 0.2.1 | 2026-11-24 | As built: the implementation now matches the clauses; known-deviation note removed |
| 0.2.0 | 2026-11-24 | Page created |
