---
id: R-EVAL-001
title: Evaluation always completes
status: active
version: 0.2.0
rev: 0
page: LANG.2
slot: reqs
order: 1
source: [SRC-3]
realizes: [F-2, F-12]
constrained_by: [A-EVAL-1, A-DIAG-1]
reverse_engineered: true
hash: 2f9acbb7704d
---

C1: The evaluator MUST turn a parsed module into a screen — the list of top-level views, the selected pack, the directive metadata and the names of the components used — and MUST NOT raise for any semantic problem.
C2: If the evaluator cannot resolve something, then it MUST report a diagnostic and continue, substituting an `unknown` view where a view was expected and `nil` where a value was expected.
C3: The evaluator MUST evaluate statements in source order, and each block (struct body, closure, branch) MUST have its own scope nested in the scope it is evaluated in.
V1: A block with an unknown element and an unknown modifier still yields a screen containing every other view, with one error and one warning.
