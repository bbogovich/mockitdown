---
id: M-PACK-2
title: ElementDef
status: active
version: 0.10.0
rev: 1
page: MODEL.1
slot: entities
order: 7
level: entity
hash: aec95cdafdd0
refs: [R-PACK-016, R-PACK-017]
---

F1: name: str · key — the element name
F2: role: str — the render role
F3: params: list — attribute names of positional arguments, in order
F4: defaults: dict — attribute values applied before the call's arguments
F5: variants: list — documented values of `variant`
F6: doc: str — one line of usage
F7: rules: dict · optional — `{accepts}`, narrowing its role's rule for this element (R-PACK-016.C5)
F8: types: dict · optional — parameter name → type, adding to or overriding its role's `params` (R-PACK-017.C3)
I1: The role MUST be one of the renderer's roles.
