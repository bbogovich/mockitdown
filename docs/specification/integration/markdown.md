---
title: "Markdown extension and fence"
spec_version: 0.12.10
status: draft
updated: 2026-11-27
page_id: MDX.1
---

# Markdown extension and fence

How mockitdown plugs into Python-Markdown, MkDocs and Zensical. A worked configuration is in the [Site integration guide](site-guide.md).

### R-MDX-001 — Integration points

Zensical reads `mkdocs.yml` and runs Python-Markdown extensions and superfences fences, but not
MkDocs plugins (ADR-3). Everything the prototype's plugin did — configuration, CSS, strict
failure — therefore moves into the extension and the fence. The [Site integration guide](site-guide.md)
has the complete configuration.

**R-MDX-001.TC-1 — Loading, registration and the fence without the extension**

Python unit tests `python/tests/test_markdown_ext.py` `IntegrationTests`: `markdown.Markdown(extensions=["mockitdown", "pymdownx.superfences"])`
registers `MockitdownExtension` and converts a page with a block to one figure (C1, V1); `mockitdown.fence.format`
and `mockitdown.fence.validate` import by their dotted names, the example site's `mkdocs.yml` registers them, and a
fence with any other class name renders (C2); `pyproject.toml` declares no `mkdocs.plugins` entry point, no module
imports MkDocs or subclasses `BasePlugin`, and the example site has no `plugins:`, while `test_examples.py`
`ZensicalBuildTests` builds the example site under Zensical (C3, V1); a fence without the extension renders a `base`
desktop light figure and no `<style>` (C4); the example site lists `mockitdown` before `pymdownx.superfences` (C5).

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

Checked at 0.10.1 after M-OPT-1.F22 (`edit`): it is not an extension option and not a fence attribute (R-WEB-002.C13), so the options of C1 stand.

**R-MDX-002.TC-1 — The import map option replaces import_paths**

Python unit tests on the extension's configuration: with no options the effective import map is `{"": "docs"}` and `import "shared/kpi"` is looked up as `docs/shared/kpi` (C1); `import_paths: [docs/mockups]` raises at `markdown.Markdown(...)` with the exact message of C6 naming `docs/mockups`; `imports: {"a/": 3}` and `imports: [docs]` raise with the message of C7; `imports: {"shared/": "docs/mockups/shared/", "": ["docs", "lib"]}` is accepted. Automated in `python/tests/` by the issue that implements it.

**R-MDX-002.TC-2 — Defaults, path options, validation and site-wide options**

Python unit tests `python/tests/test_markdown_ext.py` `OptionTests`: with no options the extension's configuration holds the defaults of C1
(`imports` excepted, TC-1) and the session's render options follow them (C1); `asset_paths` and `pack_paths` take
one string or a list (C2); `default_appearance: dim` raises at `markdown.Markdown(...)` with the exact message of C3
and the four appearances are accepted (C3, V1); `css: link` raises with the message of C4 (C4); with
`default_pack: swiftui`, `css: none`, `default_appearance: dark` and `caption: false`, every block renders in
SwiftUI, dark, without a caption or CSS, except the block whose fence names `pack`, `appearance` and `caption` (C5, V1).

**Realizes.** F-11

| | Statement |
|---|---|
| C1 | The Markdown extension MUST accept these options with these defaults: `default_pack` (`base`), `default_appearance` (`light`), `default_device` (empty: none), `imports` (`{"": "docs"}`), `asset_paths` (`[docs]`), `pack_paths` (`[]`), `embed_assets` (`true`), `max_embed_bytes` (`2000000`), `css` (`inline`), `strict` (`false`), `caption` (`true`), `elements` (`false`), `show_warnings` (`false`), `callout_refs` (`true`, R-ANN-004.C1). |
| C2 | The path options `asset_paths` and `pack_paths` MUST accept one string or a list of strings; `imports` is an import map (R-IMP-002.C7, C8). |
| C3 | If `default_appearance` is not `light`, `dark`, `auto` or `both`, then the Markdown extension MUST fail configuration with "mockitdown: default_appearance must be one of …". |
| C4 | If `css` is not `inline` or `none`, then the Markdown extension MUST fail configuration with "mockitdown: css must be 'inline' or 'none'". |
| C5 | The options MUST apply to every block on the site unless a fence attribute overrides them. |
| C6 | If the option `import_paths` is given, then the Markdown extension MUST fail configuration with "mockitdown: import_paths was replaced by imports; write imports: {\"\": [<the given directories>]}", the given directories filled in. |
| C7 | If `imports` is not a mapping whose keys are strings and whose values are a string or a list of strings, then the Markdown extension MUST fail configuration with "mockitdown: imports must map each namespace to a path, a URL or a list of them". |
| V1 | `- mockitdown: {default_pack: swiftui, css: none}` renders every block without a pack in SwiftUI and injects no CSS; `default_appearance: dim` fails the build at startup. |
| V2 | `import_paths: [docs/mockups]` fails the build at startup with the message of C6 naming `docs/mockups`; `imports: {"shared/": docs/mockups/shared/}` is accepted. |

