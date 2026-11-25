The DOM side of the renderer: reads the script child and attributes, loads packs, renders and reports diagnostics.

The asset loader is the browser counterpart of `mockitdown/node`'s `loadSharedAssets`: the core reads
nothing itself (A-WEB-1.K1), so whoever hosts it fetches `dist/shared/` once. The elements call it
before their first render; a page using the core API directly calls it itself
(`typescript/pages/core.html`). It resolves to the manifest.
