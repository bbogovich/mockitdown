---
id: A-WEB-1.CR-2
target: A-WEB-1
kind: clarification
version: 0.6.4
date: 2026-11-25
issue: 4
summary: "as built (#4): the renderer modules (render/html, style, charts, chrome, index), icons, asset resolver by base URL, Python number formatting and a synchronous SHA-1"
from: b7b87dca1506
to: 0c408e3392df
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -3 +3,3 @@
 `stylesheet` takes the pack ids and `{minify}` as the Python `stylesheet(packs, minify=)` does; appearance is chosen per frame by the CSS, not by the stylesheet. `loadAssets` is how the shared assets reach the core as data (K1): `mockitdown/node` and the custom elements call it once.
+
+The renderer is ported module for module: `render/html.ts` (roles), `render/style.ts` (modifiers → CSS), `render/charts.ts` (SVG charts), `render/chrome.ts` (device chrome), `render/index.ts` (figure assembly and the anchor prefix), with `icons.ts` reading the shared icon table and `asset-resolver.ts` resolving images against an asset base URL instead of embedding them (R-WEB-001.C7). Python's number formatting (`%.Nf`, `%g`, `round`, ties to even on the exact binary value) is reproduced in `pyformat.ts`, and the anchor prefix's SHA-1 in `sha1.ts`, synchronously and without Node's `crypto` (K1).
```
