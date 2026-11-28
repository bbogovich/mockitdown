---
id: R-EVAL-003.CR-3
target: R-EVAL-003
kind: correction
version: 0.13.24
date: 2026-11-28
issue: 45
summary: "as built (#45): C10 names the element and unknown views of a dotted call (a struct gives its own views); TC-2 names the eval-dotted-names cases and the unit tests"
from: 7931eba27b14
to: 6f4828f542de
---

## Clauses

@ C10 edit
~ The{+ element+} view of a dotted call MUST keep the dotted name as written as its name (M-VIEW-1.F1), and an unresolved dotted call MUST be reported by C2 with the dotted [-name.-]{+name, its `unknown` view named by it; a dotted call that resolves to a struct produces the struct's views.+}

## Files

```diff
--- a/TC-2.md
+++ b/TC-2.md
@@ -6,5 +6,11 @@
 
-Conformance cases `eval-dotted-names` in both suites: in a pack with `BadgeRibbon`, `Badge.Ribbon("New")`
-renders the same element as `BadgeRibbon("New")` with `data-el="Badge.Ribbon"`; `Color.red` still makes a
-colour; `Nope.Thing()` is an `unknown` error naming `Nope.Thing`; a `let` named `Badge` makes
-`Badge.Ribbon` a member access, not a dotted name.
+Conformance cases `eval-dotted-names`, `eval-dotted-names-unknown` and `eval-dotted-names-variable` in both
+suites (pack `antd`): `Badge.Ribbon("New")` renders the same element as `BadgeRibbon("New")` with
+`data-el="Badge.Ribbon"`; `Color.red` still makes a colour; `Nope.Thing { Text("in") }` is an `unknown`
+error naming `Nope.Thing`, its `unknown` view holding the `Text`; a `let` named `Badge` makes
+`Badge.Ribbon` a member access (an unknown-modifier warning), not a dotted name.
+
+Unit tests in both suites, `python/tests/test_dotted_names.py` and `typescript/tests/unit/dotted-names.test.ts`:
+the same cases, plus a dotted call with modifiers and as a `let` value, a dotted call resolving a struct
+of the joined name (`Card.Meta()` calls `CardMeta`), a three-part name (`A.B.C()`) and edit mode marking the
+dotted node (`data-mkd-node`).
```
