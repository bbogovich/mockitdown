---
title: "Architecture: output and integration modules"
spec_version: 0.2.0
status: draft
updated: 2026-11-24
page_id: ARCH.2
---

# Architecture: output and integration modules

The modules that turn an evaluated screen into HTML and CSS, resolve images and icons, and connect mockitdown to Markdown sites and the command line.

#### A-REND-1 — HTML renderer

The markup contract in code. Realizes R-REND-002 to R-REND-009 and R-ASSET-004.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `Renderer` with one `r_<role>` method per render role, presentation layers, and the escaping and inline-Markdown helpers (`mockitdown.render.html`) |
| U1 | uses A-REND-3 — inline styles, data attributes and classes from modifiers |
| U2 | uses A-ASSET-1 — image sources |
| U3 | uses A-ASSET-2 — icon SVG |
| U4 | uses A-DIAG-1 — report role, icon and asset problems |
| K1 | The set of `r_<role>` methods MUST equal the role catalogue. |
| K2 | The HTML renderer MUST NOT branch on the pack identifier; packs differ only in data and CSS. |

---

#### A-REND-2 — Figure assembly and chrome

Builds the figure around the screen. Realizes R-REND-001, R-REND-010, R-APP-001, R-APP-003,
R-DEV-001, R-DEV-002 and R-DEV-005.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `render_screen(screen, renderer, options, diagnostics)` → figure HTML, the Elements table, and device chrome markup (`mockitdown.render`, `mockitdown.render.chrome`) |
| U1 | uses A-REND-1 — render the screen's views and layers |
| U2 | uses A-OPT-1 — device sizes and options |
| K1 | Figure assembly MUST resolve device, appearance, chrome, title and id exactly once per mockup. |

---

#### A-REND-3 — Style builder

Modifier-to-CSS translation. Realizes R-REND-004 and R-REND-006.C3.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `StyleBuilder.build(view)` → (inline style, data attributes, classes); `css_color`, the frame-unit length helper `u`, font styles and aliases (`mockitdown.render.style`) |
| U1 | uses A-DIAG-1 — report invalid class names |
| K1 | The style builder MUST emit only validated colours, frame-unit lengths and keyword values. |

---

#### A-STYLE-1 — Stylesheet assembly

Builds the CSS a page needs. Realizes R-PACK-006.C2, R-APP-002, R-DEV-003, R-DEV-004, R-DEV-006
and R-MDX-004.C2.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `stylesheet(pack_ids, registry, minify)`, `scale_px`, `token_css` and `page.css` (`mockitdown.styles`) |
| U1 | uses A-PACK-1 — pack lineage, CSS files and tokens |
| K1 | Stylesheet assembly MUST be deterministic and cache pack CSS by file modification time. |

---

#### A-ASSET-1 — Asset resolver

Realizes R-ASSET-001 to R-ASSET-003.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `AssetResolver.resolve(ref, location)` → URL for `src`, or `None` (`mockitdown.assets`) |
| U1 | uses A-DIAG-1 — report refused, missing and oversized assets |
| K1 | The asset resolver MUST NOT read a file outside its search roots. |

---

#### A-ASSET-2 — Icon set

Realizes R-ASSET-005.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: the glyph table `ICONS`, the alias table `ALIASES`, `normalize`, `resolve` and `svg(name)` → (markup, found) (`mockitdown.icons`) |
| K1 | The icon set MUST consist of original drawings. |

---

#### A-MDX-1 — Markdown extension

Realizes R-MDX-001, R-MDX-002, R-MDX-004 and R-MDX-006.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `MockitdownExtension` (site options, per-Markdown session, CSS postprocessor) (`mockitdown.extension`) |
| U1 | uses A-OPT-1 — build the site's render options |
| U2 | uses A-STYLE-1 — the per-page stylesheet |
| K1 | The Markdown extension MUST NOT render blocks itself; rendering happens in the fence. |

---

#### A-MDX-2 — Superfences fence

Realizes R-MDX-003 and R-MDX-005.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `format` and `validate`, the `pymdownx.superfences` custom-fence callables (`mockitdown.fence`) |
| U1 | uses A-API-1 — render each block |
| U2 | uses A-MDX-1 — the session's options and used-pack list |
| U3 | uses A-OPT-1 — coerce fence attributes |
| K1 | The fence MUST work without the extension, using default options. |

---

#### A-CLI-1 — Command-line interface

Realizes R-CLI-001 to R-CLI-006.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: the `mockitdown` console script with `render`, `check`, `css`, `packs` and `elements` (`mockitdown.cli`) |
| U1 | uses A-API-1 — render, check and stylesheet |
| U2 | uses A-PACK-1 — list packs and elements |
| K1 | The CLI MUST use only the Python standard library (`argparse`). |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
