---
title: Traceability to the prototype
spec_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: TRACE.1
---

# Traceability to the prototype

What the production design kept, changed and retired from the MockItOut prototype (SRC-3), with
the requirement or decision that now governs each point.

## Kept

| Prototype | Production | Governed by |
|---|---|---|
| A mockup notation inside Markdown fenced blocks | Same, the fence is named `mockitdown` | F-1, R-MDX-001 |
| Brace-delimited element calls `Type(args) { children }` | Same shape, as Swift calls with trailing closures | R-LANG-007 |
| HTML + CSS rendering as the primary output | The only output | ADR-1 |
| Device frames scaled with a container-query unit `--u` | Same idea; pack px rewritten to the unit | R-DEV-003, R-DEV-004, ADR-7 |
| `pymdownx.superfences` custom fence | Same mechanism, new module `mockitdown.fence` | R-MDX-001 |
| Strict mode failing the build on fence errors | Moved into the fence (`SuperFencesException`) | R-MDX-005 |
| `@id(x)` / `@ref ID` and the Elements table | `.id("x")` / `.ref("ID")` modifiers; `elements` option | R-REND-010, F-6 |
| `screen <ID> "title"` header | `@Screen(title, id:)` directive or fence `title`/`id` | R-EVAL-010 |
| Resilient rendering of unknown types (kit fallback) | `unknown` view, located error, labelled placeholder | R-EVAL-003, R-REND-008 |
| Zero runtime dependencies in the core | Same; Markdown packages as an extra | R-API-004, ADR-12 |
| CLI `render` and `check` | Same, plus `css`, `packs`, `elements` | R-CLI |
| Kits `base`, `swift`, `fiori` | Packs `base`, `swiftui`, `sapui5`, plus five more | R-PACK-008, ADR-13 |

## Changed

| Prototype | Production | Why |
|---|---|---|
| Notation `mockitout: 1` + `screen … kit: … form: …` | Declarative Swift/SwiftUI subset | SRC-2; ADR-2 |
| `component Name(p: Type) { … Slot("x") }`, `$var` interpolation | `struct Name: View { var p: Type; @ViewBuilder var x: Content; var body … }`, `\(p)` | ADR-2, ADR-10 |
| Kits as Python `ElementSpec` catalogues (`html_tag`, `control`, `allowed_children`, `states`) | Packs as data: `pack.json` elements mapped to render roles; `pack.css` | ADR-4 |
| Kit selected by `kit:` in the header or fence | Fence `pack` > `import <Module>` > `@Screen(pack:)` > site default | R-PACK-005 |
| `mio-*` light-DOM elements and declarative shadow DOM controls | Plain `div`/`span` markup with `mkd-<role>` classes and ARIA roles | R-REND-002, R-REND-007 |
| Kit CSS copied into the site by a plugin | CSS inlined per page by the extension, or linked via `mockitdown css` | ADR-8 |
| MkDocs plugin | Python-Markdown extension; no plugin | ADR-3 |
| Light theme only | Light and dark tokens per pack; `auto`, `both` | ADR-6 |
| Fence options `kit`, `form`, `render`; unknown options rejected the fence | Fence attributes listed in R-MDX-003; unknown ones reported | R-MDX-003 |
| `allowed_children` validation | Not enforced; any view may contain any view, as in SwiftUI | R-EVAL-003 |
| Python 3.14 minimum | Python 3.11 minimum | ADR-12 |
| Documentation built with MkDocs | Built with Zensical | ADR-14 |

## Retired

| Prototype | Reason | Governed by |
|---|---|---|
| SVG renderer (`render_svg.py`, `render=svg`, `--svg`) | Cannot be realistic across eight packs; double maintenance | ADR-1 |
| Real SAPUI5 web components (`ui5-*` tags) | Needs runtime JavaScript and network; non-deterministic | ADR-5 |
| `form <device> { … }` per-device overrides | One block per device is clearer | ADR-2 |
| `navigation.instant` warning | Static markup works with instant navigation | R-MDX-006 |
| The designer application (Electron, pywebview, Swift) | Out of scope for this project | definition OV.1 |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
