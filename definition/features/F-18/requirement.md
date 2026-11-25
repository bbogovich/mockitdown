---
id: F-18
title: Web pack gallery test page
status: active
version: 0.7.0
rev: 2
page: FEAT.3
slot: features
order: 3
hash: c0294cd2fcfc
family: web
source: [SRC-8, SRC-9, SRC-10]
requires: [F-17]
---

G1: Developers and reviewers need to see every pack and every element rendered by the web components, both by eye and in automated tests.
C1: The TypeScript project includes a pack gallery test page in a master-detail layout: a side panel lists the packs, grouped as on the example site, and the main area shows the selected pack.
C2: For the selected pack the main area shows every element the pack offers, each rendered by a `mockitdown-mockup`, with its role, arguments and variants.
C3: The main area also shows complete examples of common application design patterns in the pack's style (for example sign-in, list and detail, settings, dashboard, data table with filters).
C4: The page is served for manual review by a development server built on Node's own HTTP module.
C5: Automated browser tests open the page, select each pack and fail on any diagnostic or missing render.
C9: The selected pack's content is split into tabs — its elements and its design examples — so that the examples are reached in one step, without scrolling past every element.
C10: The design examples include complex application layouts beyond single forms: multi-pane workspaces, dashboards with navigation, boards, messaging, commerce and scheduling screens.
AC1: Every listed, non-hidden pack can be selected in the side panel, and selecting it shows its elements and patterns.
AC2: Every element of every pack renders on the page without a diagnostic.
AC3: `npm test` runs the browser tests against the served page.
AC4: The development server starts with one npm script and uses no web-server package.
C6: Every element sample shows the element doing its job: a picker has options, a tab sits in a tab view, a split view has its columns, a chart has data suited to its kind, a presentation shows the surface it presents.
C7: Variants of an element keep their natural size side by side; when they are wider than the card, the card scrolls horizontally instead of squeezing them, so each variant is seen whole and none overlaps another.
C8: A pack whose framework spans several platforms also shows complete example applications for each: for SwiftUI an iPhone app, an iPad app and a Mac app with its menu bar and an open menu.
AC5: The SwiftUI pack's examples include at least one phone, one tablet and one desktop application.
AC6: The browser tests fail when any two variant cells of an element card overlap.
AC7: Opening a pack's Examples tab shows its first design example without scrolling, and a link can open a pack directly on that tab.
AC8: The design examples number at least twelve, at least six of them complex multi-region layouts.
