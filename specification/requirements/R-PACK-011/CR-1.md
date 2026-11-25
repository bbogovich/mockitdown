---
id: R-PACK-011.CR-1
target: R-PACK-011
kind: revision
version: 0.8.1
date: 2026-11-25
issue: 8
summary: "as built (#8): the attrs maps also apply to the parameter receiving a positional argument (C3), so Dialog(\"Edit\") in prime keeps its title"
from: f58baf3d4556
to: ef754c6cc574
---

## Clauses

@ C3 insert after V1
+ The evaluator MUST apply the same maps to the parameter name that receives a positional argument, so that a positional argument and the same argument labelled with its parameter's name set the same attribute.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,7 @@
+---
+id: TC-1
+title: Positional arguments take the parameter's alias
+verifies: [C1, C3]
+---
+
+Python (`test_fit.py`) and TypeScript (`render.test.ts`): in `prime`, whose `Dialog` has the parameter `header` mapped to `title`, `Dialog("Edit")` and `Dialog(header: "Edit")` render the same HTML, a dialog titled Edit.
--- a/prose.md
+++ b/prose.md
@@ -1 +1,6 @@
 Frameworks spell the same idea differently (`PlaceholderText`, `placeholder`, `hint`); aliases let each pack accept its own framework's names.
+
+**As built (issue #8).** A pack's `params` name a framework's own argument (`Dialog(header:)` in
+PrimeVue, `Toast(summary:)`), and its `attrs` map that name onto the attribute the render role reads.
+Until 0.8.1 the map was applied to labelled arguments only, so `Dialog("Edit")` in `prime` lost its
+title; 26 elements in eight packs were affected.
```
