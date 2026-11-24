---
title: "Features: rendering and integration"
def_version: 0.4.0
status: draft
updated: 2026-11-24
page_id: FEAT.2
---

# Features: rendering and integration

What the reader sees and how sites, tools and tests use mockitdown: realistic static HTML, light
and dark appearance, devices and chrome, documentation-site integration, diagnostics, the command
line and the example site.

### F-8 — Realistic, framework-matched HTML rendering

**Problem.** The prototype rendered either SVG boxes or real SAPUI5 web components loaded from a
CDN (SRC-3); neither gives a faithful, offline, deterministic picture for seven frameworks.

**Change.** Every pack is a static CSS replica of its framework, applied to one shared HTML markup.
Nothing runs in the browser, so pages stay fast, cacheable and safe.

**F-8.UC-1 — Review a screen in a pull request preview**

**Actor:** reviewer.

1. The reviewer opens the preview build of a changed specification page.

**Outcome:** the mockup looks like the target framework, renders without network access and
does not change when the page is rebuilt without source changes.

### F-9 — Light and dark appearance

**Problem.** A light mockup on a dark documentation page is jarring, and dark-mode screens need
review too.

**Change.** Colours are tokens with a light and a dark value per pack. A mockup can be fixed to one
mode, follow the page, or show both.

**F-9.UC-1 — Review the dark-mode variant**

**Actor:** designer.

1. The designer sets `appearance="both"` on a block.

**Outcome:** the page shows the light and dark renderings next to each other.

### F-10 — Devices, frames and chrome

**Problem.** A screen designed for a phone looks wrong stretched across a page; a desktop screen
needs its window.

**Change.** A frame has a logical size in points and scales uniformly to the column. Chrome is
drawn from the pack's platform, or forced per block.

**F-10.UC-1 — Show a desktop screen in a browser window**

**Actor:** specification author.

1. The author sets `device="desktop" chrome="browser" url="https://shop.example.com/cart"`.

**Outcome:** the screen appears in a 1280×800 browser window frame showing the address, scaled to
the page width.

### F-11 — Documentation-site integration

**Problem.** The prototype needed a MkDocs plugin (SRC-3); Zensical, the successor the project
moves to, does not run MkDocs plugins.

**Change.** mockitdown plugs in at the Markdown layer that every one of these tools shares: a
Python-Markdown extension for configuration and CSS, and a `pymdownx.superfences` custom fence for
the blocks.

**F-11.UC-1 — Add mockitdown to an existing Zensical site**

**Actor:** documentation-site maintainer.

1. The maintainer installs mockitdown with its `markdown` extra.
2. The maintainer adds the `mockitdown` extension and the `mockitdown` custom fence to `mkdocs.yml`.
3. The maintainer runs `zensical build`.

**Outcome:** every ```` ```mockitdown ```` block on the site renders as a figure, styled by CSS the
extension added to the pages that need it.

### F-12 — Diagnostics and strict builds

**Problem.** A mockup that silently renders wrongly is worse than none.

**Change.** One bad element never hides the rest: every stage collects located diagnostics. The
page shows the errors; the log lists everything; strict mode turns errors into a failed build.

**F-12.UC-1 — Fix a typo reported by the build**

**Actor:** specification author. **Precondition:** strict mode is on in CI.

1. The author writes `Buton("Save")`.
2. CI builds the site.

**Outcome:** the build fails with `error [unknown] at line 3:5: 'Buton' is not an element of pack …`;
locally, the page shows the same message above the figure and a `Buton` placeholder.

### F-13 — Command-line tool

**Problem.** Building a whole site to see one mockup is slow; editors and CI need a direct tool.

**Change.** The `mockitdown` command renders, checks, writes CSS and lists packs and elements.

**F-13.UC-1 — Check mockups in continuous integration**

**Actor:** developer.

1. CI runs `mockitdown check docs/mockups/*.mockitdown --json`.

**Outcome:** the job fails on any error, and the JSON lists each diagnostic with file, line and
column.

### F-14 — Example site as demo and end-to-end test

**Problem.** A renderer for seven frameworks regresses easily; users need to see what each pack
can do before adopting it.

**Change.** `examples/site` is both the demo and the end-to-end fixture: one page per pack, a
language tour and a custom-components page, all checked by the test suite.

**F-14.UC-1 — Evaluate whether a framework is supported well enough**

**Actor:** developer choosing a tool.

1. The developer opens the example site's page for the framework the application uses.

**Outcome:** the developer sees simple controls, forms, lists, navigation and complete screens in
that framework's style, each with its source.

### F-15 — Annotations and overlays

Manuals and design specifications explain screens by numbering their parts. mockitdown draws those numbers, pointers and selections as part of the mockup so they move with the layout.

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.4.0 | 2026-11-24 | Header tabs for Demo, Definition, Specification, Implementation and Reference; per-pack element gallery; retro pages in chronological order |
| 0.3.0 | 2026-11-24 | New F-15: Annotations and overlays |
| 0.2.0 | 2026-11-24 | Page created |
| 0.3.0 | 2026-11-24 | New F-15: Annotations and overlays |
| 0.2.0 | 2026-11-24 | Page created |
