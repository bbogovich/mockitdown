---
id: R-WEB-005
title: Web test suites
status: active
version: 0.6.0
rev: 0
page: WEB.2
slot: reqs
order: 3
hash: 01ae1a017828
source: [SRC-8]
realizes: [F-18]
requires: [R-WEB-003]
constrained_by: [ADR-20]
---

C1: `npm test` MUST build the package, run the unit tests with `node --test` and the browser tests with Playwright.
C2: The Playwright configuration MUST start the development server itself and run the browser tests in Chromium; Firefox and WebKit MUST be selectable by project name.
C3: The repository's CI workflow MUST run the Python and the TypeScript test suites on every push and pull request.
V1: `npm test` from a clean checkout after `npm ci` and `npx playwright install chromium` passes.
<!-- file: TC-M1.md -->
---
id: TC-M1
title: CI runs both suites
verifies: [C3]
---

Manual: a push shows the Python and the TypeScript jobs in the CI workflow run.
<!-- file: prose.md -->
One command for the web variant's tests, as the Python variant has `unittest discover`.
