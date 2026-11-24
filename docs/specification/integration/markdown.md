---
title: "Markdown extension and fence"
spec_version: 0.2.1
status: draft
updated: 2026-11-24
page_id: MDX.1
---

# Markdown extension and fence

How mockitdown plugs into Python-Markdown, MkDocs and Zensical. A worked configuration is in the [Site integration guide](site-guide.md).

### R-MDX-001 — Integration points

Zensical reads `mkdocs.yml` and runs Python-Markdown extensions and superfences fences, but not
MkDocs plugins (ADR-3). Everything the prototype's plugin did — configuration, CSS, strict
failure — therefore moves into the extension and the fence. The [Site integration guide](site-guide.md)
has the complete configuration.

**Realizes.** F-11 · **Decisions.** ADR-3

| | Statement |
|---|---|
| C1 | mockitdown MUST integrate with documentation sites as a Python-Markdown extension named `mockitdown` (loadable as `markdown_extensions: [mockitdown]`) together with a `pymdownx.superfences` custom fence. |
| C2 | The fence MUST be registered with `name: mockitdown`, `format: mockitdown.fence.format` and `validator: mockitdown.fence.validate`; the class name is free (`mockitdown` by convention). |
| C3 | The integration MUST work unchanged in MkDocs, in Zensical and in any Python-Markdown pipeline that loads `pymdownx.superfences`; mockitdown MUST NOT ship or require a MkDocs plugin. |
| C4 | The fence MUST work when the extension is not loaded, rendering with the default options and without CSS injection. |
| C5 | The `mockitdown` extension SHOULD be listed before `pymdownx.superfences` in the extension list. |
| V1 | The example site's configuration builds under Zensical 0.1.3 and renders every block; a plain `markdown.Markdown(extensions=["mockitdown", "pymdownx.superfences"], …)` converts a page with a block. |

---

### R-MDX-002 — Extension options

Site options are the defaults of one site; fence attributes (R-MDX-003) override them per block.
`caption`, `elements` and `show_warnings` are site-wide only.

**Realizes.** F-11

| | Statement |
|---|---|
| C1 | The Markdown extension MUST accept these options with these defaults: `default_pack` (`base`), `default_appearance` (`light`), `default_device` (empty: none), `import_paths` (`[docs]`), `asset_paths` (`[docs]`), `pack_paths` (`[]`), `embed_assets` (`true`), `max_embed_bytes` (`2000000`), `css` (`inline`), `strict` (`false`), `caption` (`true`), `elements` (`false`), `show_warnings` (`false`). |
| C2 | The path options MUST accept one string or a list of strings. |
| C3 | If `default_appearance` is not `light`, `dark`, `auto` or `both`, then the Markdown extension MUST fail configuration with "mockitdown: default_appearance must be one of …". |
| C4 | If `css` is not `inline` or `none`, then the Markdown extension MUST fail configuration with "mockitdown: css must be 'inline' or 'none'". |
| C5 | The options MUST apply to every block on the site unless a fence attribute overrides them. |
| V1 | `- mockitdown: {default_pack: swiftui, css: none}` renders every block without a pack in SwiftUI and injects no CSS; `default_appearance: dim` fails the build at startup. |

---

### R-MDX-003 — Fence attributes

Attributes tune one rendering — the same block can be shown on a phone and on a tablet on the
same page with different attributes. The full list with examples is in the
[Site integration guide](site-guide.md).

**Realizes.** F-1, F-11