---

### R-MDX-003 — Fence attributes

Attributes tune one rendering — the same block can be shown on a phone and on a tablet on the
same page with different attributes. The full list with examples is in the
[Site integration guide](site-guide.md).

**R-MDX-003.TC-1 — The library attribute**

A fence with `library="cards"` is accepted by the validator with no fence error (C1); `library="my-cards"` produces the fence error naming `library` and the block renders as a mockup (C6). Automated in `python/tests/`.

**R-MDX-003.TC-2 — Typed attributes, booleans, the validator and fence errors**

Python unit tests `python/tests/test_markdown_ext.py` `FenceAttributeTests`: `FENCE_OPTIONS` holds exactly the attributes and types of C1 but
`library` (TC-1), and a fence giving all of them renders without a fence error and applies them (C1, V1); `1`,
`true`, `yes`, `on` in any case turn `elements` on and `0`, `false`, `no`, `off`, `nope` and an empty value leave it
off (C2); the validator accepts unknown attributes and the block still renders as a mockup, not a code listing (C3);
`devise="phone"`, `width="wide"` and `appearance="dim"` each log one `fence` error naming the attribute, render an
error box above the figure and ignore the attribute (C4, V1); fence `pack`, `device` and `title` override
`default_pack`, `default_device` and `@Screen`'s pack, device and title, and `@Screen` overrides the site's
`default_device` (C5).

**Realizes.** F-1, F-11

| | Statement |
|---|---|
| C1 | The fence MUST accept these attributes, with these types: `pack`, `device`, `appearance`, `chrome`, `title`, `id`, `url`, `library`, `window`, `menubar`, `app` (text); `width`, `height` (integer); `caption`, `elements`, `source`, `windowed` (boolean). |
| C2 | The fence MUST read a boolean attribute as true when its value is `1`, `true`, `yes` or `on` (case-insensitive) and false otherwise. |
| C3 | The fence validator MUST accept every attribute, so that a misspelt attribute is reported rather than silently turning the block into a code listing. |
| C4 | If an attribute is unknown, has an invalid integer value, or gives an appearance other than the four, then the fence MUST report a fence error (code `fence`) naming it, ignore that attribute, render the block, and place an error box listing the fence errors above the figure. |
| C5 | Fence attributes MUST override the site options and the block's `@Screen` metadata. |
| C6 | If `library` is not an identifier (a letter or `_`, then letters, digits or `_`), then the fence MUST report a fence error naming it and render the block as a mockup (R-IMP-008). |
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

**R-MDX-004.TC-1 — One stylesheet per page**

Python unit tests `python/tests/test_markdown_ext.py` `CssDeliveryTests`: a page with SwiftUI, Fluent and SwiftUI blocks starts with exactly one
`<style data-mockitdown="base swiftui fluent">` (C1, V1) whose text equals `stylesheet(["base", "swiftui", "fluent"])`:
minified, the page stylesheet once and first, then base, SwiftUI and Fluent, each pack's CSS before its token rules and
each pack once (C2, V1); a page with prose and a Python code block only has no `<style>` (C3); with `css: none` no CSS
is added and `mockitdown css --pack swiftui --pack fluent` writes the stylesheet the site includes instead (C4); after
`Markdown.reset()` the packs used before are forgotten (C5).

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

**R-MDX-005.TC-1 — Build log, strict mode and shown warnings**

