---
title: "Model"
spec_version: 0.2.0
status: draft
updated: 2026-11-24
page_id: MODEL.1
---

# Model

The data entities passed between the modules. The diagram is generated from the entities' fields and relations.

```mermaid
erDiagram
  RenderResult {
    str html
    list diagnostics
    list packs
    Screen screen
  }
  Diagnostic {
    Severity severity
    str message
    Location location
    str code
  }
  RenderOptions {
    str pack
    str default_pack
    str device
    str appearance
    str default_appearance
    int width
    int height
    str chrome
    str title
    str id
    bool caption
    bool elements
    bool source
    str url
    list import_paths
    list asset_paths
    list pack_paths
    bool embed_assets
    int max_embed_bytes
    path source_path
    bool show_warnings
  }
  Pack {
    str id PK
    str name
    str framework
    str version
    Pack parent
    list modules
    str device
    dict chrome
    dict tokens
    dict elements
    dict modifiers
    dict fonts
    dict sizes
    dict icons
    list own_elements
  }
  ElementDef {
    str name PK
    str role
    list params
    dict defaults
    list variants
    str doc
  }
  Module {
    str source
    list imports
    list attributes
    list structs
    list statements
  }
  View {
    str name PK
    str role
    ElementDef element
    dict attrs
    list extra_args
    list children
    dict slots
    list modifiers
    str component
    Location loc
  }
  Modifier {
    str name
    list args
    dict kwargs
    list content
    dict slots
    Location loc
  }
  Screen {
    list views
    Pack pack
    dict meta
    list components
  }
  Value {
    enum kind
  }
  RenderResult ||--o{ Diagnostic : "diagnostics"
  RenderResult ||--|o Screen : "screen"
  Pack ||--|o Pack : "parent"
  Pack ||--o{ ElementDef : "elements"
  View ||--|o ElementDef : "definition"
  View ||--o{ Modifier : "modifiers"
  Screen ||--o{ View : "views"
  Screen ||--|| Pack : "pack"
```

#### M-SYN-1 — Module

The syntax tree of one block or component file.

**Level.** entity

| | Statement |
|---|---|
| F1 | source: str · optional — the file the source came from (empty for a fenced block) |
| F2 | imports: list · ordered — `Import` nodes, each with a quoted `path` or a dotted `module` name |
| F3 | attributes: list · ordered — top-level directives (`@Screen`) |
| F4 | structs: list · ordered — `StructDecl` nodes: name, conformances, properties, optional body |
| F5 | statements: list · ordered — top-level statements, including `#Preview` contents |
| I1 | A module MUST be produced only by the parser and MUST NOT be modified by the evaluator. |

---

#### M-VIEW-1 — View

One node of the resolved view tree that the evaluator produces and the renderer consumes.

**Level.** entity

| | Statement |
|---|---|
| F1 | name: str · key — the element or struct name as written (`Button`, `InfoBar`), or the unknown name |
| F2 | role: str — the render role, or `unknown` |
| F3 | element: ElementDef · optional — the pack element definition it came from |
| F4 | attrs: dict — attribute name → evaluated value, defaults first then arguments |
| F5 | extra_args: list — positional arguments beyond the element's params |
| F6 | children: list — views of the unlabelled trailing closure (or `content`) |
| F7 | slots: dict — label → views, from labelled closures and view-valued arguments |
| F8 | modifiers: list — recorded rendered modifiers, in order |
| F9 | component: str · optional — the struct whose body this view is the root of |
| F10 | loc: Location — where the view was written |
| R1 | definition: → M-PACK-2 (0..1) — the element definition |
| R2 | modifiers: → M-VIEW-2 (0..*) — recorded modifiers |
| I1 | A view's role MUST be a renderer role or `unknown`. |

---

#### M-VIEW-2 — Modifier

A rendered modifier kept on a view for the style builder and the renderer.

**Level.** entity

| | Statement |
|---|---|
| F1 | name: str — the modifier name (`padding`, `alert`) |
| F2 | args: list — positional argument values |
| F3 | kwargs: dict — labelled argument values |
| F4 | content: list · optional — views of the unlabelled trailing closure |
| F5 | slots: dict — label → views of labelled closures (`message:`) |
| F6 | loc: Location — where the modifier was written |
| I1 | Only rendered modifiers (R-EVAL-009.C4) MUST be recorded; pack-mapped modifiers become attributes instead. |

---

#### M-VIEW-3 — Screen

One evaluated mockup.

**Level.** entity

| | Statement |
|---|---|
| F1 | views: list — the top-level views |
| F2 | pack: Pack — the selected pack |
| F3 | meta: dict — `@Screen` metadata (title, id, device, appearance, chrome, url, pack, …) |
| F4 | components: list — names of the structs instantiated, in first-use order |
| R1 | views: → M-VIEW-1 (0..*) — top-level views |
| R2 | pack: → M-PACK-1 (1) — the selected pack |

---

#### M-VIEW-4 — Value

What an expression evaluates to.

