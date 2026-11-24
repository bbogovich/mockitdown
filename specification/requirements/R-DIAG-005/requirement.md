---
id: R-DIAG-005
title: Syntax errors and partial rendering
status: active
version: 0.2.0
rev: 0
page: DIAG.1
slot: reqs
order: 5
source: [SRC-3]
realizes: [F-12]
constrained_by: [A-API-1]
reverse_engineered: true
hash: 9ef12b57a306
---

C1: When the source has a syntax error, the library API MUST return the error box as the whole HTML, with no figure and an empty pack list.
C2: When the source parses but has other errors, the library API MUST return the error box followed by the complete figure, with unknown elements as placeholders (R-REND-008).
V1: `Text(` renders only an error box; `VStack { Foo() }` renders an error box and a figure containing an `mkd-unknown` placeholder.
