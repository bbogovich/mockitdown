---
id: M-OPT-1.CR-1
target: M-OPT-1
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "render option edit: F22 (ING-1)"
from: d7143b395c02
to: 6394afa635d7
---

## Clauses

@ F22 insert after F21
+ edit: bool — edit-mode rendering, `data-mkd-node` and `data-mkd-derived` on role roots (default false; R-EDIT-004)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,3 @@
 Everything that can be set for one mockup, from the site, the fence or the CLI.
+
+`edit` is a library option (R-EDIT-004.C10); the fence and the command line do not offer it.
```
