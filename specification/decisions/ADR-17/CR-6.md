---
id: ADR-17.CR-6
target: ADR-17
kind: clarification
version: 0.12.11
date: 2026-11-27
issue: 81
summary: "constrains list dropped: R-REPO-001..003 carry constrained_by ADR-17, ending the mutual citation (#81)"
from: f7d4ca9a1cf8
to: 3b012dfeab8e
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -10 +10,3 @@
 Re-checked with R-REPO-002 and R-PACK-018 as recorded as built (#54): the two builds resolve partials by the same steps, written once in each build script and verified by one fixture in both suites, so a pack change is still one commit both suites verify (C1); no obligation changed.
+
+**Citations.** R-REPO-001, R-REPO-002 and R-REPO-003 each name this decision in their own `constrained_by`; the decision no longer lists them in `constrains`, so that re-checking one of them does not flag the other as a suspect (#81). No obligation changed.
```
