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

**R-WEB-003.TC-1 — Static server**

Automated by `typescript/tests/unit/serve.test.ts`.

**Realizes.** F-18

| | Statement |
|---|---|
| C1 | `npm run serve` MUST build the package and start a static file server built on `node:http`, serving `pages/`, `dist/` and `shared/` on `http://127.0.0.1:8173/` (port overridable by `PORT`). |
| C2 | The server MUST serve correct content types for HTML, JavaScript modules, CSS, JSON, SVG, PNG and `.mockitdown` files. |
| C3 | The server MUST refuse any path that resolves outside the served folders with status 404. |
| C4 | The server's root MUST be an index page linking every test page. |
| V1 | A unit test starts the server on a free port, fetches the index, a module and a pack stylesheet, and checks that `/../package.json` is refused. |

---

### R-WEB-004 — Pack gallery test page

**Requires:** R-WEB-002, R-WEB-003, R-REPO-003

The web counterpart of the example site's Reference section (R-PACK-012). Element samples come from the same generator, so both show the same thing.

**R-WEB-004.TC-1 — Every pack renders**

Automated by `typescript/tests/browser/gallery.spec.ts`: for every pack, select it, wait for all mockups' `rendered`, and fail on any error diagnostic or empty shadow root.

**R-WEB-004.TC-2 — Patterns in every pack**

Automated by `typescript/tests/unit/patterns.test.ts`: `check` each pattern under each shipped pack has no error.

**R-WEB-004.TC-3 — Deep link**

Automated by `typescript/tests/browser/gallery.spec.ts`: opening `packs.html#pack=carbon` shows Carbon selected.

**R-WEB-004.TC-M1 — Manual review**

TC-M: open `npm run serve` → Pack gallery, step through the groups, compare a few packs with the example site's Reference pages.

**Realizes.** F-18

| | Statement |
|---|---|
| C1 | The pack gallery page `pages/packs.html` MUST have a master-detail layout: a side panel listing every shipped, non-hidden pack grouped and ordered as the example site's Reference menu (R-PACK-012.C5), and a main area showing the selected pack. |
| C2 | Selecting a pack MUST show, for each element the pack offers (its own first, then the inherited core vocabulary), a `mockitdown-mockup` of the element's sample with the element's name, role, positional arguments, defaults, variants and `doc` line, from `shared/reference/<pack>.json`. |
| C3 | Below the elements the main area MUST show the design patterns of `shared/patterns/` rendered in the selected pack: at least sign-in form, list and detail, settings, dashboard with charts, data table with toolbar and filters, and wizard or multi-step form. |
| C4 | Each design pattern MUST be written in the core vocabulary and render in every shipped pack without an error diagnostic. |
| C5 | The selected pack MUST be reflected in the URL fragment (`#pack=<id>`) so a pack can be linked and reloaded. |
| C6 | The page MUST offer light and dark appearance and a filter on element name. |
| C7 | The side panel MUST collapse into a menu on windows narrower than 720 CSS pixels. |
| V1 | The browser tests select every pack and fail on any error diagnostic, any mockup without rendered content, or any pattern missing. |

---

### R-WEB-005 — Web test suites

**Requires:** R-WEB-003

One command for the web variant's tests, as the Python variant has `unittest discover`.

**R-WEB-005.TC-M1 — CI runs both suites**

Manual: a push shows the Python and the TypeScript jobs in the CI workflow run.

**Realizes.** F-18

| | Statement |
|---|---|
| C1 | `npm test` MUST build the package, run the unit tests with `node --test` and the browser tests with Playwright. |
| C2 | The Playwright configuration MUST start the development server itself and run the browser tests in Chromium; Firefox and WebKit MUST be selectable by project name. |
| C3 | The repository's CI workflow MUST run the Python and the TypeScript test suites on every push and pull request. |
| V1 | `npm test` from a clean checkout after `npm ci` and `npx playwright install chromium` passes. |