Python unit tests `python/tests/test_markdown_ext.py` `BuildLogTests`: a block with an unknown element and an unknown modifier logs one ERROR and one
WARNING to `mkdocs.extensions.mockitdown`, each "mockitdown block '<first line>': <diagnostic>"; the label is the
first non-empty line cut to 48 characters, or the fence title, quoted (C1); with `strict: true` an unknown element and
an unknown fence attribute each raise `SuperFencesException` with the message of C2, while a warning alone does not
(C2, V1); without strict, a block with errors renders its error box and the page goes on to the next block (C3); a
warning appears in the page's diagnostic box only with `show_warnings: true`, and in the log either way (C4).

**Realizes.** F-12, F-11

| | Statement |
|---|---|
| C1 | The fence MUST log every diagnostic of a block to the logger `mkdocs.extensions.mockitdown` — errors at ERROR level, warnings at WARNING level — as "mockitdown block <label>: <diagnostic>", where the label is the block's title or its first non-empty line cut to 48 characters, quoted as a Python string literal (`'Inbox'`). |
| C2 | While `strict` is on, if a block has any error (including fence errors), then the fence MUST raise `pymdownx.superfences.SuperFencesException` with the message "mockitdown block <label>: " followed by the errors, so the site build fails. |
| C3 | While `strict` is off, a block with errors MUST render with its error box (R-DIAG-004) and the build MUST continue. |
| C4 | While `show_warnings` is on, warnings MUST also appear in the page's diagnostic box; otherwise only the log shows them. |
| V1 | With `strict: true`, a page containing `Buton("x")` fails `zensical build` with a message naming the block and the unknown element. |

---

### R-MDX-006 — Compatibility with instant navigation

The prototype emitted declarative shadow DOM and SAPUI5 web components, which do not attach to
script-inserted HTML, and warned about instant navigation (SRC-3). Static markup removes the
problem.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-MDX-006.TC-1 — A page with mockups under instant navigation**

Python unit tests `python/tests/test_markdown_ext.py` `InstantNavigationTests`: a converted page holds its `<style data-mockitdown>` before its
figures and no script or event-handler attribute (C1); no module mentions instant navigation (C2). With Zensical
installed (`ZENSICAL=…`), a two-page site with `navigation.instant` builds with no word about it in the build output
(C2), and the page with a mockup carries its stylesheet and figure inside `[data-md-component="content"]` — the part
instant navigation swaps in — and the same script tags as the page without mockups (C1, V1).

**Realizes.** F-11 · **Decisions.** ADR-5

| | Statement |
|---|---|
| C1 | Mockups MUST render correctly when a theme replaces page content by script (Material's and Zensical's `navigation.instant`), because they need no initialisation script and carry their CSS with the page. |
| C2 | mockitdown MUST NOT warn about or disable `navigation.instant`. |
| V1 | With `navigation.instant` on, navigating from a page without mockups to one with mockups shows them styled. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.12.10 | 2026-11-27 | test cases backfilled (#59); as built: C1 the block label is quoted ('Inbox'); TC-1 verifies C1-C4 (#59); as built: C1 lists callout_refs (true, R-ANN-004.C1); TC-2 verifies C1-C5 (#59); as built: C1 lists window, menubar, app (text) and windowed (boolean); TC-2 verifies C1-C5 (#59) |
| 0.12.0 | 2026-11-27 | SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.7 | 2026-11-27 | re-checked after the renderer split and the gallery spec split: unaffected (#53) |
| 0.10.2 | 2026-11-26 | checked against the changed item it cites; no obligation changes (audit #51) |
| 0.2.1 | 2026-11-24 | As built: the implementation now matches the clauses; known-deviation note removed |
| 0.2.0 | 2026-11-24 | Page created |
| 0.12.0 | 2026-11-27 | SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.7 | 2026-11-27 | re-checked after the renderer split and the gallery spec split: unaffected (#53) |
| 0.10.2 | 2026-11-26 | checked against the changed item it cites; no obligation changes (audit #51) |
| 0.2.1 | 2026-11-24 | As built: the implementation now matches the clauses; known-deviation note removed |
| 0.2.0 | 2026-11-24 | Page created |
