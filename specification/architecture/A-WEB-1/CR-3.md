---
id: A-WEB-1.CR-3
target: A-WEB-1
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "editing core functions: P2 (ING-1)"
from: 0c408e3392df
to: 8146c4037b98
---

## Clauses

@ P2 insert after P1
+ provides: the editing core — `parseTree`, `reparse` and `edit` (R-EDIT-001 to R-EDIT-003), the `edit` render option (R-EDIT-004), `canContain` and `allowedChildren` (R-PACK-016) and `parameterTypes` and `modifierTypes` (R-PACK-017)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -5 +5,3 @@
 The renderer is ported module for module: `render/html.ts` (roles), `render/style.ts` (modifiers → CSS), `render/charts.ts` (SVG charts), `render/chrome.ts` (device chrome), `render/index.ts` (figure assembly and the anchor prefix), with `icons.ts` reading the shared icon table and `asset-resolver.ts` resolving images against an asset base URL instead of embedding them (R-WEB-001.C7). Python's number formatting (`%.Nf`, `%g`, `round`, ties to even on the exact binary value) is reproduced in `pyformat.ts`, and the anchor prefix's SHA-1 in `sha1.ts`, synchronously and without Node's `crypto` (K1).
+
+The editing core keeps the same constraint (K1): it works on source text and returns text edits.
```
