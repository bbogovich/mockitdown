---
id: R-IMP-003
title: Nested imports and cycles
status: active
version: 0.2.0
rev: 0
page: IMP.1
slot: reqs
order: 3
source: [SRC-2]
realizes: [F-4]
constrained_by: [A-EVAL-1]
decisions: [ADR-10]
reverse_engineered: true
hash: 64e0c562d52e
---

C1: The evaluator MUST process a component file's own file imports, depth first, before taking its struct declarations.
C2: The evaluator MUST load each resolved file at most once per mockup; an import of a file already loaded in that mockup, including an import cycle, MUST be skipped silently.
V1: Files `a` importing `b` and `b` importing `a` both load once without a diagnostic.
<!-- file: prose.md -->
Cycles are harmless — libraries only declare — so they are ignored rather than reported.
