---
id: R-EVAL-002
title: What a block renders
status: active
version: 0.2.0
rev: 0
page: LANG.2
slot: reqs
order: 2
source: [SRC-2]
realizes: [F-1, F-2]
constrained_by: [A-EVAL-1]
reverse_engineered: true
hash: 49e7e8f7ea18
---

C1: The evaluator MUST render the module's top-level statements, including those from `#Preview` blocks, as the screen's views.
C2: When a module has no top-level statements but declares structs, the evaluator MUST render an instance of the last struct declared in the block, called without arguments.
C3: If the screen has no views, then the evaluator MUST report the warning "the mockup has no views" with code `empty`.
V1: A block containing only `struct Login: View { var body: some View { … } }` renders the Login view; an empty block produces the `empty` warning.
<!-- file: prose.md -->
A block that only declares a view renders it, as Xcode's preview canvas would; this lets authors
paste a view struct without writing an extra call.
