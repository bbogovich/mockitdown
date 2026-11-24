---
title: "Features: authoring"
def_version: 0.4.0
status: draft
updated: 2026-11-24
page_id: FEAT.1
---

# Features: authoring

What an author can write: the fenced block, the notation, the framework packs, custom components,
images, element identifiers and site-defined packs. Rendering, integration and tooling are on
[Features: rendering and integration](rendering.md).

### F-1 — Mockups in Markdown fenced blocks

**Problem.** Mockups drawn in design tools drift from the requirements: they live in another file
format, are reviewed separately and are rarely updated when a requirement changes.

**Change.** A mockup becomes text inside the Markdown page — a fenced block tagged `mockitdown` —
and the documentation build renders it as a figure. Fence attributes tune one rendering (device,
light or dark, size, caption) without touching the code.

````markdown
```mockitdown device="phone" title="Inbox"
NavigationStack { List { Text("Hello") }.navigationTitle("Inbox") }
```
````

**F-1.UC-1 — Illustrate a requirement with a mockup**

**Actor:** specification author. **Precondition:** the documentation site has the mockitdown
extension configured (F-11).

1. The author writes a requirement page and, below the requirement, a ```` ```mockitdown ```` block
   describing the screen.
2. The author adds `device="phone" title="Checkout"` to the fence.
3. The author builds the site.

**Outcome:** the page shows the requirement followed by a phone-sized, captioned mockup of the
checkout screen; the Markdown file remains the single source for both.

### F-2 — SwiftUI-syntax notation

**Problem.** A bespoke mockup language must be learnt and has no tooling; drawing tools do not
read as text. The prototype's notation (`mockitout: 1`, `screen`, `component`, `@id`) was its own
dialect (SRC-3).

**Change.** The notation is a declarative subset of Swift and SwiftUI. Developers recognise it,
editors highlight it as Swift, and real SwiftUI code can be pasted in. The same syntax describes a
Fluent, Material or SAPUI5 screen — only the element names change.

**F-2.UC-1 — Paste a SwiftUI view into the specification**

**Actor:** developer. **Precondition:** an existing SwiftUI view in the application.

1. The developer copies the view's `struct … : View` declaration into a ```` ```mockitdown ```` block.
2. The developer adds `import SwiftUI` (or `pack="swiftui"` on the fence).
3. The site is built.

**Outcome:** the page shows the view in SwiftUI style; property wrappers, bindings and event
handlers in the pasted code are tolerated; elements the pack does not know are flagged with a
located error and drawn as labelled placeholders.

**F-2.UC-2 — Generate rows from data**

**Actor:** specification author.

1. The author declares `let people = [("Ana", "Design"), ("Ben", "Engineering")]`.
2. The author writes `List { ForEach(people) { name, team in Row(name, subtitle: team) } }`.

**Outcome:** the mockup shows one row per person; adding a tuple adds a row.

### F-3 — Framework design packs

**Problem.** A wireframe does not show what the user will see; one hand-made style per project
does not scale to the frameworks teams actually use.

**Change.** A *pack* captures one framework: its component names, its colours and typography for
light and dark mode, its window or device chrome and its stylesheet. mockitdown ships packs for
SwiftUI, Fluent (WinUI 3), Material UI, Angular Material, SAPUI5 (Fiori), Bootstrap and shadcn/ui,
on top of a neutral wireframe pack every other pack extends.

**F-3.UC-1 — Show the same screen in the target framework**

**Actor:** designer.

1. The designer writes a settings form with `Form`, `Section`, `Toggle` and `Picker`.
2. The designer renders it with `pack="fluent"`, then with `pack="mui"`.

**Outcome:** the two figures show the same structure styled as a WinUI 3 settings page and as a
Material UI form respectively.

**F-3.UC-2 — Use a framework-native component**

**Actor:** developer of an SAPUI5 application.

1. The developer selects the SAPUI5 pack (an `import` of one of its module names, or
   `pack="sapui5"`) and uses the framework's own component names, such as an object page header.

**Outcome:** the mockup uses the Fiori Horizon look for those components; core elements in the same
block are styled to match.

### F-4 — Custom reusable components

**Problem.** Real applications use components that no framework ships — a KPI tile, a person row,
a status pill. Repeating their layout in every mockup is error-prone.

**Change.** Components are `struct` views, exactly as in SwiftUI. Declared in a `.mockitdown` file in
the site's import directory, they are imported by path and used like built-in elements:

```swift
import "shared/kpi"
KPI(label: "Revenue", value: "$48.2k")
```

**F-4.UC-1 — Share a component library across a site**

**Actor:** documentation-site maintainer.

1. The maintainer writes `docs/mockups/shared/kpi.mockitdown` declaring `struct KPI: View`.
2. The maintainer sets the extension's import directory to `docs/mockups`.
3. Authors write `import "shared/kpi"` in any block and use `KPI(…)`.

**Outcome:** every page renders the same KPI component; changing the library changes every mockup
on the next build.

### F-5 — Embedded external assets

**Problem.** A mockup without images looks unfinished; relative image paths break when a page is
served under a different URL or when the HTML fragment is reused elsewhere.

**Change.** Image references are resolved when the site is built. Local images are inlined as
`data:` URIs; remote ones are linked; anything else is refused. Icons come from mockitdown's own
icon set, addressed by SF Symbols, Material, Fluent or SAP icon names.

**F-5.UC-1 — Show a product photo in a mockup**

**Actor:** designer. **Precondition:** `docs/assets/images/photo-2.svg` exists and `docs` is an asset
directory.

1. The designer writes `Image("assets/images/photo-2.svg").resizable().frame(width: 180, height: 120)`.

**Outcome:** the built page shows the photo inside the mockup; the page has no dependency on the
image's URL.

### F-6 — Element identifiers and the Elements table

**Problem.** Prose such as "the button at the bottom" is ambiguous; requirements need stable names
for parts of a screen.

**Change.** `.id()` and `.ref()` tag elements; `elements="true"` adds the Elements table under the
figure. This keeps the prototype's Elements table (SRC-3) in the new notation.

**F-6.UC-1 — Trace a control to a use case**

**Actor:** specification author.

1. The author writes `Button("Place order").id("place-order").ref("UC-CHK-3")` and sets
   `elements="true" id="SCR-CHK-2"` on the fence.

**Outcome:** the figure is captioned `SCR-CHK-2 · …` and followed by a table row
`place-order · Button · · UC-CHK-3`; requirement text can cite `SCR-CHK-2 place-order`.

### F-7 — Site-defined design packs

**Problem.** Many applications use a corporate design system derived from a public framework.

**Change.** Packs are data, so a site adds its own the same way mockitdown ships them: a directory
with `pack.json` and `pack.css`, listed in the extension's `pack_paths`.

**F-7.UC-1 — Mock up screens in a corporate design system**

**Actor:** documentation-site maintainer.

1. The maintainer creates `packs/acme/pack.json` extending `mui` with the corporate colours and a
   few corporate components, and `packs/acme/pack.css`.
2. The maintainer adds `pack_paths: [packs]` to the extension configuration.

**Outcome:** blocks with `pack="acme"` render in the corporate style, including the Material UI
elements the pack inherits.

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.4.0 | 2026-11-24 | Ant Design has shipped; the roadmap page now names the next packs |
| 0.2.0 | 2026-11-24 | Page created |
| 0.2.0 | 2026-11-24 | Page created |
