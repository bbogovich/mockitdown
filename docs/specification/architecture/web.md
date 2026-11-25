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

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `render(source, options)`, `check(source, options)`, `evaluate(source, options)`, `stylesheet(packIds, {minify})`, `loadAssets(assets)`, `registerPack(json, css)`, `registerComponents(name, source)` and the pack registry (`typescript/src/core/`) |
| U1 | uses A-REPO-1 — the packs, icons, vocabulary and page stylesheet, copied into the package at build |
| K1 | The TypeScript core MUST NOT access the DOM, the network or the file system; assets reach it as data. |

---

#### A-WEB-2 — Mockup element

The DOM side of the renderer: reads the script child and attributes, loads packs, renders and reports diagnostics.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: the custom element `mockitdown-mockup` (`typescript/src/elements/mockup.ts`) and the package entry `dist/mockitdown.js`, which defines it |
| U1 | uses A-WEB-1 — render the code and build the stylesheet |
| K1 | The mockup element MUST render into its own shadow root so page styles and pack styles do not leak into each other. |

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
