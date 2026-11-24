---
id: M-PACK-1
title: Pack
status: active
version: 0.2.0
rev: 0
page: MODEL.1
slot: entities
order: 6
level: entity
hash: 5d492c0eeec9
---

F1: id: str · key — the identifier used in fences and directories
F2: name: str — display name
F3: framework: str — the imitated framework
F4: version: str — the framework version followed
F5: parent: Pack · optional — the extended pack
F6: modules: list — names accepted by `import <Module>`
F7: device: str — default device form
F8: chrome: dict — device form → chrome kind
F9: tokens: dict — `light`/`dark` → token name → CSS value (merged with ancestors)
F10: elements: dict — element name → definition (merged with ancestors)
F11: modifiers: dict — modifier name → attribute mapping (merged)
F12: fonts: dict — font alias → canonical style (own only; looked up through the lineage)
F13: sizes: dict — device form → (width, height) (merged)
F14: icons: dict — icon name → glyph name (merged)
F15: own_elements: list — element names defined by this pack itself
R1: parent: → M-PACK-1 (0..1) — inheritance
R2: elements: → M-PACK-2 (0..*) — element definitions
I1: The lineage MUST be acyclic and end at a pack with no parent.
