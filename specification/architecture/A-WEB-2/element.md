---
id: A-WEB-2
title: Mockup element
status: active
version: 0.6.5
rev: 1
page: ARCH.3
slot: elements
order: 3
hash: b60b34a91794
level: module
refs: [A-WEB-1]
---

P1: provides: the custom element `mockitdown-mockup` (`typescript/src/elements/mockup.ts`) and the package entry `dist/mockitdown.js`, which defines it
P2: provides: `loadAssetsFromUrl(base, {fetch})` (`typescript/src/elements/assets.ts`, exported by the package entry), which fetches `manifest.json` and the files it lists from `base` (default: the package's `dist/shared/`) and loads them into the core with `loadAssets`
U1: uses A-WEB-1 — render the code and build the stylesheet
K1: The mockup element MUST render into its own shadow root so page styles and pack styles do not leak into each other.
K2: `loadAssetsFromUrl` MUST share one load among calls with the same base, MUST forget a failed load so it can be retried, and MUST reject naming the URL and HTTP status of a file it cannot fetch.
