---
title: Rendering
impl_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: IMPL.REND
---

# Rendering

Realizes **A-REND-1** (HTML renderer), **A-REND-2** (figure assembly and chrome) and **A-REND-3**
(style builder); requirements R-REND-001 – R-REND-010, R-APP-001, R-APP-003, R-DEV-001, R-DEV-002,
R-DEV-005, R-ASSET-004.

## Figure assembly — `render/__init__.py`, `render/chrome.py`

`render_screen(screen, renderer, options, diagnostics)`:

1. `_resolve_device` — option `device` → `@Screen(device:)` → pack default; `fit`; `width`/`height`
   overrides; pack `sizes` then `options.DEVICES`.
2. Appearance (option → `@Screen` → `default_appearance`), chrome (option unless `auto` →
   `@Screen` → `pack.chrome_for(device)`), title, id, url.
3. `renderer.views(screen.views)` renders the body once; `renderer.overlays` collects the
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
