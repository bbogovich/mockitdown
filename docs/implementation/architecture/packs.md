---
title: Packs
impl_version: 0.3.23
status: draft
updated: 2026-11-27
page_id: IMPL.PACKS
---

# Packs

Realizes **A-PACK-1** (registry) and **A-PACK-2** (built-in packs); requirements R-PACK-001 –
R-PACK-009, R-PACK-014, R-PACK-015, R-PACK-018 (C8 here, the rest in the builds), R-DEV-009 and R-DEV-010.

## `PackRegistry` — `packs/__init__.py`

- `PackRegistry(extra_dirs)` searches `extra_dirs` then `BUILTIN_DIR` (the `packs/` package
  directory). `registry(extra_dirs)` is an `lru_cache`d factory so the fence, the extension and the
  CLI share one registry per set of directories.
- `get(id)` loads `pack.json`, loads the parent first (default `base`), merges `elements`,
  `modifiers`, `chrome`, `sizes`, `icons` and per-mode `tokens` over the parent's, records
  `own_elements`, and caches the `Pack` (M-PACK-1). `_element` builds each `ElementDef` (M-PACK-2)
  and rejects a missing `role`.
- A pack found in an `extra_dirs` (`pack_paths`) directory whose `pack.css` holds `@import` outside a
  comment is refused before its `pack.json` is read (`_refuse_import`, R-PACK-018.C8): partials are
  resolved only when a built-in pack is copied. TypeScript's `registerPack` refuses the same way.
- `ids()` lists pack directories; `for_module(name)` builds a lower-cased module index on first use.
- `Pack.lineage()` (root first), `Pack.font(name)` (alias lookup up the lineage),
  `Pack.chrome_for(device)`, `Pack.css_text()`.

## Built-in packs — `packs/<id>/`

| Directory | Contents |
|---|---|
| `base/` | the core vocabulary (90 elements), base tokens, generic modifier maps, the structural CSS of every role (`pack.css`, ~650 lines) |
| `swiftui/`, `fluent/`, `mui/`, `angular-material/`, `sapui5/`, `bootstrap/`, `shadcn/` | framework packs (R-PACK-008), each `extends` base |

