---
id: R-WEB-004
title: Pack gallery test page
status: active
version: 0.8.0
rev: 3
page: WEB.2
slot: reqs
order: 2
hash: a23dbc0ef5c5
source: [SRC-8, SRC-9, SRC-10]
realizes: [F-18]
requires: [R-WEB-002, R-WEB-003, R-REPO-003]
refs: [R-DEV-008, R-PACK-012]
---

C1: The pack gallery page `pages/packs.html` MUST have a master-detail layout: a side panel listing every shipped, non-hidden pack grouped and ordered as the example site's Reference menu (R-PACK-012.C5), and a main area showing the selected pack.
C2: Selecting a pack MUST show, for each element the pack offers (its own first, then the inherited core vocabulary), a `mockitdown-mockup` of the element's sample with the element's name, role, positional arguments, defaults, variants and `doc` line, from `shared/reference/<pack>.json`.
C3: Below the elements the main area MUST show the design patterns of `shared/patterns/` rendered in the selected pack: at least sign-in form, list and detail, settings, dashboard with charts, data table with toolbar and filters, and wizard or multi-step form.
C4: Each design pattern MUST be written in the core vocabulary and render in every shipped pack without an error diagnostic.
C5: The selected pack MUST be reflected in the URL fragment (`#pack=<id>`) so a pack can be linked and reloaded.
C6: The page MUST offer light and dark appearance and a filter on element name.
C7: The side panel MUST collapse into a menu on windows narrower than 720 CSS pixels.
C8: `shared/patterns/index.json` MUST list the design patterns in display order as `{"patterns": [{"id", "title", "file"}, …]}`, each `file` a `.mockitdown` source in `shared/patterns/` that imports no module, so that the gallery chooses the pack.
C9: The gallery MUST render each element sample with `device="fit"`, and each design pattern with the selected pack's default device and chrome.
C10: The gallery SHOULD create a card's `mockitdown-mockup` only when the card comes near the viewport.
C11: The gallery MUST expose `window.packGallery` with `state` (`ready` once the side panel and the first pack are shown), `select(id)` and `renderAll()`, which creates every mockup of the selected pack, waits for each one's `rendered`, and resolves with the pack, its element names, its pattern ids, the number of mockups, those without rendered content and the error diagnostics.
C12: An unknown or missing `#pack=` fragment MUST select the first pack of the side panel.
C13: Each element card MUST show its sample and its variants sample at their natural `fit` size (R-DEV-008.C1); a mockup wider than its card MUST scroll horizontally within the card rather than be squeezed or scaled.
C14: An entry of `shared/patterns/index.json` MAY carry `packs` (pack ids; the pattern is shown only for those packs and MAY import their module), `device`, `chrome`, `menubar` and `app`; for `swiftui` the gallery MUST show at least an iPhone app (TabView with a NavigationStack list and detail), an iPad app (three-column NavigationSplitView) and a Mac app (NavigationSplitView with toolbar, `.commands` and `menubar` naming an open menu).
C15: The browser tests MUST fail, for any pack, when two captioned variant cells of an element card intersect, when a `fit` frame is narrower than its content's scroll width, or when a presentation surface of an element sample is smaller than 200 × 80 points (a toast: than its text).
C16: The main area MUST show the selected pack's facts above two tabs, Elements and Examples, with exactly one tab's content shown; Elements (the element cards and the name filter) MUST be the default.
C17: The selected tab MUST be reflected in the fragment as `#pack=<id>&tab=elements|examples`, kept when another pack is selected, and restored on reload; an unknown tab MUST select Elements.
C18: `window.packGallery` MUST also offer `tab(name)`, which selects a tab and resolves when its content is shown; `renderAll()` MUST render both tabs' mockups.
C19: `shared/patterns/` MUST hold, in addition to the six patterns of C3, at least these complex layouts in the core vocabulary: a three-pane mail client (folder sidebar, message list, reading pane), an admin console (sidebar navigation, header with search and avatar, KPI cards, chart and table), a kanban board (columns of cards), a chat application (conversation list, message thread with bubbles, composer), a product page (gallery, details, options, purchase panel, reviews) and a calendar or scheduler (week grid with events and a side panel).
C20: The Examples tab MUST list the examples in the order of `shared/patterns/index.json`, with an in-tab index linking to each example.
V1: The browser tests select every pack and fail on any error diagnostic, any mockup without rendered content, or any pattern missing.
