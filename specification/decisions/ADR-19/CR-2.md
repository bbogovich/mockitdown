---
id: ADR-19.CR-2
target: ADR-19
kind: clarification
version: 0.10.2
date: 2026-11-26
issue: 51
summary: "checked against the changed item it cites; no obligation changes (audit #51)"
from: f7119ea29521
to: 78ea86a30472
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,3 @@
 Chosen by the developer (SRC-8#clar-script). A script element with an unknown type is never executed and its text is delivered verbatim.
+
+Checked at 0.10.1 after R-WEB-002.C13 (the boolean `edit` attribute): the code still comes from the script child; the attribute only selects the render option. D1 and C1 stand.
```
