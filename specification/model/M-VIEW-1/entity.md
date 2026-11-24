---
id: M-VIEW-1
title: View
status: active
version: 0.2.0
rev: 0
page: MODEL.1
slot: entities
order: 2
level: entity
hash: 05a3407e81f0
---

F1: name: str · key — the element or struct name as written (`Button`, `InfoBar`), or the unknown name
F2: role: str — the render role, or `unknown`
F3: element: ElementDef · optional — the pack element definition it came from
F4: attrs: dict — attribute name → evaluated value, defaults first then arguments
F5: extra_args: list — positional arguments beyond the element's params
F6: children: list — views of the unlabelled trailing closure (or `content`)
F7: slots: dict — label → views, from labelled closures and view-valued arguments
F8: modifiers: list — recorded rendered modifiers, in order
F9: component: str · optional — the struct whose body this view is the root of
F10: loc: Location — where the view was written
R1: definition: → M-PACK-2 (0..1) — the element definition
R2: modifiers: → M-VIEW-2 (0..*) — recorded modifiers
I1: A view's role MUST be a renderer role or `unknown`.
