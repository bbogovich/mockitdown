---
id: ADR-24
title: An import map of named libraries replaces import directories
status: active
version: 0.12.0
rev: 0
page: ADR.2
slot: decisions
order: 999
hash: 1c99bd899375
source: [SRC-19]
constrains: [R-IMP-002, R-IMP-004, R-IMP-007, R-IMP-008, R-IMP-009, R-MDX-002, R-WEB-001]
---

D1: Component library files are found through an import map — keys are namespaces (path prefixes ending in `/`), exact paths or the empty root key; targets are directories, files or URLs, or lists of them — in the manner of TypeScript's `paths` and the browser import map; it replaces the list of import directories `import_paths`, which becomes a configuration error.
D2: Each import belongs to a named library (its first path segment, or an `as` alias); components of different libraries never replace one another, a qualified `Library.Name` selects one, and an unqualified name is used only when it is unique.
D3: A page can declare a library in a block (`library="name"`), imported by later blocks of the page as `import "#name"`.
D4: Components are templates through SwiftUI's own means: value properties with defaults, and `@ViewBuilder` view properties as content slots — the trailing closure fills `content`, labelled closures or arguments fill named slots, a slot may have default content or be optional.
O1: rejected: keeping `import_paths` beside the map — two mechanisms for one job; the empty key `""` expresses a search directory.
O2: rejected: selective imports (`import { Card as AcmeCard } from "acme/cards"`) — not Swift syntax; qualified names are how Swift disambiguates two modules' types.
O3: rejected: making every struct of an earlier block visible to later blocks — implicit and order-dependent; a named library block is explicit and the same in the web components.
O4: rejected: a separate template syntax (`Slot("x")`, a `@ContentBuilder` attribute) — `@ViewBuilder` properties already express slots, and the code stays valid SwiftUI (ADR-10.C1).
C1: Existing sites change `import_paths: [d]` to `imports: {"": d}`; the build error says so.
C2: The language gains `import "…" as Name` and qualified component calls; the Python and TypeScript variants implement both identically (F-16).
