---
id: R-CLI-006
title: packs and elements
status: active
version: 0.2.0
rev: 0
page: CLI.1
slot: reqs
order: 6
source: [SRC-2]
realizes: [F-13, F-3]
constrained_by: [A-CLI-1, A-PACK-1]
reverse_engineered: true
hash: 9ca49fb02f6d
---

C1: `mockitdown packs` MUST list every known pack, one line each with its id, name, element count and import modules; with `--json`, an array of objects with `id`, `name`, `framework`, `version`, `modules`, `device`, `elements` (count) and `own_elements` (names).
C2: `mockitdown elements PACK` MUST list the pack's elements sorted by name with role and positional parameters.
C3: With `--markdown`, `elements` MUST print a Markdown table with the columns Element, Role, Arguments, Defaults and Notes, marking inherited core elements `*(core)*` in packs other than `base` and replacing each vertical bar in notes with `/`.
C4: Both commands MUST include site packs given with `-P/--pack-path`.
V1: `mockitdown elements fluent --markdown` prints a table whose `InfoBar` row has role `alert` and whose `VStack` row is marked core.
