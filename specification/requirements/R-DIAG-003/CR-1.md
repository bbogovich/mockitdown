---
id: R-DIAG-003.CR-1
target: R-DIAG-003
kind: revision
version: 0.8.3
date: 2026-11-25
issue: 9
summary: "as built (#9): diagnostic code chart (a chart with no data, R-REND-012.C7)"
from: bbe75130e69f
to: 139a96227d3b
---

## Clauses

@ C1 edit
~ Diagnostics MUST use these codes: `syntax` (lexing or parsing), `empty` (no views), `directive` (unknown directive), `pack` (pack selection or loading), `import` (component files), `unknown` (unknown element, view or name), `view` (an expression that is not a view), `foreach`, `recursion`, `argument` (struct arguments), `struct` (struct without body), `modifier` (unknown modifier, invalid class name), `value` (value evaluation), `role` (pack element with an unknown role), `icon`, `asset`, `device`, `appearance`, [-`chrome`-]{+`chrome`, `chart` (a chart with no data)+} and `fence` (fence attributes).

## Files

(none)
