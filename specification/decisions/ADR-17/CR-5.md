---
id: ADR-17.CR-5
target: ADR-17
kind: clarification
version: 0.12.4
date: 2026-11-27
issue: 54
summary: re-check sentence names R-PACK-018 too, released with R-REPO-002 and R-PACK-018 (#54)
from: c768cdeee880
to: f7d4ca9a1cf8
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -9,2 +9,2 @@
 
-Re-checked at 0.12.2 after R-REPO-002 was recorded as built (#54): the two builds resolve partials by the same steps, written once in each build script and verified by one fixture in both suites, so a pack change is still one commit both suites verify (C1); no obligation changed.
+Re-checked with R-REPO-002 and R-PACK-018 as recorded as built (#54): the two builds resolve partials by the same steps, written once in each build script and verified by one fixture in both suites, so a pack change is still one commit both suites verify (C1); no obligation changed.
```
