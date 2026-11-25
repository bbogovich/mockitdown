---
id: A-WEB-2.CR-1
target: A-WEB-2
kind: revision
version: 0.6.5
date: 2026-11-25
issue: 5
summary: "as built (#5): loadAssetsFromUrl, the browser asset loader exported by the package entry"
from: 24fad257c608
to: b60b34a91794
---

## Clauses

@ P2 insert after P1
+ provides: `loadAssetsFromUrl(base, {fetch})` (`typescript/src/elements/assets.ts`, exported by the package entry), which fetches `manifest.json` and the files it lists from `base` (default: the package's `dist/shared/`) and loads them into the core with `loadAssets`
@ K2 insert after K1
+ `loadAssetsFromUrl` MUST share one load among calls with the same base, MUST forget a failed load so it can be retried, and MUST reject naming the URL and HTTP status of a file it cannot fetch.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,6 @@
 The DOM side of the renderer: reads the script child and attributes, loads packs, renders and reports diagnostics.
+
+The asset loader is the browser counterpart of `mockitdown/node`'s `loadSharedAssets`: the core reads
+nothing itself (A-WEB-1.K1), so whoever hosts it fetches `dist/shared/` once. The elements call it
+before their first render; a page using the core API directly calls it itself
+(`typescript/pages/core.html`). It resolves to the manifest.
```
