---
id: F-18
title: Web pack gallery test page
status: active
version: 0.5.0
rev: 0
page: FEAT.3
slot: features
order: 3
hash: 0311b23aa4d8
family: web
source: [SRC-8]
requires: [F-17]
---

G1: Developers and reviewers need to see every pack and every element rendered by the web components, both by eye and in automated tests.
C1: The TypeScript project includes a pack gallery test page in a master-detail layout: a side panel lists the packs, grouped as on the example site, and the main area shows the selected pack.
C2: For the selected pack the main area shows every element the pack offers, each rendered by a `mockitdown-mockup`, with its role, arguments and variants.
C3: The main area also shows complete examples of common application design patterns in the pack's style (for example sign-in, list and detail, settings, dashboard, data table with filters).
C4: The page is served for manual review by a development server built on Node's own HTTP module.
C5: Automated browser tests open the page, select each pack and fail on any diagnostic or missing render.
AC1: Every listed, non-hidden pack can be selected in the side panel, and selecting it shows its elements and patterns.
AC2: Every element of every pack renders on the page without a diagnostic.
AC3: `npm test` runs the browser tests against the served page.
AC4: The development server starts with one npm script and uses no web-server package.
<!-- file: prose.md -->
**Problem.** The Python variant has the example site and its Reference section to show every pack; the web components need an equivalent that also serves as their end-to-end test (SRC-8).

**Change.** A test page in `typescript/` lists the packs on the left and shows the selected pack's elements and complete design patterns on the right, all as `mockitdown-mockup` components. The browser test suite (Playwright, SRC-8#clar-deps) drives the same page.
<!-- file: usecases/UC-1.md -->
---
id: UC-1
title: Review a pack in the browser
---

**Actor:** developer or reviewer.

1. The reviewer starts the development server and opens the gallery page.
2. The reviewer selects a pack in the side panel.

**Outcome:** the main area shows every element of that pack and complete design patterns in its style, each rendered by the web component.
