---
title: Sources
def_version: 0.12.0
status: approved
updated: 2026-11-27
page_id: SRC
---

# Sources

The documents the features are drawn from. Sources are quoted verbatim in `definition/sources/`
and cited by ID (`SRC-2`) from features and requirements.

## SRC-1 — the developer's description

> Markdown extension rendering SwiftUI-syntax UI mockups as framework-styled HTML

Recorded 2026-11-23 when the project was initialised.

## SRC-2 — the productization request

Recorded 2026-11-23. Verbatim:

> We are productizing the markdown extension currently defined as a prototype in
> ~/…/MockItOut/prototype/MockItOut/mockitout-python. The final name
> will be "mockitdown", both for the project and the id in markdown fenced code blocks. This will be a VibeItOut project
> with specification and implementation in the same repository. This repository will have the specification and
> implementation documentation both in the docs branch, published to github pages. We are switching from MkDocs to
> Zensical for the docs. Produce a technical specification in the docs derived from the prototype implementation. the
> purpose of the project is to enable user interface mockups to be defined in a markdown file in a fenced code block,
> and rendered in the page as a realistic mockup styled to match the components in a final application. The code block
> structure is similar to SwiftUI view structs and follows the same syntax; the available UI elements will vary
> depending on which UI framework is being illustrated (currently defined as "packs" in the prototype). We need support
> for SwiftUI, Windows with Fluent design language, and the most popular web frameworks (Angular, React; propose others
> - support current version of MaterialUI). SAPUI5 also should be supported. Ideally light and dark modes per type
> should be supportable. Migrate the prototype code to this repository, clean up the architecture and codebase to be
> production ready and maintainable. Create an example MkDocs / Zensical site using the extension to illustrate each
> supported framework on its own page, with user interfaces of varied levels of complexity in each. This will be used
> for automated tests to verify the behavior and as a working demo. The UI design packs should include as many
> components of each framework as possible to be fairly comprehensive. For the examples, follow common UI design
> patterns. The framwork needs to be able to embed external assets, usually images, so embed links need to be
> supported. Individual apps may have custom controls defined, so we need an extension mechanism where a site can
> define custom reusable controls within a doc site; import statements at the start of the fenced code block can
> indicate where to retrieve the custom components from. The result in the rendered doc site is styled HTML matching
> the specificed UI framework's components and styling.

**How the request maps to features.** Fenced blocks named `mockitdown` → F-1. SwiftUI-like syntax →
F-2. Packs for SwiftUI, Fluent, Angular, React/Material UI, SAPUI5 and proposed others (Bootstrap,
shadcn/ui; Ant Design next) with comprehensive components → F-3. Light and dark per pack → F-9.
Realistic styled HTML → F-8. Embedded assets → F-5. Custom controls with imports → F-4 (and
site-defined packs, F-7). Zensical documentation → F-11. Example site as demo and test → F-14.

## SRC-3 — the MockItOut prototype

The throwaway spike at `MockItOut/prototype/MockItOut/` (October 2026): the `mockitout` notation, the
`base`/`swift`/`fiori` kits, HTML and SVG renderers, a MkDocs plugin with a superfences fence,
strict mode and the Elements table, and ADR-001 (HTML primary, SVG secondary). What the production
design kept, changed and retired is traced in the specification's
[Traceability to the prototype](../specification/traceability.md).

## SRC-4 to SRC-11 — later requests from the developer

Each is quoted verbatim in `definition/sources/` and cited by ID from the features it shaped.

| Source | Recorded | Request | Features citing it |
|---|---|---|---|
| SRC-4 | 2026-11-24 | More platforms (Android, GTK, Qt, KDE Plasma), non-standard components, overlays and annotations, charts | F-3, F-15 |
| SRC-5 | 2026-11-24 | Retro packs, Windows 3.1.1 in Retro, sci-fi easter eggs, demos on GitHub Pages | F-3 |
| SRC-6 | 2026-11-24 | Web kits from the roadmap, more retro systems in chronological order, tabbed documentation with a Reference section | F-3, F-14 |
| SRC-7 | 2026-11-24 | Wireframe sketch and Vue packs | F-3 |
| SRC-8 | 2026-11-25 | TypeScript web components beside the Python library (`python/`, `typescript/`, `shared/`) | F-16, F-17, F-18, F-19, F-20 |
| SRC-9 | 2026-11-25 | SwiftUI gallery defects, desktop and tablet chrome, the macOS menu bar | F-3, F-8, F-10, F-18 |
| SRC-10 | 2026-11-25 | Gallery tabs for elements and design examples; more complex layout examples | F-18 |
| SRC-11 | 2026-11-26 | Show source for each gallery example | F-18 |

## SRC-12 to SRC-16 — the MockItDown Designer batch (ING-1)

Ingest batch ING-1, recorded 2026-11-26: the designer's design document (SRC-12, `design.src.html`), the
mockups `main-window` (SRC-13), `insert` (SRC-14) and `canvas` (SRC-15), and the designer's work list
(SRC-16, `designer-ING-1.plan.md`). They are kept as assets and cited by page (`SRC-12#p3`). They shaped
F-2, F-12, F-15, F-16, F-19, F-20 and F-21. SRC-14 and SRC-16 are not cited by a feature directly.

## SRC-17 — publish the pack gallery

Recorded 2026-11-26: "Are the latest docs deployed to github pages? I don't see the gallery." Shaped F-18
(C12, C13, AC10).

## SRC-18 — audit answers, pack stylesheets, gallery home page, more packs

Recorded 2026-11-27: the developer's answers to the definition and specification audit questions,
the request to write shared pack stylesheet rules once, a gallery home page with links to the
science-fiction easter eggs and GitHub release builds of the TypeScript library, and new packs — the
Amiga, Windows 1.0 in its default colours (with a screenshot, kept as `assets/SRC-18-win1.png`), a fuller
GS/OS, further retro systems from the GUI timeline, and Palm, BlackBerry, Windows CE and Newton in the
Mobile group. The two pages it points to were read on 2026-11-27 and are summarised in the source.
Shaped F-3, F-15, F-17, F-18 and F-20.

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
| 0.9.1 | 2026-11-26 | Sources SRC-4 to SRC-17 and batch ING-1 listed (definition audit, #47) |
| 0.10.0 | 2026-11-27 | SRC-18 added; SRC-4 to SRC-7 now cited by F-3 |
