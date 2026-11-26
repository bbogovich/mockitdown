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
for long lines; opening it never re-renders the example.
