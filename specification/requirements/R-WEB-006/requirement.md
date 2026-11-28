---
id: R-WEB-006
title: Gallery home page
status: active
version: 0.12.12
rev: 1
page: WEB.2
slot: reqs
order: 4
source: [SRC-18]
realizes: [F-18]
requires: [R-WEB-004, R-PACK-010]
hash: 339dd1ed8976
refs: [R-WEB-004, R-WEB-007]
---

C1: `typescript/pages/index.html` (with its script `index.js` and stylesheet `index.css` beside it) MUST be the gallery home page; the published `/gallery/index.html` redirects to it (R-WEB-004.C29), and the development server serves it at `/pages/index.html`.
C2: The home page MUST say what the gallery is for: reviewing every shipped pack's elements and design examples as the web components render them, and serving as the end-to-end test page of the TypeScript variant.
C3: The home page MUST say that every mockup in the gallery is rendered in the browser by the TypeScript renderer through the `mockitdown-mockup` web component, and that Markdown sites use the Python package (`pip install mockitdown`) instead.
C4: The home page MUST give a short note on using the TypeScript library in a project: installing it from the archive attached to a GitHub release (R-WEB-007), loading the shared assets with `loadAssetsFromUrl`, and a `<mockitdown-mockup pack="…">` element holding a `<script type="text/mockitdown">` child, shown as a code block of at most fifteen lines.
C5: The home page MUST link to the project's GitHub releases page, `https://github.com/bbogovich/mockitdown/releases`, and to the TypeScript package's README on GitHub.
C6: The home page MUST link prominently to the pack gallery (`packs.html`), and to the documentation site (`../../definition/`) and the example site (`../../demos/`).
C7: Below the other sections, the home page MUST have an easter-egg section with one link per pack listed under `hidden` in `shared/reference/index.json`, read at load time, each to `packs.html#pack=<id>` and labelled with the pack's name from its reference file, so that a new hidden pack is linked without editing the page.
C8: The home page MUST follow the light or dark appearance chosen in the pack gallery (the same `localStorage` key) and, without a choice, the system's; it MUST use no framework and no script or stylesheet from outside `/gallery/` (R-WEB-004.C30).
C9: When `shared/reference/index.json` cannot be loaded, the home page MUST still show its text and the gallery link, and show in place of the easter-egg links a sentence saying they could not be loaded.
V1: The browser test opens the home page and fails when a required section or link is missing, or when an easter-egg link does not open its pack in the gallery.
