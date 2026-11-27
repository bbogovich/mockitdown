---
id: A-REPO-1.CR-2
target: A-REPO-1
kind: revision
version: 0.11.0
date: 2026-11-27
summary: "SRC-18: the shared asset tree also holds packs/_partials/, language/roles.json and conformance/edit/"
from: 0003722d7c80
to: ef7a3ec317fb
---

## Clauses

@ P1 edit
~ provides: the shared asset tree `shared/` — `packs/<id>/pack.json` and `pack.css`, {+`packs/_partials/<name>.css` (stylesheet partials, R-PACK-018), +}`css/page.css`, `icons/icons.json`, `language/vocabulary.json`,{+ `language/roles.json`,+} `images/`, `patterns/*.mockitdown`, `reference/<pack>.json` and `reference/index.json`, `conformance/`{+ (with the edit corpus `conformance/edit/`)+}

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,2 @@
 The single source of everything both variants publish (ADR-17).
+**At 0.11.0 (SRC-18).** P1 also names the stylesheet partials, the role rule table and the edit corpus.
```
