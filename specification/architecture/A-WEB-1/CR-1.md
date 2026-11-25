---
id: A-WEB-1.CR-1
target: A-WEB-1
kind: correction
version: 0.6.3
date: 2026-11-25
issue: 3
summary: "as built (#3): stylesheet(packIds, {minify}) as in Python; evaluate and loadAssets provided"
from: a29befb1b185
to: b7b87dca1506
---

## Clauses

@ P1 edit
~ provides: `render(source, options)`, `check(source, options)`, {+`evaluate(source, options)`, +}`stylesheet(packIds, [-appearance)`,-]{+{minify})`, `loadAssets(assets)`,+} `registerPack(json, css)`, `registerComponents(name, source)` and the pack registry (`typescript/src/core/`)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,3 @@
 The port of the Python core (ADR-18): lexer, parser, evaluator, renderer, style builder, charts, icons, assets and diagnostics.
+
+`stylesheet` takes the pack ids and `{minify}` as the Python `stylesheet(packs, minify=)` does; appearance is chosen per frame by the CSS, not by the stylesheet. `loadAssets` is how the shared assets reach the core as data (K1): `mockitdown/node` and the custom elements call it once.
```
