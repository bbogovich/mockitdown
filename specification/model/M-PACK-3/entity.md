---
id: M-PACK-3
title: RoleRule
status: active
version: 0.13.11
rev: 2
page: MODEL.1
slot: entities
order: 11
hash: 4d01a5a4370f
level: entity
refs: [R-EVAL-004]
---

F1: role: str · key — the render role; the root of a mockup has its own entry `root`, holding only `accepts`
F2: category: str — frame | bar | layout | collection | content | overlay | annotation
F3: accepts: list — the roles, or `@category` names, its views may hold as children
F4: attach: str — child | presentation | modifier
F5: params: dict — labelled argument → type (`text`, `number`, `bool`, `color`, `icon`, `enum`, `array`)
F6: title: str — the role's name in a refusal sentence (`horizontal stack`, `list item`)
F7: reads: list — the labels the role reads besides those every role reads (the table's top-level `reads`, R-EVAL-004.C8)
I1: Every render role MUST have exactly one rule.