| | Statement |
|---|---|
| C1 | The fence MUST accept these attributes, with these types: `pack`, `device`, `appearance`, `chrome`, `title`, `id`, `url` (text); `width`, `height` (integer); `caption`, `elements`, `source` (boolean). |
| C2 | The fence MUST read a boolean attribute as true when its value is `1`, `true`, `yes` or `on` (case-insensitive) and false otherwise. |
| C3 | The fence validator MUST accept every attribute, so that a misspelt attribute is reported rather than silently turning the block into a code listing. |
| C4 | If an attribute is unknown, has an invalid integer value, or gives an appearance other than the four, then the fence MUST report a fence error (code `fence`) naming it, ignore that attribute, render the block, and place an error box listing the fence errors above the figure. |
| C5 | Fence attributes MUST override the site options and the block's `@Screen` metadata. |
| V1 | ```` ```mockitdown device="phone" elements="yes" ```` renders a phone with an Elements table; `devise="phone"` renders with an error box "unknown fence option 'devise'". |

---

### R-MDX-004 — Per-page CSS delivery

Inline CSS per page needs no asset pipeline, works with instant navigation (the style travels with
the page content) and loads only the packs a page uses. Sites with many mockup pages can switch to
one linked stylesheet with `css: none` (ADR-8).

Hosts may call `convert()` more than once per page — Zensical converts heading fragments in nested
calls while the page is being converted, and reuses the Markdown instance without `reset()` — so
the stylesheet is emitted only by the conversion whose output contains the page's figures, which
then consumes the collected packs.

**Realizes.** F-11, F-8 · **Decisions.** ADR-8

| | Statement |
|---|---|
| C1 | While `css` is `inline`, the Markdown extension MUST prepend to each converted page that rendered at least one mockup exactly one `<style data-mockitdown="<pack ids>">` element holding the stylesheet for the packs the page used. |
| C2 | The stylesheet MUST contain the page stylesheet once, then each used pack's lineage, root first, each pack once, each pack's CSS followed by its token rules, minified. |
| C3 | The Markdown extension MUST NOT add a style element to a page that rendered no mockup. |
| C4 | While `css` is `none`, the Markdown extension MUST NOT add CSS; the site MUST then include the output of `mockitdown css` itself (for example through `extra_css`). |
| C5 | The Markdown extension MUST forget the packs used when Python-Markdown is reset between pages. |
| V1 | A page with a SwiftUI and a Fluent mockup has one style element with `data-mockitdown` listing `base`, `swiftui` and `fluent`, and `base` CSS appears once. |

---

### R-MDX-005 — Build log and strict mode

The logger's name places mockitdown's messages under MkDocs' extension loggers, so MkDocs'
`--strict` warning policy and Zensical's log output pick them up. Strict mode is the CI gate.

**Realizes.** F-12, F-11

| | Statement |
|---|---|
| C1 | The fence MUST log every diagnostic of a block to the logger `mkdocs.extensions.mockitdown` — errors at ERROR level, warnings at WARNING level — as "mockitdown block <label>: <diagnostic>", where the label is the block's title or its first non-empty line cut to 48 characters. |
| C2 | While `strict` is on, if a block has any error (including fence errors), then the fence MUST raise `pymdownx.superfences.SuperFencesException` with the message "mockitdown block <label>: " followed by the errors, so the site build fails. |
| C3 | While `strict` is off, a block with errors MUST render with its error box (R-DIAG-004) and the build MUST continue. |
| C4 | While `show_warnings` is on, warnings MUST also appear in the page's diagnostic box; otherwise only the log shows them. |
| V1 | With `strict: true`, a page containing `Buton("x")` fails `zensical build` with a message naming the block and the unknown element. |

---

### R-MDX-006 — Compatibility with instant navigation

The prototype emitted declarative shadow DOM and SAPUI5 web components, which do not attach to
script-inserted HTML, and warned about instant navigation (SRC-3). Static markup removes the
problem.

**Realizes.** F-11 · **Decisions.** ADR-5

| | Statement |
|---|---|
| C1 | Mockups MUST render correctly when a theme replaces page content by script (Material's and Zensical's `navigation.instant`), because they need no initialisation script and carry their CSS with the page. |
| C2 | mockitdown MUST NOT warn about or disable `navigation.instant`. |
| V1 | With `navigation.instant` on, navigating from a page without mockups to one with mockups shows them styled. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.1 | 2026-11-24 | As built: the implementation now matches the clauses; known-deviation note removed |
| 0.2.0 | 2026-11-24 | Page created |
| 0.2.0 | 2026-11-24 | Page created |
