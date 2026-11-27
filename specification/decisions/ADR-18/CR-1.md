---
id: ADR-18.CR-1
target: ADR-18
kind: clarification
version: 0.10.2
date: 2026-11-26
issue: 51
summary: "checked against the changed item it cites; no obligation changes (audit #51)"
from: 645ec0ba7b8d
to: 92918e05fcce
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,3 @@
 A port duplicates logic, so a shared corpus of mockups and expected HTML decides what "the same" means and catches any difference automatically.
+
+Checked at 0.10.1 after R-WEB-001.C13/C17 and R-REPO-004.C6/C15: the reference data and the edit render option are carried by both variants (the `edit` option is rendered by both, R-EDIT-004, and held to the Python output by the conformance corpus), so D1 to D3 and C1 stand.
```
