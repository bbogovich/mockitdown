---
id: R-PACK-011
title: Argument aliases
status: active
version: 0.8.1
rev: 1
page: PACK.1
slot: reqs
order: 999
source: [SRC-2]
reverse_engineered: true
hash: ef754c6cc574
---

C1: A pack MAY map argument labels onto attribute names with `attrs` (pack-wide) and an element MAY do so with its own `attrs`; the evaluator MUST apply the element map, then the pack map, to labelled arguments and to labelled trailing closures.
C2: A colour value naming no known colour MUST resolve to the pack token of the same name in kebab case (`.primaryContainer` → `var(--mkd-primary-container)`).
V1: In a pack mapping `placeholderText` to `placeholder`, `TextBox(placeholderText: "x")` shows the placeholder x.
C3: The evaluator MUST apply the same maps to the parameter name that receives a positional argument, so that a positional argument and the same argument labelled with its parameter's name set the same attribute.
