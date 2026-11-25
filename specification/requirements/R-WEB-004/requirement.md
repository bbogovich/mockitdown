---
id: R-WEB-004
title: Pack gallery test page
status: active
version: 0.6.0
rev: 0
page: WEB.2
slot: reqs
order: 2
hash: 452b1d92ba9e
source: [SRC-8]
realizes: [F-18]
requires: [R-WEB-002, R-WEB-003, R-REPO-003]
---

C1: The pack gallery page `pages/packs.html` MUST have a master-detail layout: a side panel listing every shipped, non-hidden pack grouped and ordered as the example site's Reference menu (R-PACK-012.C5), and a main area showing the selected pack.
C2: Selecting a pack MUST show, for each element the pack offers (its own first, then the inherited core vocabulary), a `mockitdown-mockup` of the element's sample with the element's name, role, positional arguments, defaults, variants and `doc` line, from `shared/reference/<pack>.json`.
C3: Below the elements the main area MUST show the design patterns of `shared/patterns/` rendered in the selected pack: at least sign-in form, list and detail, settings, dashboard with charts, data table with toolbar and filters, and wizard or multi-step form.
C4: Each design pattern MUST be written in the core vocabulary and render in every shipped pack without an error diagnostic.
C5: The selected pack MUST be reflected in the URL fragment (`#pack=<id>`) so a pack can be linked and reloaded.
C6: The page MUST offer light and dark appearance and a filter on element name.
C7: The side panel MUST collapse into a menu on windows narrower than 720 CSS pixels.
V1: The browser tests select every pack and fail on any error diagnostic, any mockup without rendered content, or any pattern missing.