The packs are written only in `shared/packs/<id>/` (R-REPO-002.C1). The Python build copies them
into `python/src/mockitdown/packs/<id>/`, where `BUILTIN_DIR` finds them, and ships them as package
data (`python/pyproject.toml` `[tool.setuptools.package-data]`: `packs/*/pack.json`,
`packs/*/pack.css`). Edit `shared/`, then reinstall or run `python/tools/sync_shared.py`. A built-in
`pack.css` may include stylesheet partials from `shared/packs/_partials/`; its package copy has them
resolved (see [Repository layout and shared assets](../repository.md#stylesheet-partials-r-pack-018)).

## SwiftUI control styles — `shared/packs/swiftui/pack.css` (R-PACK-014)

The last block of the SwiftUI `pack.css` styles each control style of R-PACK-014 by `data-el` and
`data-variant` (one sub-block per element, after the general rules so it takes precedence); the
`base` `pack.css` holds the structural rules of the parts it needs (`.mkd-wheel`, the gauge bounds and
marker, the date picker stepper, the control group menu button) so the markup renders in every pack.
`pack.json` sets the defaults the clauses name — `Gauge` `.automatic`, `ControlGroup` and
`DatePicker` `.automatic` — maps `.tag(…)` to the `tag` attribute (C11), gives `ControlGroup` a
`label` parameter and declares the samples (a `Gauge` with bounds, a `List(selection:)`).

| Element | Styles drawn by CSS | Markup from the renderer |
|---|---|---|
| ControlGroup | joined glass capsule; icon-only capsule (labels hidden); palette of borderless circles | `.compactMenu`/`.menu`: `.mkd-toolbar__menu` (label and icon, or the ellipsis; chevron for `.menu`) |
| DatePicker | grey capsules; graphical calendar with filled accent selection, columns ≥ 38 pt; wheel band | date/time capsules, `.mkd-wheel` columns, `11/23/2026, 9:41 AM` field, `.mkd-datepicker__stepper` |
| Form | inset grouped (existing); `.columns`: a subgrid of trailing labels and leading controls, toggles as checkboxes, a filled text field labelled by `attr(aria-label)` | `aria-label` on a filled `TextField` |
| Gauge | linear grid (label/value, min/track/max); `.linearCapacity`, `.accessoryLinearCapacity` heights; `.accessoryLinear` gradient track and dot | open 240° arc (`data-open`), `.mkd-progress__marker`, `__min`/`__max` |
| List | grouped hairlines; inset on `surface-2`; plain separators; sidebar source list (accent selection, macOS translucent with tinted selection); bordered box with alternating rows | `data-selected` on the selected row's wrapper |
| Picker | label leading and accent value with up-down chevron; inline rows with checkmark; macOS radio group; palette highlight | `.mkd-wheel` (role `wheel`), palette through `r_segmented`, first option by default, tagged options |
| Toggle, Button | 51 × 31 switch, tinted button, checkbox; translucent glass capsules with a light edge | — |

## SwiftUI presentations and navigation — `shared/packs/swiftui/pack.css` (R-PACK-015)

The presentation and navigation blocks of the SwiftUI `pack.css` draw:

| Element | CSS |
|---|---|
| Alert | glass card 300 wide, `--mkd-radius-alert` (34 px, a pack token), bold centred title and message; actions as 48-pixel grey capsules, side by side for two (cancel first), stacked for three or more (cancel last); destructive red, prominent accent |
| ConfirmationDialog | phone: the header, message and rows as one glass panel (28-pixel corners, hairline rows), the cancel action as its own glass capsule below; with `ipados` or `macos` chrome the alert selector applies (`:is(.mkd-dialog[data-variant="alert"], .mkd-frame:is([data-chrome="macos"], [data-chrome="ipados"]) .mkd-dialog[data-variant="action-sheet"])`) and the phone rules are limited to other chrome |
| Popover | glass bubble, no dimming (transparent scrim), `.mkd-dialog__arrow` / `.mkd-presented__arrow` as a clipped triangle above it |
| Sheet | a grid: title between the first action (leading) and the last (trailing, accent) as glass capsules (`.mkd-dialog__actions { display: contents }`), the content as a grouped section |
| Tab alone | `[data-standalone="true"]`: the tab bar capsule in flow, one item |
| TabView | at `fit` the bar is static below the panel (content never under it); `.page` dots without a capsule; `.sidebarAdaptable` on tablet and desktop: the bar as a sidebar column of rows |
| NavigationSplitView | sidebar 320 (220 on desktop) on `sidebar-bg` with hairlines; column titles (large, inline on the detail); `.prominentDetail` floats the sidebar as a glass panel; at `fit` at least 640 × 360 and bleeding over the fit padding |

## SwiftUI platform chrome — `shared/packs/{base,swiftui}/pack.css` (R-DEV-010)

The base pack carries the chrome geometry every pack gets with that chrome; the SwiftUI pack adds the
Liquid Glass look and its containers' adaptations (the "Multi-platform chrome" block at the end of its
`pack.css`). Tokens: `window-radius` (16 px), `window-shadow`, `wallpaper` (a light and a dark gradient).

| Frame | Base | SwiftUI |
|---|---|---|
| `[data-chrome="macos"]` | `--mkd-window-radius` (16 px) corners, `--mkd-window-shadow` | no border; 32-point title bar |
| `[data-titlebar="unified"]` | title bar absolute over the screen (52 px, lights only, z-index 30); the root navigation bar, split view's first column and tab bar make room for the lights | the navigation bar's large title moved past the lights |
| `[data-titlebar="toolbar"]` | a 52-point title bar: lights, leading items, title, spacer, trailing items | 15-point bold title on the window background |
| `[data-windowed="true"]` | wallpaper on the frame; status bar and home indicator over it in white; the screen inset (10/28/4 px) with 26-pixel corners and the window shadow; `.mkd-chrome--lights` at the window's top leading corner | the toggle beside the lights, the sidebar's top padding |
| `[data-device^="phone"]` | — | the split view collapsed: the other columns hidden, the sidebar a grouped list with chevrons, no selection; the frame on the grouped background |

Split view sidebars: with `macos` chrome an 8-pixel inset, 12-pixel-corner panel on `sidebar-bg`, 44
pixels of top padding under the lights, its title hidden and, when no other column has a title, placed
in the toolbar row beside it (`:has()`); the toggle at the sidebar's trailing end of the toolbar row;
the other columns' headers leading, 52 pixels. With `ipados` chrome an 8-pixel inset, 26-pixel-corner
glass panel with the toggle as a 40-pixel glass circle at its top leading corner and the large title
below. `.prominentDetail` keeps the floating overlay on both, the macOS detail toolbar shifted past
the sidebar. `TabView(.sidebarAdaptable)` floats its sidebar the same way. Toolbars (`.mkd-navbar__leading`,
`.mkd-navbar__trailing`, `.mkd-split__toolbar`, `.mkd-chrome__toolbar`) with `macos`/`ipados` chrome:
one glass capsule, icon-only buttons (the label hidden when the button has an icon). `Form` defaults
to `.automatic`: on `desktop` and `wide` frames the `.columns` rules apply to it (the selectors read
`:is(.mkd-form[data-variant="columns"], .mkd-frame:is([data-device="desktop"], [data-device="wide"]) .mkd-form[data-variant="automatic"])`).

## The macOS menu bar — `shared/packs/base/pack.css` (R-DEV-009)

All in the base pack, so any pack drawn with `macos` chrome gets it. Tokens (base, light and dark):
`desktop` (the wallpaper behind the window's top corners), `menubar-bg`, `menubar-fg`, `menubar-sel`
(the open title's highlight), `menu-bg`, `menu-fg`, `menu-fg-2` (shortcuts, chevrons), `menu-fg-3`
(disabled), `menu-sep`, `menu-sel`/`on-menu-sel` (an open submenu's row), `menu-shadow`.

- `.mkd-frame[data-menubar="true"]`: a 10-pixel-corner frame on `--mkd-desktop`; the 16-point radius
  and window shadow move to `.mkd-window` (flex column, `position: relative`, `overflow: hidden`), which
  fills the frame below the bar.
- The title bar rules that used `.mkd-frame[data-titlebar=…] > …` now read
  `:is(.mkd-frame, .mkd-window)[data-titlebar=…] > …` (base and SwiftUI): the window carries
  `data-titlebar` too, so the unified and toolbar title bars work under the bar.
- `.mkd-menubar`: 24 px, `z-index: 40`, 13 px system font, no `backdrop-filter` (it would become the
  dropdown's backdrop root and the open menu would stop blurring the window). Menus are 22-pixel pills
  (`data-menu="app"` bold, `data-open` highlighted); the gap, the status icons 16 px (battery 22 px) and
  the clock with `white-space: pre`.
- `.mkd-menubar__dropdown`: absolute under its title (`top: calc(100% + 4px)`), 5-pixel padding,
  12-pixel corners, `menu-bg` with `backdrop-filter: blur(30px) saturate(1.8)`, `menu-shadow`; rows
  24 px with a 18-pixel checkmark column, optional 22-pixel icon column, label, shortcut (20-pixel gap,
  `menu-fg-2`) and chevron; separators inset 10 px; `--sub` cascades to the right.

## The contract tests — `tests/test_packs.py`

| Test | Checks |
|---|---|
| `test_packs_load_and_roles_exist` | every pack loads; every element's role is an `r_<role>` method; every pack declares modules |
| `test_css_is_scoped` | every selector of a non-base `pack.css` starts with `.mkd-pack-<id>` |
| `test_css_has_no_appearance_branching` | no `data-appearance` / `prefers-color-scheme` in non-base CSS |
| `test_tokens_have_light_and_dark` | light tokens ⊇ base light tokens; dark tokens non-empty |
| `test_module_names_are_unique` | no module name claimed by two packs |
| `test_every_element_renders` | `Name()` renders without errors (except `argument`) for every element of every pack |
| `test_stylesheet_builds_for_all` | the all-packs stylesheet assembles |

Writing a pack is described in the [Pack authoring guide](../pack-authoring.md).


## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-24 | Page written |
| 0.3.2 | 2026-11-25 | Packs live in shared/packs and are copied into the package at build (#1) |
| 0.3.12 | 2026-11-25 | SwiftUI control styles (R-PACK-014) (#11) |
| 0.3.13 | 2026-11-25 | SwiftUI presentations and navigation (R-PACK-015) (#12) |
| 0.3.14 | 2026-11-25 | SwiftUI platform chrome (R-DEV-010) (#13) |
| 0.3.15 | 2026-11-25 | The macOS menu bar and the window under it (R-DEV-009) (#14) |
| 0.3.23 | 2026-11-27 | Site packs with `@import` refused; built-in copies resolved from partials (R-PACK-018) (#54) |
