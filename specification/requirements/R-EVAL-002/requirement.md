---
id: R-EVAL-002
title: What a block renders
status: active
version: 0.12.9
rev: 1
page: LANG.2
slot: reqs
order: 2
source: [SRC-2]
realizes: [F-1, F-2]
constrained_by: [A-EVAL-1]
reverse_engineered: true
hash: 1c90e6fe0f5a
---

C1: The evaluator MUST render the module's top-level statements, including those from `#Preview` blocks, as the screen's views.
C2: When a module has no top-level statements but declares structs, the evaluator MUST render an instance of the last struct declared in the block, called without arguments.
C3: If the screen has no views, then the evaluator MUST report the warning "the mockup has no views" with code `empty`.
C4: When the evaluator renders that implicit instance (C2), a property with no default and no argument MUST take its own name as placeholder text (a view property: no views), with no diagnostic; structs that instance uses get no placeholders.
V1: A block containing only `struct Login: View { var body: some View { … } }` renders the Login view; an empty block produces the `empty` warning.
