---
id: M-VIEW-4
title: Value
status: active
version: 0.2.0
rev: 0
page: MODEL.1
slot: entities
order: 5
level: entity
hash: 260b0e55c023
---

F1: kind: enum — the kinds of evaluated values
E1: scalar — `str`, `int`, `float`, `bool` or `nil`
E2: collection — list (arrays, ranges), tuple, dict (dictionaries, labelled tuples)
E3: EnumValue — a symbolic `.name`, with optional namespace (`Color.red` → namespace `Color`), positional and labelled arguments
E4: CallValue — a call of an unknown non-view callee used as a value (`GridItem(.flexible())`)
E5: ViewList — views used as a value (a view call passed as an argument)
E6: Thunk — an unevaluated closure with its scope; evaluated only where views are expected
I1: Enum values MUST stay symbolic until a role or the style builder interprets them.
