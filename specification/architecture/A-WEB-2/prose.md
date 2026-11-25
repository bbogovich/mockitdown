The DOM side of the renderer: reads the script child and attributes, loads packs, renders and reports diagnostics.

The asset loader is the browser counterpart of `mockitdown/node`'s `loadSharedAssets`: the core reads
nothing itself (A-WEB-1.K1), so whoever hosts it fetches `dist/shared/` once. The elements call it
before their first render; a page using the core API directly calls it itself
(`typescript/pages/core.html`). It resolves to the manifest.

The element (`src/elements/mockup.ts`) keeps the core synchronous: it awaits the shared assets once
(`loadAssetsFromUrl()`, unless a page already loaded them), then renders. The core resolves
`import "path"` through a synchronous resolver, so the element answers from a per-page cache of
fetched files and records what the core asked for and did not find; it fetches those URLs (relative to
`import-base`) and renders again, until a render asks for nothing new — nested imports take one more
round per level. Every element shares one constructed stylesheet per pack set; the token rules that
look at the page's `body` are rewritten to `:host` so that `appearance="auto"` still follows the
browser's colour scheme inside the shadow root.
