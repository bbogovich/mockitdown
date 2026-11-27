---
id: ADR-17.CR-1
target: ADR-17
kind: clarification
version: 0.10.2
date: 2026-11-26
issue: 51
summary: "checked against the changed item it cites; no obligation changes (audit #51)"
from: 63c70c92fef2
to: 0d20bbc6f1a9
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,3 @@
 Two variants rendering the same packs must not drift apart; keeping the assets once and copying them at build time makes drift a test failure rather than a merge problem (SRC-8).
+
+Checked at 0.10.1 after R-REPO-002.C8 and R-REPO-004.C15: the role rule table (`shared/language/roles.json`) and the edit corpus (`shared/conformance/edit/`) are written only in `shared/` and copied by each build, as D2 requires; the list in D2 is illustrative of that rule, not closed.
```
