---
id: R-DIAG-002
title: Collecting diagnostics
status: active
version: 0.2.0
rev: 0
page: DIAG.1
slot: reqs
order: 2
source: [SRC-3]
realizes: [F-12]
constrained_by: [A-DIAG-1]
reverse_engineered: true
hash: 84f28e52ad3e
---

C1: Every stage MUST report problems to one diagnostics collector per rendering and MUST NOT print or raise them, except that a syntax error is raised (R-LANG-009).
C2: The collector MUST keep diagnostics in the order reported and MUST drop a diagnostic equal in severity, message and location to an earlier one.
V1: An unknown icon used in a `ForEach` over five items is reported once.
<!-- file: prose.md -->
One collector per rendering means one bad element never hides another, and repeated problems are
reported once.
