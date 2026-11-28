---
id: R-WEB-006
title: Gallery home page
status: active
version: 0.11.0
rev: 0
page: WEB.2
slot: reqs
order: 4
source: [SRC-18]
realizes: [F-18]
requires: [R-WEB-004, R-PACK-010]
hash: 82e2af337638
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
<!-- file: TC-1.md -->
---
id: TC-1
title: Home page content, links and easter eggs
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9]
---

New browser test `typescript/tests/browser/gallery-home.spec.mjs` against the development server, and
step 1 of R-WEB-004.TC-9 against the published copy:

1. `/pages/index.html` loads with no failed request and no console error; the assembled gallery holds
   `pages/index.html`, `pages/index.js` and `pages/index.css` (C1).
2. The page text contains the phrases "pack gallery", "TypeScript renderer", `mockitdown-mockup` and
   `pip install mockitdown` (C2, C3).
3. A code block contains `loadAssetsFromUrl`, `<mockitdown-mockup pack=` and
   `<script type="text/mockitdown">`, and has at most fifteen lines; a link's `href` is
   `https://github.com/bbogovich/mockitdown/releases` and another's ends with `typescript/README.md`
   (C4, C5).
4. Links to `packs.html`, `../../definition/` and `../../demos/` exist; following `packs.html` reaches
   `packGallery.state` `ready` (C6).
5. The easter-egg section is the last section and holds exactly one link per id of `hidden` in
   `shared/reference/index.json`, labelled with the pack's name; following each opens the gallery with
   that pack selected and its elements shown (C7).
6. With the gallery's appearance set to dark, the home page's `color-scheme` is dark; with no choice
   and an emulated dark system scheme it is dark too; every request URL stays under the served root
   (C8).
7. With `shared/reference/index.json` answered by HTTP 404 (`page.route`), the page still shows its text
   and gallery link and the sentence that the easter eggs could not be loaded (C9).
<!-- file: prose.md -->
**Requirement.** The gallery's address opens a short home page rather than the pack gallery itself. It
explains the gallery, names the renderer, shows how to use the library in a project, links to the
releases, and ends with links to the science-fiction easter eggs.

**Rationale.** SRC-18#gallery: a reader arriving from the documentation's Gallery tab needs to know what
they are looking at and how to use what they see; the easter eggs are rewards for readers who read to
the end, so their links sit at the end of the page, generated from the index so the page never falls
behind the packs.

**Verification.** TC-1.
