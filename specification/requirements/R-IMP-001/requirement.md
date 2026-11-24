---
id: R-IMP-001
title: File imports load components
status: active
version: 0.2.0
rev: 0
page: IMP.1
slot: reqs
order: 1
source: [SRC-2]
realizes: [F-4]
constrained_by: [A-EVAL-1]
decisions: [ADR-10]
reverse_engineered: true
hash: f5fbe7bcb71c
---

C1: When a block contains `import "path"`, the evaluator MUST load the struct declarations of the named component file before evaluating the block's own declarations and views.
C2: A component file MUST be mockitdown source; only its imports and struct declarations take effect.
C3: If a component file contains top-level statements, then the evaluator MUST ignore them and warn "<file>: top-level views in an imported file are ignored" with code `import`.
C4: Directives in a component file MUST be ignored.
V1: Importing a file that declares `KPI` and also contains `Text("demo")` makes `KPI` available and warns once about the ignored view.
