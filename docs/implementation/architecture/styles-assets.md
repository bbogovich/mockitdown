---
title: Styles and assets
impl_version: 0.1.0
status: draft
updated: 2026-11-25
page_id: IMPL.STYLE
---

# Styles and assets

Realizes **A-STYLE-1** (stylesheet assembly), **A-ASSET-1** (asset resolver) and **A-ASSET-2**
(icon set); requirements R-PACK-006, R-APP-002, R-DEV-003, R-DEV-004, R-DEV-006, R-MDX-004,
R-ASSET-001 – R-ASSET-005.

## Stylesheet assembly — `styles.py`, `page.css`

`stylesheet(pack_ids, registry, minify=True)` concatenates `page.css` and, for each requested pack's
lineage (root first, each pack once), `pack_css(pack)` then `token_css(pack)`, and minifies with
`minify_css` (comment removal and whitespace collapsing — no dependency).

- `scale_px(css)` rewrites `N px` with |N| > 1 to `calc(N * var(--u))` (regex `_PX`, which skips
  numbers inside identifiers and hex colours) — R-DEV-004.
- `token_css(pack)` emits the four appearance rule sets (R-APP-002); `_decls` drops unsafe token
  names and values.
- `_pack_css_cached(directory, mtime, id)` caches scaled pack CSS by modification time.

`page.css` (unscaled) holds the figure and cell layout, the frame unit
(`--u: min(1px, calc(100cqw / var(--mkd-w, 1280)))`), `fit` mode, host-typography isolation with
`:where(...)` resets, the caption, the error box, the Elements table and the source disclosure.

## Asset resolver — `assets.py`

`AssetResolver(search_paths, base_dir, diagnostics, embed=, max_bytes=)`; `resolve(ref, loc)`
classifies the reference (`_REMOTE`, `_DATA`, other schemes), finds local files with `_find`
(query and fragment stripped; resolved path must be inside a root), and returns a base64 `data:`
URI (MIME from `_MIME`, then `mimetypes`), the reference as written (embedding off, or over the
cap), or `None` with a warning. Results are cached per resolver (one rendering).

## Icons — `icons.py`

- `ICONS`: ~120 original 24×24 line glyphs (SVG path bodies), loaded from the packaged
  `icons.json` (`glyphs`).
- `ALIASES`: ~400 names from SF Symbols, Material Symbols, Fluent UI System Icons and SAP icons
  mapped to glyphs (`aliases` in `icons.json`).

The table is written only in `shared/icons/icons.json` (R-REPO-002.C3) and copied into the package
at build time; `page.css` likewise lives in `shared/css/page.css`.
- `normalize(name)` (`ChevronRight24Regular` → `chevron.right`, `sap-icon://x` → `x`),
  `resolve(name)` (exact, alias, normalised, suffix-stripped, head segment), `svg(name, cls)` →
  `(markup, found)`; the renderer applies the pack's `icons` map first and warns when not found.

Adding an icon: draw a 24×24 stroke glyph (round caps/joins, `currentColor`), add it to `glyphs` in
`shared/icons/icons.json`, and add `aliases` for the framework names that should reach it.


## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-24 | Page written |
| 0.3.2 | 2026-11-25 | Icon table and page.css in shared/ (#1) |