**Level.** entity

| | Statement |
|---|---|
| F1 | kind: enum — the kinds of evaluated values |
| E1 | scalar — `str`, `int`, `float`, `bool` or `nil` |
| E2 | collection — list (arrays, ranges), tuple, dict (dictionaries, labelled tuples) |
| E3 | EnumValue — a symbolic `.name`, with optional namespace (`Color.red` → namespace `Color`), positional and labelled arguments |
| E4 | CallValue — a call of an unknown non-view callee used as a value (`GridItem(.flexible())`) |
| E5 | ViewList — views used as a value (a view call passed as an argument) |
| E6 | Thunk — an unevaluated closure with its scope; evaluated only where views are expected |
| I1 | Enum values MUST stay symbolic until a role or the style builder interprets them. |

---

#### M-PACK-1 — Pack

A loaded design pack.

**Level.** entity

| | Statement |
|---|---|
| F1 | id: str · key — the identifier used in fences and directories |
| F2 | name: str — display name |
| F3 | framework: str — the imitated framework |
| F4 | version: str — the framework version followed |
| F5 | parent: Pack · optional — the extended pack |
| F6 | modules: list — names accepted by `import <Module>` |
| F7 | device: str — default device form |
| F8 | chrome: dict — device form → chrome kind |
| F9 | tokens: dict — `light`/`dark` → token name → CSS value (merged with ancestors) |
| F10 | elements: dict — element name → definition (merged with ancestors) |
| F11 | modifiers: dict — modifier name → attribute mapping (merged) |
| F12 | fonts: dict — font alias → canonical style (own only; looked up through the lineage) |
| F13 | sizes: dict — device form → (width, height) (merged) |
| F14 | icons: dict — icon name → glyph name (merged) |
| F15 | own_elements: list — element names defined by this pack itself |
| R1 | parent: → M-PACK-1 (0..1) — inheritance |
| R2 | elements: → M-PACK-2 (0..*) — element definitions |
| I1 | The lineage MUST be acyclic and end at a pack with no parent. |

---

#### M-PACK-2 — ElementDef

One element of a pack: how a framework component maps onto a render role.

**Level.** entity

| | Statement |
|---|---|
| F1 | name: str · key — the element name |
| F2 | role: str — the render role |
| F3 | params: list — attribute names of positional arguments, in order |
| F4 | defaults: dict — attribute values applied before the call's arguments |
| F5 | variants: list — documented values of `variant` |
| F6 | doc: str — one line of usage |
| I1 | The role MUST be one of the renderer's roles. |

---

#### M-OPT-1 — RenderOptions

Everything that can be set for one mockup, from the site, the fence or the CLI.

**Level.** entity

| | Statement |
|---|---|
| F1 | pack: str · optional — forced pack (fence `pack`) |
| F2 | default_pack: str — pack when nothing selects one (default `base`) |
| F3 | device: str · optional — device form (fence `device`) |
| F4 | appearance: str · optional — light &#124; dark &#124; auto &#124; both (fence `appearance`) |
| F5 | default_appearance: str — default `light` |
| F6 | width: int · optional — frame width in points |
| F7 | height: int · optional — frame height in points |
| F8 | chrome: str — chrome kind, `auto` (default) or `none` |
| F9 | title: str · optional — caption title |
| F10 | id: str · optional — caption id |
| F11 | caption: bool — show the caption (default true) |
| F12 | elements: bool — append the Elements table (default false) |
| F13 | source: bool — append the source disclosure (default false) |
| F14 | url: str · optional — browser chrome address |
| F15 | import_paths: list — import directories |
| F16 | asset_paths: list — asset directories |
| F17 | pack_paths: list — site pack directories |
| F18 | embed_assets: bool — inline local images (default true) |
| F19 | max_embed_bytes: int — embed size cap (default 2000000) |
| F20 | source_path: path · optional — file the source came from |
| F21 | show_warnings: bool — show warnings in the page (default false) |
| I1 | Render options MUST be immutable; overrides produce a new value. |

---

#### M-DIAG-1 — Diagnostic

One reported problem.

**Level.** entity

| | Statement |
|---|---|
| F1 | severity: Severity — `error` or `warning` |
| F2 | message: str — human-readable text |
| F3 | location: Location — line, col (1-based; 0 unknown) and source file name |
| F4 | code: str — the diagnostic code (R-DIAG-003) |
| I1 | Two diagnostics with equal severity, message and location MUST be treated as the same. |

---

#### M-API-1 — RenderResult

What `render` returns.

**Level.** entity

| | Statement |
|---|---|
| F1 | html: str — error box, figure and optional source disclosure |
| F2 | diagnostics: list — every diagnostic, in order |
| F3 | packs: list — ids of the selected pack's lineage, root first; empty on a syntax error |
| F4 | screen: Screen · optional — the evaluated screen |
| R1 | diagnostics: → M-DIAG-1 (0..*) — reported problems |
| R2 | screen: → M-VIEW-3 (0..1) — the evaluated mockup |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
