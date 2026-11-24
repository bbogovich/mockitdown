---
title: "Assets and icons"
spec_version: 0.2.0
status: draft
updated: 2026-11-24
page_id: ASSET.1
---

# Assets and icons

Images referenced from a mockup, and the built-in icon set.

### R-ASSET-001 — Classifying image references

Only images, and only through schemes that cannot run code, reach the `src` attribute.

**Realizes.** F-5 · **Decisions.** ADR-9

| | Statement |
|---|---|
| C1 | The asset resolver MUST pass through unchanged a reference starting with `http://`, `https://` or `//` (case-insensitive). |
| C2 | The asset resolver MUST pass through unchanged a `data:image/<type>[;param…],…` URI, and MUST refuse any other `data:` URI with the warning "only data:image/… URIs are accepted" (code `asset`). |
| C3 | If a reference starts with any other URI scheme (`javascript:`, `file:`, `ftp:`, …), then the asset resolver MUST refuse it with the warning "unsupported asset scheme in 'x'" (code `asset`). |
| C4 | The asset resolver MUST treat every other non-empty reference as a local path, after trimming whitespace; an empty reference MUST resolve to nothing. |
| C5 | When a reference is refused or not found, the renderer MUST draw the role's image placeholder (a photo icon, with the alt text or reference as label where the role has one). |
| V1 | `Image("https://x/y.png")` keeps its URL; `Image("data:text/html,…")` and `Image("javascript:x")` warn and render placeholders. |

---

### R-ASSET-002 — Finding local images

The containment rule matters because documentation builds run on CI with access to the whole
repository: a mockup may only embed files the site deliberately exposes.

**Known gap.** A fenced block in a Markdown page has no known file (Python-Markdown does not tell
the fence which page it is rendering), so in a site build only the configured asset directories are
searched; resolution against the block's own directory applies to the command line and the library
API when a source path is given.

**Realizes.** F-5 · **Decisions.** ADR-9

| | Statement |
|---|---|
| C1 | The asset resolver MUST search a local reference, with any `?query` or `#fragment` removed, relative to the directory of the file the block came from (when known), then relative to each configured asset directory (`asset_paths`) in order, and MUST use the first existing file. |
| C2 | The asset resolver MUST only read a file whose resolved real path lies inside one of those search roots; a reference escaping them (`../../etc/passwd`, an absolute path elsewhere, a symbolic link out) MUST be treated as not found. |
| C3 | If no file is found, then the asset resolver MUST warn "asset 'x' not found (searched …)" listing the search roots, with code `asset`. |
| C4 | Relative asset directories MUST be resolved against the process's working directory — for a site build, the directory the build is run from. |
| V1 | With `asset_paths: [docs]`, `Image("assets/images/logo.svg")` finds `docs/assets/images/logo.svg`; `Image("../secret.png")` is not found even if the file exists. |

---

### R-ASSET-003 — Embedding local images

Embedding makes the HTML self-contained: the figure works on any page URL, in an RSS reader or a
copied fragment, and the site needs no asset-copying step. The size cap keeps pages from bloating.

**R-ASSET-003.TC-1 — Imports and assets**

Automated by `tests/test_render.py::EvaluateRenderTests::test_imports_and_assets`.

**Realizes.** F-5 · **Decisions.** ADR-9

| | Statement |
|---|---|
| C1 | While embedding is on (`embed_assets`, default on), the asset resolver MUST return a found local image as a `data:<mime>;base64,…` URI. |
| C2 | The asset resolver MUST determine the MIME type from the extension (`.png`, `.jpg`/`.jpeg`, `.gif`, `.webp`, `.svg`, `.avif`, `.ico`, `.bmp`), else from the platform's MIME table; if the type is not `image/*`, then it MUST warn "asset 'x' is not a recognised image type" (code `asset`) and resolve to nothing. |
| C3 | If a found file is larger than `max_embed_bytes` (default 2,000,000), then the asset resolver MUST return the reference as written (a link) and warn that it is linked instead (code `asset`). |
| C4 | While embedding is off, the asset resolver MUST return a local reference as written, without checking that the file exists. |
| C5 | The asset resolver MUST read and encode each file at most once per rendering. |
| V1 | A 3 KB SVG embeds as `data:image/svg+xml;base64,…`; a 3 MB PNG is linked with a warning; with `--no-embed` the reference is emitted unchanged. |

---

### R-ASSET-004 — Image-bearing attributes

Any attribute that names a picture goes through the same resolver, so the rules of R-ASSET-001 to
R-ASSET-003 apply uniformly.

**Realizes.** F-5

| | Statement |
|---|---|
| C1 | The renderer MUST resolve as asset references: the `image` role's `name`, `url`, `src` or `source` attribute (first present); the `avatar` role's `image`, `src` or `url`; and the `image` or `thumbnail` attribute that roles use for a leading visual. |
| C2 | Other roles that show media (cards with `cover`, `media` or `image`) MUST resolve their image attributes the same way. |
| C3 | An `Image` with `systemName`, `icon` or `symbol` MUST render an icon (R-ASSET-005), not an asset. |
| C4 | The `image` role MUST render a resolved image as `<img class="mkd-image" src alt>` with `alt` from `alt`, `label` or `accessibilityLabel` (empty otherwise). |
| V1 | `Image("assets/a.png", alt: "Team")` renders an `img` with `alt="Team"`; `Avatar("Ana Lima", image: "assets/ana.jpg")` renders the photo; `Avatar("Ana Lima")` renders the initials `AL`. |

---

### R-ASSET-005 — Built-in icons

Framework icon sets cannot be shipped: SF Symbols' licence forbids redistribution, and the
Material, Fluent and SAP fonts are large. An own set of about 120 glyphs with about 400 aliases
covers mockup needs; names map to the closest glyph rather than to an exact copy.

**Realizes.** F-5, F-8 · **Decisions.** ADR-11

| | Statement |
|---|---|
| C1 | mockitdown MUST ship its own icon set of original 24 × 24 line glyphs, drawn with `currentColor` strokes, and MUST NOT bundle or download a third-party icon font. |
| C2 | The icon resolver MUST resolve a name by: the pack's `icons` map; an exact glyph name; an exact alias; then the normalised name and that name without `.fill`, `.circle` or `.fill.circle`, each as a glyph name then as an alias; then the first dot-separated segment as a glyph name then as an alias. |
| C3 | Normalisation MUST strip a `sap-icon://` prefix, split camelCase and letter-digit boundaries with dots, split on `.`, `_`, `-`, `/` and spaces, lower-case, and drop the tokens `16`, `20`, `24`, `28`, `32`, `48`, `regular`, `filled`, `outline`, `outlined`, `rounded`, `sharp`, `ic`, `fluent`, `symbol`, `symbols`, `light` and `color`. |
| C4 | The aliases MUST cover common SF Symbols, Material Symbols, Fluent UI System Icons and SAP icon names. |
| C5 | If no glyph matches, then the icon resolver MUST render a neutral question-mark glyph and the renderer MUST warn "unknown icon 'x'" with code `icon`. |
| C6 | The renderer MUST emit icons as inline `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">` whose stroke width packs control through the `icon-stroke` token. |
| V1 | `star.fill`, `Star24Regular`, `sap-icon://favorite` and `favorite` resolve to glyphs; `xyzzy` renders the placeholder glyph with a warning. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
