---
id: A-WEB-1.CR-4
target: A-WEB-1
kind: revision
version: 0.10.5
date: 2026-11-27
issue: 49
summary: "as built: the TypeScript role functions live in role-family modules under core/render/roles/, mirroring the Python split; render/html.ts keeps the Renderer and the dispatch (#49)"
from: 8146c4037b98
to: f5043dfabec6
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -4,3 +4,3 @@
 
-The renderer is ported module for module: `render/html.ts` (roles), `render/style.ts` (modifiers → CSS), `render/charts.ts` (SVG charts), `render/chrome.ts` (device chrome), `render/index.ts` (figure assembly and the anchor prefix), with `icons.ts` reading the shared icon table and `asset-resolver.ts` resolving images against an asset base URL instead of embedding them (R-WEB-001.C7). Python's number formatting (`%.Nf`, `%g`, `round`, ties to even on the exact binary value) is reproduced in `pyformat.ts`, and the anchor prefix's SHA-1 in `sha1.ts`, synchronously and without Node's `crypto` (K1).
+The renderer is ported module for module: `render/html.ts` (the `Renderer`, its infrastructure and the role dispatch) with the role functions in `render/roles/<family>.ts` (the same seven families as Python's `render/roles/`), `render/style.ts` (modifiers → CSS), `render/charts.ts` (SVG charts), `render/chrome.ts` (device chrome), `render/index.ts` (figure assembly and the anchor prefix), with `icons.ts` reading the shared icon table and `asset-resolver.ts` resolving images against an asset base URL instead of embedding them (R-WEB-001.C7). Python's number formatting (`%.Nf`, `%g`, `round`, ties to even on the exact binary value) is reproduced in `pyformat.ts`, and the anchor prefix's SHA-1 in `sha1.ts`, synchronously and without Node's `crypto` (K1).
 
```
