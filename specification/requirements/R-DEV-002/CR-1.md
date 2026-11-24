---
id: R-DEV-002.CR-1
target: R-DEV-002
kind: clarification
version: 0.2.1
date: 2026-11-24
summary: "As built: the implementation now matches the clauses; known-deviation note removed"
from: 1c85fc7c0e03
to: 310b1b390165
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1,5 +1 @@
 The site default sits between the block's own metadata and the pack's platform default.
-
-**Known deviation.** In the implementation on `main` (0.1.0) the extension passes `default_device`
-as the render option `device`, so it overrides `@Screen(device:)` instead of yielding to it (C1).
-See the implementation's known-debt list.
```
