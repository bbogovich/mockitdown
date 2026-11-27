---
title: "Web test pages and tests"
spec_version: 0.6.0
status: draft
updated: 2026-11-25
page_id: WEB.2
---

# Web test pages and tests

The TypeScript project serves its test pages with a development server built on `node:http` and
tests them with Playwright (F-18, ADR-20). The first page is the pack gallery: packs on the left,
the selected pack's elements and design patterns on the right.

### R-WEB-003 — Development server

**Requires:** R-WEB-001

Development only; the package itself has no server part (F-17.C6).

The server is `typescript/scripts/serve.mjs`. Because it mirrors the folders' relative positions
(`/pages/` beside `/dist/` and `/shared/`), a test page imports the package as
`../dist/mockitdown.js` and loads the shared assets from `../dist/shared/` with `loadAssetsFromUrl`
(A-WEB-2), and the gallery reads `../shared/reference/<pack>.json` the same way. The index is
generated on each request, so a new page in `pages/` is linked without editing anything; it is not a
file in `pages/`. Responses carry `Cache-Control: no-store`, so a rebuild shows on reload.

**R-WEB-003.TC-1 — Static server**

Automated by `typescript/tests/unit/serve.test.ts`.

**Realizes.** F-18

| | Statement |
|---|---|
| C1 | `npm run serve` MUST build the package and start a static file server built on `node:http`, serving `pages/`, `dist/` and `shared/` on `http://127.0.0.1:8173/` (port overridable by `PORT`). |
| C2 | The server MUST serve correct content types for HTML, JavaScript modules, CSS, JSON, SVG, PNG and `.mockitdown` files. |
| C3 | The server MUST refuse any path that resolves outside the served folders with status 404. |
| C4 | The server's root MUST be an index page linking every test page. |
| C5 | The server MUST map the URL paths `/pages/`, `/dist/` and `/shared/` to `typescript/pages/`, `typescript/dist/` and the repository's `shared/`, so that a test page reaches the package and the shared files by the relative paths `../dist/` and `../shared/`. |
| C6 | The server MUST generate the index from the `.html` files in `pages/`, each linked with the text of its `<title>`. |
| C7 | The server MUST serve `.mockitdown` files as `text/plain; charset=utf-8`. |
| C8 | The server MUST answer a method other than `GET` and `HEAD` with status 405. |
| V1 | A unit test starts the server on a free port, fetches the index, a module and a pack stylesheet, and checks that `/../package.json` is refused. |

---

### R-WEB-004 — Pack gallery test page

**Requires:** R-WEB-002, R-WEB-003, R-REPO-003

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

**Published (SRC-17).** The Pages workflow builds the package and copies the test pages, the built
package and the shared `reference/` and `patterns/` folders under `/gallery/` in the same layout as
the development server, so `packs.js` reaches `../dist/` and `../shared/` unchanged. The workflow opens
the published copy in a browser before it deploys, so a gallery that would not load is never published.
Test pages added later (the designer test page) are published by the same copy.

**R-WEB-004.TC-1 — Every pack renders**

Automated by `typescript/tests/browser/gallery.spec.mjs`: for every pack, select it, render and wait for all mockups (`window.packGallery.renderAll()`), and fail on any error diagnostic, any empty shadow root or zero-sized visible mockup, any element of `shared/reference/<pack>.json` or pattern of `shared/patterns/index.json` missing.

**R-WEB-004.TC-2 — Patterns in every pack**

Automated by `typescript/tests/unit/patterns.test.ts`: `render` each pattern under each shipped pack (listed or hidden), light and dark, has no error and a figure; `python/tests/test_patterns.py` checks the same in the Python variant.

**R-WEB-004.TC-3 — Deep link**

Automated by `typescript/tests/browser/gallery.spec.mjs`: opening `packs.html#pack=carbon` shows Carbon selected; selecting MUI from the side panel sets `#pack=mui`, survives a reload, and Back returns to Carbon.

**R-WEB-004.TC-4 — Variants seen whole**

`gallery.spec.mjs`: for every pack, after `renderAll()`, no two variant cells intersect, every `fit` frame's width ≥ its scrollWidth, a card whose mockup is wider than the card scrolls (scrollWidth > clientWidth), presentation surfaces meet the minimum size.

