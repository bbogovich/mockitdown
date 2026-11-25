---
id: R-WEB-004.CR-1
target: R-WEB-004
kind: revision
version: 0.6.7
date: 2026-11-25
issue: 7
summary: "as built (#7): C8 shared/patterns/index.json and import-free pattern sources; C9 samples with device fit, patterns with the pack's device and chrome; C10 lazy mockups; C11 window.packGallery state/select/renderAll; C12 unknown or missing fragment selects the first pack; TCs name gallery.spec.mjs and the Python pattern test; reviewed against R-WEB-002, R-WEB-003@0.6.5, R-REPO-003@0.6.1"
from: 452b1d92ba9e
to: dc46923cf79e
---

## Clauses

@ C8 insert after C7
+ `shared/patterns/index.json` MUST list the design patterns in display order as `{"patterns": [{"id", "title", "file"}, …]}`, each `file` a `.mockitdown` source in `shared/patterns/` that imports no module, so that the gallery chooses the pack.
@ C9 insert after C8
+ The gallery MUST render each element sample with `device="fit"`, and each design pattern with the selected pack's default device and chrome.
@ C10 insert after C9
+ The gallery SHOULD create a card's `mockitdown-mockup` only when the card comes near the viewport.
@ C11 insert after C10
+ The gallery MUST expose `window.packGallery` with `state` (`ready` once the side panel and the first pack are shown), `select(id)` and `renderAll()`, which creates every mockup of the selected pack, waits for each one's `rendered`, and resolves with the pack, its element names, its pattern ids, the number of mockups, those without rendered content and the error diagnostics.
@ C12 insert after C11
+ An unknown or missing `#pack=` fragment MUST select the first pack of the side panel.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -6,2 +6,2 @@
 
-Automated by `typescript/tests/browser/gallery.spec.ts`: for every pack, select it, wait for all mockups' `rendered`, and fail on any error diagnostic or empty shadow root.
+Automated by `typescript/tests/browser/gallery.spec.mjs`: for every pack, select it, render and wait for all mockups (`window.packGallery.renderAll()`), and fail on any error diagnostic, any empty shadow root or zero-sized visible mockup, any element of `shared/reference/<pack>.json` or pattern of `shared/patterns/index.json` missing.
--- a/TC-2.md
+++ b/TC-2.md
@@ -6,2 +6,2 @@
 
-Automated by `typescript/tests/unit/patterns.test.ts`: `check` each pattern under each shipped pack has no error.
+Automated by `typescript/tests/unit/patterns.test.ts`: `render` each pattern under each shipped pack (listed or hidden), light and dark, has no error and a figure; `python/tests/test_patterns.py` checks the same in the Python variant.
--- a/TC-3.md
+++ b/TC-3.md
@@ -6,2 +6,2 @@
 
-Automated by `typescript/tests/browser/gallery.spec.ts`: opening `packs.html#pack=carbon` shows Carbon selected.
+Automated by `typescript/tests/browser/gallery.spec.mjs`: opening `packs.html#pack=carbon` shows Carbon selected; selecting MUI from the side panel sets `#pack=mui`, survives a reload, and Back returns to Carbon.
--- a/prose.md
+++ b/prose.md
@@ -1 +1,18 @@
 The web counterpart of the example site's Reference section (R-PACK-012). Element samples come from the same generator, so both show the same thing.
+
+The page is `typescript/pages/packs.html` with `packs.js` and `packs.css` beside it, a plain module script
+over `dist/mockitdown.js` — no framework. The side panel is built from `shared/reference/index.json`
+and shows each pack's name from its reference file; the main area shows the pack's facts (id,
+version, import modules, default device and chrome, group), its own elements, then the core
+vocabulary, each as a card with the element's sample and, when the pack has variants for it, the
+variants sample. The design patterns follow (sign-in form, list and detail, settings, dashboard with
+charts, data table with toolbar and filters, wizard): ordinary mockitdown sources without an
+`import`, rendered with `pack="<id>"`, so a phone pack shows them on a phone and a desktop pack in its
+window or browser chrome.
+
+Mockups are created as their cards approach the viewport (an `IntersectionObserver`), which keeps a
+pack of 250 elements quick to open; `window.packGallery.renderAll()` renders everything for tests.
+The appearance choice applies to every mockup and is remembered in `localStorage`.
+
+Open it with `cd typescript && npm run serve`, then `http://127.0.0.1:8173/pages/packs.html`.
+
```
