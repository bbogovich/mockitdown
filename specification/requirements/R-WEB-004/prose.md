The web counterpart of the example site's Reference section (R-PACK-012). Element samples come from the same generator, so both show the same thing.

The page is `typescript/pages/packs.html` with `packs.js` and `packs.css` beside it, a plain module script
over `dist/mockitdown.js` — no framework. The side panel is built from `shared/reference/index.json`
and shows each pack's name from its reference file; the main area shows the pack's facts (id,
version, import modules, default device and chrome, group), its own elements, then the core
vocabulary, each as a card with the element's sample and, when the pack has variants for it, the
variants sample. The Examples tab shows the design patterns (sign-in form, list and detail, settings, dashboard with
charts, data table with toolbar and filters, wizard): ordinary mockitdown sources without an
`import`, rendered with `pack="<id>"`, so a phone pack shows them on a phone and a desktop pack in its
window or browser chrome.

Mockups are created as their cards approach the viewport (an `IntersectionObserver`), which keeps a
pack of 250 elements quick to open; `window.packGallery.renderAll()` renders everything for tests.
The appearance choice applies to every mockup and is remembered in `localStorage`.

Open it with `cd typescript && npm run serve`, then `http://127.0.0.1:8173/pages/packs.html`.

**Natural size and per-platform examples (SRC-9).** Cards scroll sideways rather than squeeze their mockups (SRC-9#scroll); multi-platform packs add example applications per platform; the browser tests check geometry, not only the absence of diagnostics.

**Tabs (SRC-10).** Elements and examples are separate tabs so the examples are one click away; six complex layouts join the six simple patterns.
The tab list stays under the top bar while a tab scrolls, and the name filter belongs to the Elements tab. A pack change is a
history entry (Back returns to the previous pack); a tab change replaces the current entry. The complex layouts (mail
client, admin console, kanban board, chat, product page, calendar) are desktop layouts: their index entries name
`device: "desktop"`, so the phone-first packs (`swiftui`, `android`) show them in their desktop form rather than squeezed
onto a phone.

**Show source (SRC-11).** Every example has a Show source button. The block it opens is the snippet a
reader would paste into a page to get the same example in the same pack: the `mockitdown-mockup` tag
with `pack` (and, for the platform examples, `device`, `chrome`, `menubar`, `app`, `windowed`) around a
`<script type="text/mockitdown">` child holding the pattern file verbatim. Attributes that only serve the
gallery (`caption`, `label`, `appearance`) are left out. The block has a Copy button and scrolls sideways
for long lines; opening it never re-renders the example. A Copy the browser refuses (no permission,
an insecure page) falls back to selecting the text, as a missing clipboard does.

**Published (SRC-17).** The Pages workflow builds the package and copies the test pages, the built
package and the shared `reference/` and `patterns/` folders under `/gallery/` in the same layout as
the development server, so `packs.js` reaches `../dist/` and `../shared/` unchanged. The workflow opens
the published copy in a browser before it deploys, so a gallery that would not load is never published.
Test pages added later (the designer test page) are published by the same copy.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Home page and easter eggs (SRC-18#gallery).** `/gallery/` now opens the gallery home page
(R-WEB-006) rather than the pack gallery itself. The science-fiction packs are reachable by address —
the home page links to each — but stay out of the side panel. The device and chrome rules of C9 and the
720 px boundary of C7 gain automated tests (TC-11, audit question 6).


**Re-checked at specification 0.12.10.** Re-read against R-REPO-003, R-WEB-002 (changed at 0.12.0, 0.12.4: SRC-19 import map (0.12.0), which changes how imports are found and nothing this item obliges; test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
