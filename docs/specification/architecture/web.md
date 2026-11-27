---
title: "Architecture: web variant modules"
spec_version: 0.6.0
status: draft
updated: 2026-11-25
page_id: ARCH.3
---

# Architecture: web variant modules

The TypeScript variant mirrors the Python core module for module (ARCH.1) and adds the custom
elements, the development server and the test pages. Both read the shared asset tree.

#### A-REPO-1 — Shared asset tree

The single source of everything both variants publish (ADR-17).

**Level.** module

| | Statement |
|---|---|
| P1 | provides: the shared asset tree `shared/` — `packs/<id>/pack.json` and `pack.css`, `css/page.css`, `icons/icons.json`, `language/vocabulary.json`, `images/`, `patterns/*.mockitdown`, `reference/<pack>.json` and `reference/index.json`, `conformance/` |
| K1 | The shared asset tree MUST hold data and stylesheets only; it MUST NOT hold code of either variant. |

---

#### A-WEB-1 — TypeScript core

The port of the Python core (ADR-18): lexer, parser, evaluator, renderer, style builder, charts, icons, assets and diagnostics.

`stylesheet` takes the pack ids and `{minify}` as the Python `stylesheet(packs, minify=)` does; appearance is chosen per frame by the CSS, not by the stylesheet. `loadAssets` is how the shared assets reach the core as data (K1): `mockitdown/node` and the custom elements call it once.

The renderer is ported module for module: `render/html.ts` (roles), `render/style.ts` (modifiers → CSS), `render/charts.ts` (SVG charts), `render/chrome.ts` (device chrome), `render/index.ts` (figure assembly and the anchor prefix), with `icons.ts` reading the shared icon table and `asset-resolver.ts` resolving images against an asset base URL instead of embedding them (R-WEB-001.C7). Python's number formatting (`%.Nf`, `%g`, `round`, ties to even on the exact binary value) is reproduced in `pyformat.ts`, and the anchor prefix's SHA-1 in `sha1.ts`, synchronously and without Node's `crypto` (K1).

The editing core keeps the same constraint (K1): it works on source text and returns text edits.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `render(source, options)`, `check(source, options)`, `evaluate(source, options)`, `stylesheet(packIds, {minify})`, `loadAssets(assets)`, `registerPack(json, css)`, `registerComponents(name, source)` and the pack registry (`typescript/src/core/`) |
| P2 | provides: the editing core — `parseTree`, `reparse` and `edit` (R-EDIT-001 to R-EDIT-003), the `edit` render option (R-EDIT-004), `canContain` and `allowedChildren` (R-PACK-016) and `parameterTypes` and `modifierTypes` (R-PACK-017) |
| U1 | uses A-REPO-1 — the packs, icons, vocabulary and page stylesheet, copied into the package at build |
| K1 | The TypeScript core MUST NOT access the DOM, the network or the file system; assets reach it as data. |

---

#### A-WEB-2 — Mockup element

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

**Level.** module

| | Statement |
|---|---|
| P1 | provides: the custom element `mockitdown-mockup` (`MockupElement`, `typescript/src/elements/mockup.ts`) and the package entry `dist/mockitdown.js`, which defines it with `defineElements()` where the host has `customElements` and exports `MockupElement`, `ELEMENT_TAGS`, `scriptCode` and `shadowCss` |
| P2 | provides: `loadAssetsFromUrl(base, {fetch})` (`typescript/src/elements/assets.ts`, exported by the package entry), which fetches `manifest.json` and the files it lists from `base` (default: the package's `dist/shared/`) and loads them into the core with `loadAssets` |
| U1 | uses A-WEB-1 — render the code and build the stylesheet |
| K1 | The mockup element MUST render into its own shadow root so page styles and pack styles do not leak into each other. |
| K2 | `loadAssetsFromUrl` MUST share one load among calls with the same base, MUST forget a failed load so it can be retried, and MUST reject naming the URL and HTTP status of a file it cannot fetch. |
| K3 | The mockup element MUST resolve `import "path"` by rendering, fetching every candidate path the core asked for and did not have from the import base URL, and rendering again until the core asks for nothing new; fetched files MUST be cached by URL for the page, and a failed fetch MUST count as not found. |
| K4 | The mockup elements MUST share one constructed `CSSStyleSheet` per pack set through `adoptedStyleSheets`, and MUST fall back to a `<style>` element in the shadow root where constructed sheets are missing. |
| K5 | The mockup element MUST rewrite the stylesheet's page-scoped appearance selectors (`body:not([data-md-color-scheme])` to `:host`, `[data-md-color-scheme="slate"]` to `:host-context(…)`) so that appearance `auto` follows the page from inside a shadow root. |
| K6 | The mockup element MUST coalesce the changes made in one task into one render and MUST discard a render that a newer change overtook while it awaited assets or imports. |

---

#### A-WEB-3 — Development server and test pages

Development and test only; none of it is part of the published package.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: the development server `typescript/scripts/serve.mjs`, the test pages under `typescript/pages/` and the browser tests under `typescript/tests/browser/` |
| U1 | uses A-WEB-2 — every mockup on a test page |
| U2 | uses A-REPO-1 — reference samples and design patterns |
| K1 | The development server MUST serve files only from the package, its build output and `shared/`, and MUST bind to the loopback interface. |

---

#### A-WEB-4 — Design document and session module

The pure half of the design tools: the `.mkdesign` format and the session every component shares. It is
the part a host uses without a browser, for example to validate and save a document in an Electron main
process.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: the module `dist/design.js` (subpath `mockitdown/design`, `typescript/src/design/`): `readDesign`, `writeDesign`, `newDesign`, `mockupOptions` and `DesignSession` with its history and commands |
| U1 | uses A-WEB-1 — parse, re-parse, edit and render the mockups' code, and the role rules |
| K1 | The module MUST NOT access the DOM, the network or the file system, so that a desktop shell's main process can use it in Node. |
| K2 | The session MUST change a mockup's code only through edit operations, commands and code changes it records in its history. |

---

#### A-WEB-5 — Design-tool components

The DOM half of the design tools. Every element renders session state and forwards events, so the same
rules apply whichever components a host composes, and the browser tests drive the components through the
test pages.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: the custom elements `mockitdown-designer`, `mockitdown-canvas`, `mockitdown-editor`, `mockitdown-outline`, `mockitdown-gallery`, `mockitdown-inspector`, `mockitdown-code` and `mockitdown-diagnostics` (`typescript/src/elements/`), defined by the package entry, and the test pages `pages/editor.html` and `pages/designer.html` |
| U1 | uses A-WEB-4 — the session, the document, the history and the commands |
| U2 | uses A-WEB-2 — previews, Preview mode and inactive mockups through `mockitdown-mockup` |
| U3 | uses A-WEB-1 — edit-mode rendering, the lexer, role rules and parameter types |
| K1 | Each component MUST render into its own open shadow root, be styled through custom properties and `::part`, and use no UI framework. |
| K2 | The components MUST hold no editing rule of their own: they render the session's state and forward the user's actions to it. |
