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
