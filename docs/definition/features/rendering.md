---
title: "Features: rendering and integration"
def_version: 0.12.0
status: approved
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

**Layout without overlap (SRC-9).** The pack gallery showed controls drawn over each other and
presented surfaces collapsed to a small square. A mockup is a picture of a real screen, and a real
screen never shows siblings painted over each other: when space runs out, text truncates or wraps,
and controls keep their size. An element shown alone at `fit` is drawn whole, including what it presents.

**F-8.UC-1 — Review a screen in a pull request preview**

**Actor:** reviewer.

1. The reviewer opens the preview build of a changed specification page.

**Outcome:** the mockup looks like the target framework, renders without network access and
does not change when the page is rebuilt without source changes.

### F-9 — Light and dark appearance

**Requires:** F-3

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

**Desktop and tablet (SRC-9).** SwiftUI targets iPhone, iPad and Mac. On the Mac the global menu
bar is part of the application's interface — its menu titles and commands are designed text — so a
desktop mockup can show it, with one menu dropped down.

**F-10.UC-1 — Show a desktop screen in a browser window**

**Actor:** specification author.

1. The author sets `device="desktop" chrome="browser" url="https://shop.example.com/cart"`.

**Outcome:** the screen appears in a 1280×800 browser window frame showing the address, scaled to
the page width.

**F-10.UC-2 — Show a Mac app with its menu bar and an open menu**

**Actor:** specification author.

1. The author writes a SwiftUI mockup of a Mac app, sets `device="desktop"` and turns the menu bar on.
2. The author declares the app's menus (File, Edit, View, a custom menu) and marks the File menu open.

**Outcome:** the screen shows the macOS menu bar across the top — Apple menu, the app's name in
bold, its menus, the status items and clock — with the File menu dropped down over the window,
showing its commands, shortcuts and separators; below it, the app's window with traffic lights and toolbar.

### F-11 — Documentation-site integration

**Requires:** F-1

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

**Unknown labelled arguments (SRC-12#s13).** A misspelt or unsupported label used to vanish without a
trace, so an author could not tell why an argument had no effect, and an editor could not show it as
"not understood by this pack". It is now a warning.

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

### F-14 — Example site as user guide and end-to-end test

**Requires:** F-3, F-18

**Problem.** A renderer for seven frameworks regresses easily; users need to see what each pack
can do before adopting it.

**Change.** `examples/site` is both the user guide and the end-to-end fixture: an Installation page, one page per pack, a
language tour and a custom-components page, all checked by the test suite.

**F-14.UC-1 — Evaluate whether a framework is supported well enough**

**Actor:** developer choosing a tool.

1. The developer opens the example site's page for the framework the application uses.

**Outcome:** the developer sees simple controls, forms, lists, navigation and complete screens in
that framework's style, each with its source.

**F-14.UC-2 — Add mockups to an existing documentation site**

**Actor:** developer maintaining a Zensical or MkDocs site (or a plain web page).

1. The developer opens the User guide's Installation page.
2. The developer installs the Python package with its Markdown extra (or the web components), adds
   the configuration shown, writes a `mockitdown` block and builds the site.

**Outcome:** the built page shows the rendered mockup; the developer knows where each option,
including the import map, is configured.

### F-15 — Annotations and overlays

Manuals and design specifications explain screens by numbering their parts. mockitdown draws those numbers, pointers and selections as part of the mockup so they move with the layout.

**Overlays keep their marks (SRC-12#s13).** A dialog, a toast or a floating action button dropped its
own callouts, and callouts inside a dialog landed at the screen's top-left corner. An editor that lets
a designer annotate any element must not lose them, so marks on and inside overlays are drawn where
they belong.

**Who adds annotations, and when (SRC-18#answers).** Callouts exist for presenting a design in a
document — a design specification, a manual, a review page. They are added while the design is refined,
either in the mockitdown designer or in a SpecItOut application that holds the design, and are then
shown wherever the mockup is rendered.

**F-15.UC-1 — Present a design with numbered callouts in a document**

**Actor:** designer writing a design specification or a manual page.

1. The designer writes a mockup of the screen and attaches callouts 1 to 4 to the parts the text
   explains, choosing a colour for them.
2. The designer refers to (#1) to (#4) in the paragraphs around the mockup.

**Outcome:** the rendered page shows the mockup with numbered circles on those parts and the same
circles in the prose, so a reader matches each sentence to its part of the screen.

**F-15.UC-2 — Annotate a mockup while refining the design**

**Actor:** designer refining a design in the mockitdown designer or in a SpecItOut application.

1. The designer selects an element of a mockup and adds a callout, a pointer, a tap or a focus
   highlight to it, or marks a drag-selection over a group of elements.
2. The designer saves the design.

**Outcome:** the marks are part of the mockup's source; wherever the mockup is presented — the
designer's canvas, the SpecItOut document, a Markdown page — they are drawn on the elements they belong
to, including elements inside dialogs and other overlays.

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.12.0 | 2026-11-27 | Definition audit (#80): AC9 added for C9 |
| 0.11.1 | 2026-11-27 | definition audit (#80): missing requires / family and order; definition audit (#80): requires F-3, F-18; AC8 makes C7 observable |
| 0.11.0 | 2026-11-27 | Demo becomes User guide; Installation page for Python and TypeScript; every term the guide uses is defined (developer prompt 2026-11-27) |
| 0.10.0 | 2026-11-27 | SRC-18: annotations present a design in a document and are added while it is refined: N1, UC-1, UC-2 |
| 0.9.1 | 2026-11-26 | definition audit: tab bar has six sections since F-18.CR-4 added Gallery (#47) |
| 0.9.0 | 2026-11-26 | unknown labelled arguments are warned: C6, AC4, AC5 (ING-1); overlays keep their callouts; marks inside a dialog are placed at their elements: C5, C6, AC3 (ING-1) |
| 0.6.0 | 2026-11-25 | SRC-9: SwiftUI gallery defects, multi-platform chrome, macOS menu bar, meaningful samples |
| 0.4.0 | 2026-11-24 | Header tabs for Demo, Definition, Specification, Implementation and Reference; per-pack element gallery; retro pages in chronological order |
| 0.2.0 | 2026-11-24 | Page created |
| 0.11.1 | 2026-11-27 | definition audit (#80): missing requires / family and order; definition audit (#80): requires F-3, F-18; AC8 makes C7 observable |
| 0.11.0 | 2026-11-27 | Demo becomes User guide; Installation page for Python and TypeScript; every term the guide uses is defined (developer prompt 2026-11-27) |
| 0.10.0 | 2026-11-27 | SRC-18: annotations present a design in a document and are added while it is refined: N1, UC-1, UC-2 |
| 0.9.1 | 2026-11-26 | definition audit: tab bar has six sections since F-18.CR-4 added Gallery (#47) |
| 0.9.0 | 2026-11-26 | unknown labelled arguments are warned: C6, AC4, AC5 (ING-1); overlays keep their callouts; marks inside a dialog are placed at their elements: C5, C6, AC3 (ING-1) |
| 0.6.0 | 2026-11-25 | SRC-9: SwiftUI gallery defects, multi-platform chrome, macOS menu bar, meaningful samples |
| 0.4.0 | 2026-11-24 | Header tabs for Demo, Definition, Specification, Implementation and Reference; per-pack element gallery; retro pages in chronological order |
| 0.2.0 | 2026-11-24 | Page created |
