---
id: M-VIEW-1.CR-1
target: M-VIEW-1
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "node and derived ordinals: F11, F12 (ING-1)"
from: 05a3407e81f0
to: 391dbadd569d
---

## Clauses

@ F11 insert after F10
+ node: str · optional — ordinal (`n<k>`) of the view node it was produced from (R-EDIT-001.C4)
@ F12 insert after F11
+ derived: str · optional — ordinal of the innermost `ForEach` call, `if` statement or struct call that produced it (R-EDIT-004.C5)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,3 @@
 One node of the resolved view tree that the evaluator produces and the renderer consumes.
+
+`node` and `derived` are set when the source was evaluated for an edit-mode rendering (R-EDIT-004).
```