**R-WEB-004.TC-5 — SwiftUI per-platform examples**

`gallery.spec.mjs`: at `#pack=swiftui` the examples include patterns with device phone, tablet and desktop, the desktop one showing a menu bar with an open menu; patterns with `packs` are not shown for other packs; `patterns.test.ts` and `test_patterns.py` render each pack-specific pattern in its packs without an error diagnostic.

**R-WEB-004.TC-6 — Elements and Examples tabs**

`gallery.spec.mjs`: default tab Elements; `#pack=carbon&tab=examples` opens Examples with the first example in the viewport and no element card visible; switching pack keeps the tab; the index links scroll to each example; `packGallery.tab()` resolves.

**R-WEB-004.TC-7 — Complex layout examples render everywhere**

`patterns.test.ts` and `test_patterns.py`: each of the twelve core patterns renders in every shipped pack without an error diagnostic; the gallery geometry checks (TC-4) apply to them at their device size.

**R-WEB-004.TC-8 — Show source on every example**

Browser test (Chromium, `gallery.spec.mjs`), for the `base` pack (core patterns) and for `swiftui`
(including the Mac example with `device`, `chrome`, `menubar` and `app`):

1. On the Examples tab every `.pattern` has one Show source button with `aria-expanded="false"`, and its
   source block is hidden.
2. Activating the button of each example sets `aria-expanded="true"`, the label to Hide source, and shows
   the block; the block's text equals `packGallery.source(id)`, which equals the expected snippet built
   from `shared/patterns/index.json` and the pattern file (C22 attribute order, file text unchanged, no
   `caption`, `label` or `appearance`).
3. The example's `mockitdown-mockup` is the same element before and after, its `rendered` event does not
   fire again and its bounding box is unchanged (C25).
4. The block's computed `white-space` keeps line breaks and its `overflow-x` scrolls; its colours differ
   between light and dark appearance (C23).
5. With a stubbed clipboard, Copy writes exactly the snippet and the live region reads Copied; with the
   clipboard removed, Copy selects the block's text (C24).
6. Activating the button again hides the block and restores `aria-expanded="false"`.
7. `packGallery.source(id)` resolves `null` for a swiftui-only example while `base` is selected (C26).

A unit test of the snippet builder (pure function, both a core and a pack-specific entry) runs under
`npm test` without a browser.

**R-WEB-004.TC-9 — Published gallery**

Run by the Pages workflow after the site is assembled (`typescript/tests/browser/published.spec.mjs`,
pointed at a static file server over the assembled `public/` folder through `GALLERY_URL`):

1. `/gallery/` redirects to `/gallery/pages/packs.html`, and `packGallery.state` becomes `ready`.
2. `renderAll()` for `base` and for `swiftui` (Elements and Examples) resolves with no error
   diagnostic and no mockup without rendered content.
3. No request fails, and every request URL starts with the server's `/gallery/`.
4. The assembled `public/gallery/` holds `pages/packs.html`, `dist/mockitdown.js`,
   `dist/shared/manifest.json`, `shared/reference/index.json` and `shared/patterns/index.json`.
5. The header tabs of `/` (documentation) and `/demos/` (example site) read Demo, Gallery,
   Definition, Specification, Implementation, Reference, and both Gallery tabs link to `/gallery/`
   (R-PACK-012.C6).

The workflow fails, and nothing is deployed, when the test fails.

**R-WEB-004.TC-M1 — Manual review**

TC-M: open `npm run serve` → Pack gallery, step through the groups, compare a few packs with the example site's Reference pages.

**Realizes.** F-18

