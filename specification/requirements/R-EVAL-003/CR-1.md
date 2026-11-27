---
id: R-EVAL-003.CR-1
target: R-EVAL-003
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "dotted element names resolve to the joined name (F-2.C7): C9, C10, TC-2 (ING-1)"
from: 67f4fcecc197
to: 74ae63fcae83
---

## Clauses

@ meta.source
- [SRC-2]
+ [SRC-2, SRC-12]
@ C9 insert after V1
+ When a call's callee is a dotted name `A.B` (or `A.B.C`) whose parts all begin with an uppercase letter and whose first part is neither a variable in scope nor `Color`, the evaluator MUST resolve the call as C1 resolves the joined name (`AB`), so that `Badge.Ribbon(…)` calls the element `BadgeRibbon`.
@ C10 insert after C9
+ The view of a dotted call MUST keep the dotted name as written as its name (M-VIEW-1.F1), and an unresolved dotted call MUST be reported by C2 with the dotted name.

## Files

```diff
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,10 @@
+---
+id: TC-2
+title: Dotted element names
+verifies: [C9, C10]
+---
+
+Conformance cases `eval-dotted-names` in both suites: in a pack with `BadgeRibbon`, `Badge.Ribbon("New")`
+renders the same element as `BadgeRibbon("New")` with `data-el="Badge.Ribbon"`; `Color.red` still makes a
+colour; `Nope.Thing()` is an `unknown` error naming `Nope.Thing`; a `let` named `Badge` makes
+`Badge.Ribbon` a member access, not a dotted name.
--- a/prose.md
+++ b/prose.md
@@ -3 +3,5 @@
 a SwiftUI `ViewBuilder`.
+
+**Dotted element names (F-2.C7, SRC-12#s13).** Component libraries name sub-components with a dot
+(`Badge.Ribbon`, `Card.Meta`). Packs keep their joined names (`BadgeRibbon`), and a dotted call resolves
+to the joined name, so both spellings work and no pack changes. `Color.red` keeps its own meaning (C6).
```
