The web counterpart of the example site's Reference section (R-PACK-012). Element samples come from the same generator, so both show the same thing.

The page is `typescript/pages/packs.html` with `packs.js` and `packs.css` beside it, a plain module script
over `dist/mockitdown.js` — no framework. The side panel is built from `shared/reference/index.json`
and shows each pack's name from its reference file; the main area shows the pack's facts (id,
version, import modules, default device and chrome, group), its own elements, then the core
vocabulary, each as a card with the element's sample and, when the pack has variants for it, the
variants sample. The design patterns follow (sign-in form, list and detail, settings, dashboard with
charts, data table with toolbar and filters, wizard): ordinary mockitdown sources without an
`import`, rendered with `pack="<id>"`, so a phone pack shows them on a phone and a desktop pack in its
window or browser chrome.

Mockups are created as their cards approach the viewport (an `IntersectionObserver`), which keeps a
pack of 250 elements quick to open; `window.packGallery.renderAll()` renders everything for tests.
The appearance choice applies to every mockup and is remembered in `localStorage`.

Open it with `cd typescript && npm run serve`, then `http://127.0.0.1:8173/pages/packs.html`.

**Natural size and per-platform examples (SRC-9).** Cards scroll sideways rather than squeeze their mockups (SRC-9#scroll); multi-platform packs add example applications per platform; the browser tests check geometry, not only the absence of diagnostics.
