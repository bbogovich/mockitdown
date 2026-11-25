---
id: R-DIAG-003
title: Diagnostic codes
status: active
version: 0.2.0
rev: 0
page: DIAG.1
slot: reqs
order: 3
source: [SRC-3]
realizes: [F-12]
constrained_by: [A-DIAG-1]
reverse_engineered: true
hash: bbe75130e69f
---

C1: Diagnostics MUST use these codes: `syntax` (lexing or parsing), `empty` (no views), `directive` (unknown directive), `pack` (pack selection or loading), `import` (component files), `unknown` (unknown element, view or name), `view` (an expression that is not a view), `foreach`, `recursion`, `argument` (struct arguments), `struct` (struct without body), `modifier` (unknown modifier, invalid class name), `value` (value evaluation), `role` (pack element with an unknown role), `icon`, `asset`, `device`, `appearance`, `chrome` and `fence` (fence attributes).
C2: Adding a code MUST be a change to this specification.
V1: Every diagnostic produced by the test suite has one of the listed codes.
<!-- file: prose.md -->
Codes let tools filter diagnostics (`check --json`) without parsing messages. The
[Diagnostics](diagnostics.md) page lists each code with its severity and typical message.
