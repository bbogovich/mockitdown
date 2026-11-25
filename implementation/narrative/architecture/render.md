---
title: Rendering
impl_version: 0.3.9
status: draft
updated: 2026-11-25
page_id: IMPL.REND
---

# Rendering

Realizes **A-REND-1** (HTML renderer), **A-REND-2** (figure assembly and chrome) and **A-REND-3**
(style builder); requirements R-REND-001 – R-REND-010, R-APP-001, R-APP-003, R-DEV-001, R-DEV-002,
R-DEV-005, R-DEV-008, R-REND-013, R-ASSET-004.

## Figure assembly — `render/__init__.py`, `render/chrome.py`

`render_screen(screen, renderer, options, diagnostics, source)`:

1. `_resolve_device` — option `device` → `@Screen(device:)` → pack default; `fit`; `width`/`height`
   overrides; pack `sizes` then `options.DEVICES`.
2. Appearance (option → `@Screen` → `default_appearance`), chrome (option unless `auto` →
   `@Screen` → `pack.chrome_for(device)`), title, id, url.
3. `anchor_prefix(pack.id, source)` sets the figure's CSS anchor prefix: the first six hex digits of
   the SHA-1 of `"<pack id>\n<source>"` (R-ANN-003.C5). It used to hash `repr(screen.views)`, which
   no other variant can reproduce and which carried file paths through import locations.
   `renderer.views(screen.views)` renders the body once; `renderer.overlays` collects the
   presentation layers; `chrome.top`/`chrome.bottom` wrap the screen.
4. One `mkd-cell`/`mkd-frame` per appearance (`both` → light and dark from the same HTML), the
   caption and `elements_table` (walks `model.walk` for `.id()` modifiers).

`chrome.CHROME_KINDS` lists the kinds; each kind is a fixed markup snippet with built-in icons.

## Renderer — `render/html.py`

`Renderer(pack, diagnostics, assets)` dispatches `view(v)` to `r_<role>` (`getattr`), falling back
to `r_unknown` with a `role` error. Shared helpers:

| Helper | Purpose |
|---|---|
| `open(v, role, tag, cls=, data=, style=, attrs=)` | the root tag: `mkd-<role>` class, `data-el`, `data-component`, `PASSTHROUGH` attributes (allow-listed by `_SAFE_TOKEN`), `data-state`, `data-selected`, modifier style/data/classes, `title` from `.help` |
| `text_html`, `esc` | escaping and the inline Markdown subset (`_INLINE_MD`) |
| `content`, `slot`, `text_or_slot`, `has` | read text-or-views attributes and slots |
| `icon`, `leading_visual`, `avatar_html`, `badge_html` | shared visuals |
| `_wrap_overlays`, `_collect_presentations` | `.overlay`/`.background` content; alert, sheet, … layers |
| `_options`, `_selected_index`, `_field`, `_rows`, `_toolbar_items` | shared logic of pickers, fields, lists, toolbars |

The 66 `r_<role>` methods are the [role catalogue](../../specification/rendering/roles.md). A role
method reads attributes leniently (several framework spellings) and emits fixed markup.

`Renderer` state is per mockup: `overlays`, `row_wrap` (rows inside lists/forms), `in_menu`,
`chart_seq` (deterministic chart ids).

## Fit frames, presentations and rows — `shared/css/page.css`, `shared/packs/base/pack.css`

R-DEV-008 and R-REND-013 are almost entirely CSS; the renderer's part is the tooltip markup.

- **Natural width (R-DEV-008.C1).** `.mkd-frame[data-fit="true"]` is `width: max-content` with no
  `max-width`; its `.mkd-cell` keeps `max-width: 100%`, scrolls (`overflow-x: auto`) and centres with
  `align-items: safe center`, so the frame's start stays reachable when it is wider than the page.
- **Presentations in flow (C2, C8, C9).** At `fit`, a screen holding a `.mkd-layer` becomes a
  one-column grid of eight `auto` rows: its first seven children take rows 1–7 (`:nth-child`), every
  layer spans `1 / -1`. The layer is `position: static`, so its `.mkd-scrim` (absolute, inset 0) is
  sized by the screen. Dialog surfaces get `min-width: 240px; min-height: 80px`; a sheet layer has
  48 px of padding above (the dimmed band, C4), its surface `min-width: 320px; min-height: 240px`,
  and bleeds over the screen's padding with negative margins of `--mkd-fit-padding` (16 px; nls,
  lisa, mac-classic, phosphor, hologram and lcars set it instead of `padding`).
- **Sheet grabber (C3, C4).** A `Dialog`/`Sheet` element with variant `sheet` draws the grabber as
  `.mkd-dialog::before` (zero specificity: `:where`); `android` and `angular-material` replace it
  with their own `::before`.
- **Tooltips (C5).** `r_tooltip` wraps the content in `.mkd-tooltip__anchor` (or
  `TOOLTIP_PLACEHOLDER`, a placeholder button, when there is none) and starts the bubble with
  `.mkd-tooltip__arrow`, a rotated square with the bubble's background on the anchor's side. At `fit`
  the tooltip is an inline grid: bubble above (`top`), below (`bottom`) or after (`trailing`) the
  anchor, `position: relative; z-index: 1`. Packs that draw their own arrow as `::after` (antd,
  carbon, bootstrap, macos9, prime, shadcn; fluent's TeachingTip, vista's and winxp's Balloon) hide
  the element.
- **Toasts (C6, C10).** The base toast has no `min-width`; packs keep their framework widths.
- **Open menus (C7).** At `fit`, `:where(.mkd-screen, .mkd-vstack) > :is(.mkd-menu, .mkd-select)`
  lays its popup out `position: static`.
- **Rows (R-REND-013.C1–C3).** `:is(.mkd-hstack, .mkd-toolbar, .mkd-labeled) > :not(.mkd-text,
  .mkd-spacer, [data-fill~="x"])` keeps `min-width: min-content` (specificity 0,3,0, above a pack's
  `min-width: 0` on a control); `.mkd-text` and control labels are `overflow-wrap: break-word`.
  Rails (`.mkd-sidebar` `rail`/`compact`) and the lisa/mac-classic tool palettes clip their cells.
- **Message bubbles (C4).** `.mkd-message__bubble` wraps (`overflow-wrap: break-word`); at `fit`
  `.mkd-message` is at least 300 px wide, so its 75 % stack has room for a short text.

Debugging: in the gallery, `inspectMockups` of `typescript/tests/browser/geometry.mjs` can be pasted
into the console (it is self-contained) and returns the geometry problems of the open pack.

## Style builder — `render/style.py`

`StyleBuilder.build(view)` runs one `_m_<modifier>` handler per recorded modifier and returns
`(style, data, classes)`. `u(n)` produces `calc(N * var(--u))`; `css_color` validates colours
(named → `--mkd-color-*`, semantic → tokens, hex, `rgb()/hsl()`, `Color(...)`, opacity via
`color-mix`); `FONT_STYLES` and `FONT_ALIASES` canonicalise fonts after the pack's own `fonts` map.

## Adding a role

1. Add `r_<role>` to `Renderer` (and BEM parts) — R-REND-002.
2. Style its structure in `packs/base/pack.css`.
3. Add it to the role catalogue in the specification (a specification change).
4. Map elements onto it in packs; `test_every_element_renders` covers it.


## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-24 | Page written |
| 0.3.3 | 2026-11-25 | Portable anchor prefix from pack id and source (#2) |
| 0.3.9 | 2026-11-25 | Fit frames at natural width, presentations in flow, tooltip anchor/arrow, rows without overlap, message bubbles (#8) |
