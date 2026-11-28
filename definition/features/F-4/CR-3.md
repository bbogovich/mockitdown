---
id: F-4.CR-3
target: F-4
kind: revision
version: 0.13.0
date: 2026-11-27
issue: "#84"
summary: "components may not embed themselves (#84, SRC-20): F-4.C11/AC9; R-EVAL-005.C10 cycle detection replaces the depth limit for recursion, C11 depth backstop, TC-3"
from: 92a7b9d431dd
to: fc2be679c8e9
---

## Clauses

@ meta.source
- [SRC-2, SRC-3]
+ [SRC-2, SRC-3, SRC-20]
@ C11 insert after C10
+ A component cannot contain itself, directly or through other components: recursion is not valid for a UI component. A component that does is reported as an error wherever it is used and renders nothing there, and the rest of the mockup still renders.
@ AC9 insert after AC8
+ A component whose body uses itself, once, twice or through another component, is reported promptly with one error naming the cycle, and every other view in the block renders. (SRC-20)

## Files

(none)
