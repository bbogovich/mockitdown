---
id: M-DIAG-1
title: Diagnostic
status: active
version: 0.2.0
rev: 0
page: MODEL.1
slot: entities
order: 9
level: entity
hash: d2dcaedcb171
---

F1: severity: Severity — `error` or `warning`
F2: message: str — human-readable text
F3: location: Location — line, col (1-based; 0 unknown) and source file name
F4: code: str — the diagnostic code (R-DIAG-003)
I1: Two diagnostics with equal severity, message and location MUST be treated as the same.
