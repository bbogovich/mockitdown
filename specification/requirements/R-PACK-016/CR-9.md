---
id: R-PACK-016.CR-9
target: R-PACK-016
kind: correction
version: 0.13.11
date: 2026-11-28
issue: 32
summary: "as built (#32): C1 the table carries reads (top level and per rule); C10 Python reads only the reads lists"
from: f7db65a4b17f
to: 2b79ec4df356
---

## Clauses

@ C1 edit
~ `shared/language/roles.json` MUST hold one rule (M-PACK-3) for every render role, as [-`{"root":-]{+`{"reads": […], "root":+} {"accepts": […]}, "roles": {"<role>": {"title", "category", "accepts", [-"attach"},-]{+"attach", "reads"},+} …}}`, the category being one of `frame`, `bar`, `layout`, `collection`, `content`, `overlay` and `annotation`, [-and -]the title the role's name in a refusal [-sentence.-]{+sentence, and the `reads` lists those of R-EVAL-004.C8.+}
@ C10 edit
~ The Python variant MUST package [-`roles.json`-]{+`roles.json`, MUST read only its `reads` lists (R-EVAL-004.C8)+} and MUST NOT report a diagnostic from [-it.-]{+its role rules.+}

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -30,3 +30,4 @@
 for now; a Python warning for a misplaced role can follow once the rules have been exercised by the
-gallery.
+gallery. The same file lists the labels each role reads (`reads`, R-EVAL-004.C8), which both evaluators
+use to warn about labelled arguments nothing understands.
 
```
