---
id: ADR-13.CR-1
target: ADR-13
kind: revision
version: 0.4.0
date: 2026-11-24
summary: Ant Design, Tailwind Catalyst, Carbon and Primer shipped in 0.4; no longer proposed next
from: e4264440d201
to: 0dc25358f575
---

## Clauses

@ D2 replace
- Ant Design is the proposed next pack.
+ Ant Design, Tailwind Catalyst, IBM Carbon and GitHub Primer followed in 0.4 (R-PACK-008); further candidates are listed on the example site's roadmap page.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -4,4 +4,4 @@
 **Decision.** Bootstrap — still the most deployed CSS component framework — and shadcn/ui — the
-fastest-growing React component style — are added; Ant Design, dominant in enterprise React, is
-next.
+fastest-growing React component style — are added. Ant Design (dominant in enterprise React), Tailwind Catalyst, IBM Carbon and GitHub
+Primer followed in 0.4.
 
```