| | Statement |
|---|---|
| C1 | The pack gallery page `pages/packs.html` MUST have a master-detail layout: a side panel listing every shipped, non-hidden pack grouped and ordered as the example site's Reference menu (R-PACK-012.C5), and a main area showing the selected pack. |
| C2 | Selecting a pack MUST show, for each element the pack offers (its own first, then the inherited core vocabulary), a `mockitdown-mockup` of the element's sample with the element's name, role, positional arguments, defaults, variants and `doc` line, from `shared/reference/<pack>.json`. |
| C3 | The Examples tab (C16) MUST show the design patterns of `shared/patterns/` rendered in the selected pack: at least sign-in form, list and detail, settings, dashboard with charts, data table with toolbar and filters, and wizard or multi-step form. |
| C4 | Each design pattern MUST be written in the core vocabulary and render in every shipped pack without an error diagnostic. |
| C5 | The selected pack MUST be reflected in the URL fragment (`#pack=<id>`) so a pack can be linked and reloaded. |
| C6 | The page MUST offer light and dark appearance and a filter on element name. |
| C7 | The side panel MUST collapse into a menu on windows narrower than 720 CSS pixels. |
| C8 | `shared/patterns/index.json` MUST list the design patterns in display order as `{"patterns": [{"id", "title", "file"}, …]}`, each `file` a `.mockitdown` source in `shared/patterns/` that imports no module, so that the gallery chooses the pack. |
| C9 | The gallery MUST render each element sample with `device="fit"`, and each design pattern with the device and chrome its index entry names (C14), else with the selected pack's default device and chrome. |
| C10 | The gallery SHOULD create a card's `mockitdown-mockup` only when the card comes near the viewport. |
| C11 | The gallery MUST expose `window.packGallery` with `state` (`ready` once the side panel and the first pack are shown), `select(id)` and `renderAll()`, which creates every mockup of the selected pack, waits for each one's `rendered`, and resolves with the pack, its element names, its pattern ids, the number of mockups, those without rendered content and the error diagnostics. |
| C12 | An unknown or missing `#pack=` fragment MUST select the first pack of the side panel. |
| C13 | Each element card MUST show its sample and its variants sample at their natural `fit` size (R-DEV-008.C1); a mockup wider than its card MUST scroll horizontally within the card rather than be squeezed or scaled. |
| C14 | An entry of `shared/patterns/index.json` MAY carry `packs` (pack ids; the pattern is shown only for those packs and MAY import their module), `device`, `chrome`, `menubar`, `app` and `windowed`, passed to the `mockitdown-mockup` as the attributes of the same name (R-WEB-002.C3); for `swiftui` the gallery MUST show at least an iPhone app (TabView with a NavigationStack list and detail), an iPad app (three-column NavigationSplitView) and a Mac app (NavigationSplitView with toolbar, `.commands` and `menubar` naming an open menu). |
| C15 | The browser tests MUST fail, for any pack, when two captioned variant cells of an element card intersect, when a `fit` frame is narrower than its content's scroll width, or when a presentation surface of an element sample is smaller than 200 × 80 points (a toast: than its text). |
| C16 | The main area MUST show the selected pack's facts above two tabs, Elements and Examples, with exactly one tab's content shown; Elements (the element cards and the name filter) MUST be the default. |
| C17 | The selected tab MUST be reflected in the fragment as `#pack=<id>&tab=elements&#124;examples`, kept when another pack is selected, and restored on reload; an unknown tab MUST select Elements. |
| C18 | `window.packGallery` MUST also offer `tab(name)`, which selects a tab and resolves when its content is shown; `renderAll()` MUST render both tabs' mockups. |
| C19 | `shared/patterns/` MUST hold, in addition to the six patterns of C3, at least these complex layouts in the core vocabulary: a three-pane mail client (folder sidebar, message list, reading pane), an admin console (sidebar navigation, header with search and avatar, KPI cards, chart and table), a kanban board (columns of cards), a chat application (conversation list, message thread with bubbles, composer), a product page (gallery, details, options, purchase panel, reviews) and a calendar or scheduler (week grid with events and a side panel). |
| C20 | The Examples tab MUST list the examples in the order of `shared/patterns/index.json`, with an in-tab index linking to each example. |
| C21 | Each example of the Examples tab MUST have a Show source toggle button, with `aria-expanded` and `aria-controls`, that shows or hides a source block below the example's mockup; the source block MUST be hidden by default and the button's label MUST read Hide source while it is shown. |
| C22 | The source block MUST show the snippet that reproduces the example in the selected pack: a `<mockitdown-mockup>` opening tag carrying `pack` and every attribute the gallery passes from the index entry (C14), in the order `pack`, `device`, `chrome`, `menubar`, `app`, `windowed`, then a `<script type="text/mockitdown">` child (R-WEB-002) holding the pattern file's text unchanged (its indentation and line breaks kept, without a trailing newline), then the closing tags; the gallery-only attributes `caption`, `label` and `appearance` MUST NOT appear. |
| C23 | The source block MUST be monospaced, keep its line breaks, scroll horizontally rather than wrap, and follow the page's light or dark appearance. |
| C24 | The source block MUST have a Copy button that writes the snippet to the clipboard and announces Copied through a polite live region; where the clipboard is unavailable it MUST select the snippet's text instead. |
| C25 | Showing or hiding an example's source MUST NOT re-create, re-render or resize that example's mockup. |
| C26 | `window.packGallery` MUST offer `source(patternId)`, which resolves with the snippet of C22 for that example in the selected pack, or `null` when the selected pack does not show that example. |
| V1 | The browser tests select every pack and fail on any error diagnostic, any mockup without rendered content, or any pattern missing. |
| C27 | The Pages workflow `.github/workflows/pages.yml`, on both branches, MUST install the TypeScript package's development dependencies with `npm ci`, build it with `npm run build` in `typescript/` of `main`, and publish the pack gallery at `/gallery/` of the site. |
| C28 | The published `/gallery/` MUST reproduce the development server's URL layout (R-WEB-003.C5): `gallery/pages/` holding the files of `typescript/pages/`, `gallery/dist/` the built package, and `gallery/shared/` the `reference/` and `patterns/` folders of `shared/`, so that every test page works unchanged as static files. |
| C29 | `/gallery/index.html` MUST redirect to `pages/packs.html` with a meta refresh and a link. |
| C30 | Every request a published test page makes MUST be for a file under `/gallery/`. |
| C31 | The Pages workflow MUST serve the assembled site with a static file server before uploading it, open `/gallery/` in Chromium, and fail when the gallery does not reach `packGallery.state` `ready`, when `renderAll()` for `base` or `swiftui` reports an error diagnostic or a mockup without rendered content, or when a request fails. |

