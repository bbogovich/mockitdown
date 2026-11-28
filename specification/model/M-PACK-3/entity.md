---
id: M-PACK-3
title: RoleRule
status: active
version: 0.13.7
rev: 1
page: MODEL.1
slot: entities
order: 11
hash: f508be336ca9
level: entity
---

F1: role: str · key — the render role; the root of a mockup has its own entry `root`, holding only `accepts`
F2: category: str — frame | bar | layout | collection | content | overlay | annotation
F3: accepts: list — the roles, or `@category` names, its views may hold as children
F4: attach: str — child | presentation | modifier
F5: params: dict — labelled argument → type (`text`, `number`, `bool`, `color`, `icon`, `enum`, `array`)
F6: title: str — the role's name in a refusal sentence (`horizontal stack`, `list item`)
I1: Every render role MUST have exactly one rule.
