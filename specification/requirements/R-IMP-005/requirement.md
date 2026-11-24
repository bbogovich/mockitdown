---
id: R-IMP-005
title: Import errors and caching
status: active
version: 0.2.0
rev: 0
page: IMP.1
slot: reqs
order: 5
source: [SRC-2]
realizes: [F-4, F-12]
constrained_by: [A-EVAL-1, A-DIAG-1]
reverse_engineered: true
hash: a4e3df6e8549
---

C1: If a component file cannot be read, then the evaluator MUST report "cannot read import 'x': <reason>" with code `import` and continue.
C2: If a component file has a syntax error, then the evaluator MUST report that syntax error, located in that file, and continue without its declarations.
C3: The evaluator MAY cache parsed component files across mockups in one process, keyed by resolved path and modification time; a changed file MUST be re-parsed.
V1: A library with a syntax error on its line 4 produces `error [syntax] at <path>:4:…` and the block still renders its other content.
