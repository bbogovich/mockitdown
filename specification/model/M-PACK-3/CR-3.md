---
id: M-PACK-3.CR-3
target: M-PACK-3
kind: correction
version: 0.13.12
date: 2026-11-28
issue: 33
summary: "as built (#33): the role table's reads lists became the keys of typed params maps (top-level params for the common labels); parameterTypes and modifierTypes; a label an element's types names is understood"
from: 4d01a5a4370f
to: 19406476fe81
---

## Clauses

@ F5 edit
~ params: dict — labelled argument → type (`text`, `number`, `bool`, `color`, `icon`, `enum`, [-`array`)-]{+`array`); its keys are the labels the role reads besides those every role reads (the table's top-level `params`, R-EVAL-004.C8)+}
@ F7 delete
- reads: list — the labels the role reads besides those every role reads (the table's top-level `reads`, R-EVAL-004.C8)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1 @@
-One entry of `shared/language/roles.json` (R-PACK-016, R-PACK-017).
+One entry of `shared/language/roles.json` (R-PACK-016, R-PACK-017). The `reads` list it carried after #32 was folded into `params` (#33): the labels a role reads are the keys of its typed `params`.
```
