---
title: Packs
impl_version: 0.3.13
status: draft
updated: 2026-11-25
page_id: IMPL.PACKS
---

# Packs

Realizes **A-PACK-1** (registry) and **A-PACK-2** (built-in packs); requirements R-PACK-001 –
R-PACK-009, R-PACK-014 and R-PACK-015.

## `PackRegistry` — `packs/__init__.py`

- `PackRegistry(extra_dirs)` searches `extra_dirs` then `BUILTIN_DIR` (the `packs/` package
  directory). `registry(extra_dirs)` is an `lru_cache`d factory so the fence, the extension and the
  CLI share one registry per set of directories.
- `get(id)` loads `pack.json`, loads the parent first (default `base`), merges `elements`,
  `modifiers`, `chrome`, `sizes`, `icons` and per-mode `tokens` over the parent's, records
  `own_elements`, and caches the `Pack` (M-PACK-1). `_element` builds each `ElementDef` (M-PACK-2)
  and rejects a missing `role`.
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
`packs/*/pack.css`). Edit `shared/`, then reinstall or run `python/tools/sync_shared.py`.

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

The macOS floating sidebar of R-DEV-010.C3 is left to #13: it styles `.mkd-frame[data-chrome="macos"] .mkd-split__col[data-col="sidebar"]` (the existing desktop rules round and inset the column) and its `.mkd-split__header`.

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
