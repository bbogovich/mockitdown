---
id: ADR-20.CR-1
target: ADR-20
kind: clarification
version: 0.10.2
date: 2026-11-26
issue: 51
summary: "checked against the changed item it cites; no obligation changes (audit #51)"
from: d4a23f378eaa
to: a1b5e11ca14d
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,3 @@
 Chosen by the developer (SRC-8#clar-deps), following the rule that third-party dependencies are avoided unless building the feature would be prohibitively expensive. Playwright: licence Apache-2.0, maintained by Microsoft with monthly releases, development only.
+
+Checked at 0.10.1 after R-WEB-001.C13/C17 (reference data copied by the build script): no development or runtime dependency is added, so D1, D2 and C1 stand.
```
