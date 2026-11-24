---
id: R-REND-010
title: Elements table and source disclosure
status: active
version: 0.2.0
rev: 0
page: REND.1
slot: reqs
order: 10
source: [SRC-3]
realizes: [F-6, F-1]
constrained_by: [A-REND-2, A-API-1]
reverse_engineered: true
hash: 489af3319e39
---

C1: When the `elements` option is on, the figure assembler MUST append `table.mkd-elements` with the columns ID, Element, Component and Refs, one row per view carrying `.id(…)`, in depth-first source order including slot, modifier and presentation content.
C2: When no view carries `.id(…)`, the figure assembler MUST NOT emit the table.
C3: When the `source` option is on, the library API MUST append `details.mkd-source` with the summary `Source` and the block's source, trimmed and escaped, in `pre > code.language-swift`.
V1: A block with `.id("total")` and `.id("place-order").ref("UC-CHK-3")` and `elements="true"` renders a two-row table; the second row's Refs cell is `UC-CHK-3`.
