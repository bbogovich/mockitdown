---
id: M-PACK-2
title: ElementDef
status: active
version: 0.2.0
rev: 0
page: MODEL.1
slot: entities
order: 7
level: entity
hash: c7fba55fc7e4
---

F1: name: str · key — the element name
F2: role: str — the render role
F3: params: list — attribute names of positional arguments, in order
F4: defaults: dict — attribute values applied before the call's arguments
F5: variants: list — documented values of `variant`
F6: doc: str — one line of usage
I1: The role MUST be one of the renderer's roles.
<!-- file: prose.md -->
One element of a pack: how a framework component maps onto a render role.