---

### R-WEB-005 — Web test suites

**Requires:** R-WEB-003

One command for the web variant's tests, as the Python variant has `unittest discover`.

The browser tests live in `typescript/tests/browser/*.spec.mjs` and the configuration in
`typescript/playwright.config.mjs` (plain JavaScript, so neither needs type declarations). The CI
workflow is `.github/workflows/ci.yml`, with one job per variant; it publishes nothing, so it does not
overlap `pages.yml` and `release.yml`.

**R-WEB-005.TC-1 — Browser smoke test**

Automated by `typescript/tests/browser/core.spec.mjs` (Playwright, started by `npm test`): the index
links `pages/core.html`; the page loads `dist/shared/` with `loadAssetsFromUrl`, renders a SwiftUI
mockup styled by its pack stylesheet with no failed request, page error or diagnostic; an edited
source with a syntax error reports it, and a corrected one renders in the MUI pack.

**R-WEB-005.TC-M1 — CI runs both suites**

Manual: a push shows the Python and the TypeScript jobs in the CI workflow run.

**Realizes.** F-18

| | Statement |
|---|---|
| C1 | `npm test` MUST build the package, run the unit tests with `node --test` and the browser tests with Playwright. |
| C2 | The Playwright configuration MUST start the development server itself and run the browser tests in Chromium; Firefox and WebKit MUST be selectable by project name. |
| C3 | The repository's CI workflow MUST run the Python and the TypeScript test suites on every push and pull request. |
| C4 | `npm test` MUST run the browser tests in the `chromium` project only, so that it needs no other browser installed. |
| C5 | The CI workflow MUST run the TypeScript suite on Node 22 with the Chromium of Playwright, and the Python suite with Zensical installed so that the example site's real build runs. |
| C6 | The browser tests MUST include a smoke test that loads a test page, loads the shared assets as a browser host does, renders a mockup through the core and fails on any failed request, page error or error diagnostic. |
| V1 | `npm test` from a clean checkout after `npm ci` and `npx playwright install chromium` passes. |
