The port of the Python core (ADR-18): lexer, parser, evaluator, renderer, style builder, charts, icons, assets and diagnostics.

`stylesheet` takes the pack ids and `{minify}` as the Python `stylesheet(packs, minify=)` does; appearance is chosen per frame by the CSS, not by the stylesheet. `loadAssets` is how the shared assets reach the core as data (K1): `mockitdown/node` and the custom elements call it once.
