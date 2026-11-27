---
id: ADR-10
title: Custom components are structs, imported from files by path
status: active
version: 0.2.0
rev: 0
page: ADR.2
slot: decisions
order: 3
source: [SRC-2, SRC-3]
constrains: [R-IMP-001, R-IMP-002, R-IMP-003, R-IMP-004, R-EVAL-005]
hash: 49b1b23588dc
---

D1: Custom components are `struct` declarations, inline or in `.mockitdown` files loaded with `import "path"`.
D2: Paths resolve against the importing file's directory, then `import_paths`; `.mockitdown` may be omitted; cycles are ignored; later definitions replace earlier ones and block-local ones replace imported ones.
O1: rejected: the prototype's `component Name(p: Type) { … Slot("x") }` — a bespoke form; SwiftUI structs express the same with `@ViewBuilder` properties.
O2: rejected: register components in the site configuration — moves component code out of the documentation and away from the pages using it.
O3: rejected: import by module name (`import Components`) — collides with pack selection by module (R-PACK-005).
C1: The same struct code works in a block, in a library and in real SwiftUI.
C2: Libraries written with core elements render in every pack.
<!-- file: prose.md -->
**Context.** SRC-2: "a site can define custom reusable controls within a doc site; import
statements at the start of the fenced code block can indicate where to retrieve the custom
components from."

**Decision.** Swift's own component mechanism, plus a quoted-path import.

**Consequences.** Components are evaluated per use (no compilation step); a deep or recursive
component is cut off by the nesting limit.
