---
id: A-WEB-2
title: Mockup element
status: active
version: 0.6.6
rev: 2
page: ARCH.3
slot: elements
order: 3
hash: ce2de008569c
level: module
refs: [A-WEB-1]
---

P1: provides: the custom element `mockitdown-mockup` (`MockupElement`, `typescript/src/elements/mockup.ts`) and the package entry `dist/mockitdown.js`, which defines it with `defineElements()` where the host has `customElements` and exports `MockupElement`, `ELEMENT_TAGS`, `scriptCode` and `shadowCss`
P2: provides: `loadAssetsFromUrl(base, {fetch})` (`typescript/src/elements/assets.ts`, exported by the package entry), which fetches `manifest.json` and the files it lists from `base` (default: the package's `dist/shared/`) and loads them into the core with `loadAssets`
U1: uses A-WEB-1 — render the code and build the stylesheet
K1: The mockup element MUST render into its own shadow root so page styles and pack styles do not leak into each other.
K2: `loadAssetsFromUrl` MUST share one load among calls with the same base, MUST forget a failed load so it can be retried, and MUST reject naming the URL and HTTP status of a file it cannot fetch.
K3: The mockup element MUST resolve `import "path"` by rendering, fetching every candidate path the core asked for and did not have from the import base URL, and rendering again until the core asks for nothing new; fetched files MUST be cached by URL for the page, and a failed fetch MUST count as not found.
K4: The mockup elements MUST share one constructed `CSSStyleSheet` per pack set through `adoptedStyleSheets`, and MUST fall back to a `<style>` element in the shadow root where constructed sheets are missing.
K5: The mockup element MUST rewrite the stylesheet's page-scoped appearance selectors (`body:not([data-md-color-scheme])` to `:host`, `[data-md-color-scheme="slate"]` to `:host-context(…)`) so that appearance `auto` follows the page from inside a shadow root.
K6: The mockup element MUST coalesce the changes made in one task into one render and MUST discard a render that a newer change overtook while it awaited assets or imports.
