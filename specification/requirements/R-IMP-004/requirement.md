---
id: R-IMP-004
title: Definition precedence
status: active
version: 0.12.0
rev: 1
page: IMP.1
slot: reqs
order: 4
source: [SRC-2]
realizes: [F-4]
constrained_by: [A-EVAL-1]
decisions: [ADR-10]
reverse_engineered: true
hash: a9708a1c5f9a
refs: [R-EVAL-003, R-IMP-007]
---

C1: When several loaded files of the same library (R-IMP-007.C1) declare a struct of the same name, the later declaration in load order MUST replace the earlier one, and the evaluator MUST warn "struct S from <file> replaces an earlier definition" with code `import`.
C2: A struct declared in the block MUST replace an imported struct of the same name without a diagnostic.
C3: A struct (declared or imported) MUST take precedence over a pack element of the same name (R-EVAL-003.C1).
C4: Structs of the same name in different libraries MUST NOT replace one another, and loading them MUST NOT produce a diagnostic; each stays reachable by its qualified name (R-IMP-007.C4).
V1: A block importing a library with `KPI` and declaring its own `KPI` uses its own.
V2: Importing `acme/cards` and `contoso/cards`, both declaring `Card`, loads both silently; two files imported `as UI` that both declare `Card` warn once, and the later one is `UI.Card`.
