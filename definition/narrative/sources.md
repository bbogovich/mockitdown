---
title: Sources
def_version: 0.1.0
status: draft
updated: 2026-11-24
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
> /Users/brianbogovich/Documents/Projects/Dev/DevTools/MockItOut/prototype/MockItOut/mockitout-python. The final name
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

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
