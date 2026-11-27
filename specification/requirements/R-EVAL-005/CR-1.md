---
id: R-EVAL-005.CR-1
target: R-EVAL-005
kind: revision
version: 0.12.0
date: 2026-11-27
summary: "SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide"
from: 89e60f4b1c67
to: 58e40b599dcf
---

## Clauses

@ C2 edit
~ The evaluator MUST bind the unlabelled trailing closure to [-the first-]{+a+} view-typed, non-computed property that no labelled argument [-bound,-]{+bound:+} [-and-]{+the one named `content` if there is one, else the first in declaration order that has no default, else the first; it MUST bind+} each labelled trailing closure to the property of its label; if there is no such property, then it MUST warn with code `argument`.
@ V2 insert after V1
+ `struct Shell: View { @ViewBuilder var sidebar: some View = Text("Nav"); @ViewBuilder var content: some View; var body: some View { … } }` called as `Shell { Text("Hi") }` binds `content` to the closure and `sidebar` to its default, with no diagnostic.

## Files

```diff
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,7 @@
+---
+id: TC-2
+title: Trailing closure prefers content
+verifies: [C2]
+---
+
+A struct with `@ViewBuilder var sidebar: some View = Text("Nav")` declared before `@ViewBuilder var content: some View` binds the trailing closure to `content`; a struct with slots `header` (defaulted) and `body2` (no default) and no `content` binds it to `body2`; a struct whose only view property is defaulted binds it there. Automated in both variants.
```
