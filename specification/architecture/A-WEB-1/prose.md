The port of the Python core (ADR-18): lexer, parser, evaluator, renderer, style builder, charts, icons, assets and diagnostics.

`stylesheet` takes the pack ids and `{minify}` as the Python `stylesheet(packs, minify=)` does; appearance is chosen per frame by the CSS, not by the stylesheet. `loadAssets` is how the shared assets reach the core as data (K1): `mockitdown/node` and the custom elements call it once.

The renderer is ported module for module: `render/html.ts` (the `Renderer`, its infrastructure and the role dispatch) with the role functions in `render/roles/<family>.ts` (the same seven families as Python's `render/roles/`), `render/style.ts` (modifiers → CSS), `render/charts.ts` (SVG charts), `render/chrome.ts` (device chrome), `render/index.ts` (figure assembly and the anchor prefix), with `icons.ts` reading the shared icon table and `asset-resolver.ts` resolving images against an asset base URL instead of embedding them (R-WEB-001.C7). Python's number formatting (`%.Nf`, `%g`, `round`, ties to even on the exact binary value) is reproduced in `pyformat.ts`, and the anchor prefix's SHA-1 in `sha1.ts`, synchronously and without Node's `crypto` (K1).

The editing core keeps the same constraint (K1): it works on source text and returns text edits.
