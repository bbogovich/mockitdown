---
id: R-WEB-005
title: Web test suites
status: active
version: 0.10.8
rev: 4
page: WEB.2
slot: reqs
order: 3
hash: c2004a9286ad
source: [SRC-8]
realizes: [F-18]
requires: [R-WEB-003]
constrained_by: [ADR-20]
---

C1: `npm test` MUST build the package, run the unit tests with `node --test` and the browser tests with Playwright.
C2: The Playwright configuration MUST start the development server itself and run the browser tests in Chromium; Firefox and WebKit MUST be selectable by project name.
C3: The repository's CI workflow MUST run the Python and the TypeScript test suites on every push and pull request.
C4: `npm test` MUST run the browser tests in the `chromium` project only, so that it needs no other browser installed.
C5: The CI workflow MUST run the TypeScript suite on Node 22 with the Chromium of Playwright, and the Python suite with Zensical installed so that the example site's real build runs.
C6: The browser tests MUST include a smoke test that loads a test page, loads the shared assets as a browser host does, renders a mockup through the core and fails on any failed request, page error or error diagnostic.
V1: `npm test` from a clean checkout after `npm ci` and `npx playwright install chromium` passes.
