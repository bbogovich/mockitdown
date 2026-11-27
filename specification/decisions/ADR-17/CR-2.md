---
id: ADR-17.CR-2
target: ADR-17
kind: clarification
version: 0.10.3
date: 2026-11-26
issue: 51
summary: "re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51)"
from: 0d20bbc6f1a9
to: 3ed3bb89f5aa
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -3 +3,3 @@
 Checked at 0.10.1 after R-REPO-002.C8 and R-REPO-004.C15: the role rule table (`shared/language/roles.json`) and the edit corpus (`shared/conformance/edit/`) are written only in `shared/` and copied by each build, as D2 requires; the list in D2 is illustrative of that rule, not closed.
+
+Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.
```
