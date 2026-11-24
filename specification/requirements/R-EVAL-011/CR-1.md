---
id: R-EVAL-011.CR-1
target: R-EVAL-011
kind: clarification
version: 0.2.1
date: 2026-11-24
summary: "As built: the implementation now matches the clauses; known-deviation note removed"
from: b0409b83f3f7
to: fce4708196ec
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -2,6 +2 @@
 accepted and dropped; `@State` values become the state the mockup shows.
-
-**Known deviation.** The implementation on `main` (0.1.0) evaluates a behaviour-only modifier's
-trailing closure before discarding it, so `.onTapGesture { wifi.toggle() }` draws a spurious
-`unknown modifier .toggle()` warning. C5 states the intended behaviour; see the implementation's
-known-debt list.
```
