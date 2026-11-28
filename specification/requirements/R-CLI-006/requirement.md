---
id: R-CLI-006
title: packs and elements
status: active
version: 0.12.8
rev: 1
page: CLI.1
slot: reqs
order: 6
source: [SRC-2]
realizes: [F-13, F-3]
constrained_by: [A-CLI-1, A-PACK-1]
reverse_engineered: true
hash: f6558c270429
refs: [R-PACK-010]
---

C1: `mockitdown packs` MUST list every known pack except the hidden ones (R-PACK-010.C1), one line each with its id, name, element count and import modules; with `--json`, an array of objects with `id`, `name`, `framework`, `version`, `modules`, `device`, `elements` (count) and `own_elements` (names).
C2: `mockitdown elements PACK` MUST list the pack's elements sorted by name with role and positional parameters.
C3: With `--markdown`, `elements` MUST print a Markdown table with the columns Element, Role, Arguments, Defaults and Notes, marking inherited core elements `*(core)*` in packs other than `base` and replacing each vertical bar in notes with `/`.
C4: Both commands MUST include site packs given with `-P/--pack-path`.
C5: With `--own`, `elements` MUST list only the pack's own elements, leaving out those it inherits.
V1: `mockitdown elements fluent --markdown` prints a table whose `InfoBar` row has role `alert` and whose `VStack` row is marked core.
