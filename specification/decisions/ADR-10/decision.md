---
id: ADR-10
title: Custom components are structs, imported from files by path
status: active
version: 0.12.11
rev: 2
page: ADR.2
slot: decisions
order: 3
source: [SRC-2, SRC-3]
constrains: [R-IMP-001, R-IMP-002, R-IMP-003, R-IMP-004, R-EVAL-005]
hash: 652753b548c8
refs: [ADR-24, R-IMP-007, R-PACK-005]
---

D1: Custom components are `struct` declarations, inline or in `.mockitdown` files loaded with `import "path"`.
D2: Paths resolve against the importing file's directory, then through the import map (ADR-24, which replaced `import_paths`); `.mockitdown` may be omitted; cycles are ignored; within one library later definitions replace earlier ones, across libraries a qualified name selects one (R-IMP-007), and block-local ones replace imported ones.
O1: rejected: the prototype's `component Name(p: Type) { … Slot("x") }` — a bespoke form; SwiftUI structs express the same with `@ViewBuilder` properties.
O2: rejected: register components in the site configuration — moves component code out of the documentation and away from the pages using it.
O3: rejected: import by module name (`import Components`) — collides with pack selection by module (R-PACK-005).
C1: The same struct code works in a block, in a library and in real SwiftUI.
C2: Libraries written with core elements render in every pack.
