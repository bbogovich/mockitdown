---
id: R-PACK-012.CR-3
target: R-PACK-012
kind: clarification
version: 0.8.5
date: 2026-11-25
summary: C3 defers to R-PACK-013.C2 for declared samples (#10)
from: f8235ab5fdcf
to: 72d3b99df04b
---

## Clauses

@ C3 edit
~ The sample of an element MUST render without any diagnostic;{+ unless the element declares a sample (R-PACK-013.C2),+} the generator MUST simplify a sample (fewer arguments, no children) until it does, falling back to the bare call.

## Files

(none)
