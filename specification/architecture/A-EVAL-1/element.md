---
id: A-EVAL-1
title: Evaluator
status: active
version: 0.2.0
rev: 0
page: ARCH.1
slot: elements
order: 6
level: module
hash: d75956d9de9f
---

P1: provides: `Evaluator.evaluate(module)` → `Screen`; the modifier vocabulary (`RENDERED`, `IGNORED`, `NEUTRAL_MODULES`); the import cache (`mockitdown.evaluate`, `mockitdown.vocabulary`)
U1: uses A-PACK-1 — select the pack and look up elements and modifier maps
U2: uses A-SYN-2 — parse imported component files
U3: uses A-DIAG-1 — report semantic problems
K1: The evaluator MUST always complete and MUST NOT produce HTML.
K2: The evaluator MUST NOT know any framework; framework knowledge lives in packs.
