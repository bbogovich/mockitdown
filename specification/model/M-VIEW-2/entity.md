---
id: M-VIEW-2
title: Modifier
status: active
version: 0.2.0
rev: 0
page: MODEL.1
slot: entities
order: 3
level: entity
hash: 2d226ef4dbb3
---

F1: name: str — the modifier name (`padding`, `alert`)
F2: args: list — positional argument values
F3: kwargs: dict — labelled argument values
F4: content: list · optional — views of the unlabelled trailing closure
F5: slots: dict — label → views of labelled closures (`message:`)
F6: loc: Location — where the modifier was written
I1: Only rendered modifiers (R-EVAL-009.C4) MUST be recorded; pack-mapped modifiers become attributes instead.
