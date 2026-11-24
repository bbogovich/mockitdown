---
id: R-IMP-004
title: Definition precedence
status: active
version: 0.2.0
rev: 0
page: IMP.1
slot: reqs
order: 4
source: [SRC-2]
realizes: [F-4]
constrained_by: [A-EVAL-1]
decisions: [ADR-10]
reverse_engineered: true
hash: 1d3b6334955c
---

C1: When several loaded files declare a struct of the same name, the later declaration in load order MUST replace the earlier one, and the evaluator MUST warn "struct S from <file> replaces an earlier definition" with code `import`.
C2: A struct declared in the block MUST replace an imported struct of the same name without a diagnostic.
C3: A struct (declared or imported) MUST take precedence over a pack element of the same name (R-EVAL-003.C1).
V1: A block importing a library with `KPI` and declaring its own `KPI` uses its own.
