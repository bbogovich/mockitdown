---
id: ADR-17.CR-4
target: ADR-17
kind: clarification
version: 0.12.3
date: 2026-11-27
issue: 54
summary: "re-checked after R-REPO-002 0.12.2 (#54): no obligation changed"
from: 0964d92fab81
to: c768cdeee880
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -8 +8,3 @@
 partials of R-PACK-018. A partial is published only inside the pack stylesheets that include it.
+
+Re-checked at 0.12.2 after R-REPO-002 was recorded as built (#54): the two builds resolve partials by the same steps, written once in each build script and verified by one fixture in both suites, so a pack change is still one commit both suites verify (C1); no obligation changed.
```
