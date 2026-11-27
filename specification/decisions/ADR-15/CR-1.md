---
id: ADR-15.CR-1
target: ADR-15
kind: clarification
version: 0.10.2
date: 2026-11-26
issue: 51
summary: "checked against the changed item it cites; no obligation changes (audit #51)"
from: 0846dade5b91
to: 98c91312fe07
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -5 +5,3 @@
 **Consequences.** One extra layer per decorated element; unique anchor names per figure.
+
+Checked at 0.10.1 after R-ANN-003.C6 (marks inside a dialog): the screen-level layer and its inline fallback are kept, only positioned within the dialog; D1, D2 and C1 stand.
```
