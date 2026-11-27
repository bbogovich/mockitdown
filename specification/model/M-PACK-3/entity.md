---
id: M-PACK-3
title: RoleRule
status: active
version: 0.10.0
rev: 0
page: MODEL.1
slot: entities
order: 11
hash: 811b6cb0244d
level: entity
---

F1: role: str · key — the render role (`root` for the root of a mockup)
F2: category: str — frame | bar | layout | collection | content | overlay | annotation
F3: accepts: list — the roles, or `@category` names, its views may hold as children
F4: attach: str — child | presentation | modifier
F5: params: dict — labelled argument → type (`text`, `number`, `bool`, `color`, `icon`, `enum`, `array`)
I1: Every render role MUST have exactly one rule.
