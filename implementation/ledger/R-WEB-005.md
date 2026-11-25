---
requirement: R-WEB-005
title: Web test suites
status: implemented
version: 0.6.5
date: 2026-11-25
issue: 5
---

# R-WEB-005 — Web test suites

<!-- written by `sio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.6.5 | 2026-11-25 | implemented | #5 | npm test = build + node --test + Playwright (chromium); playwright.config.mjs with webServer and chromium/firefox/webkit projects; core render smoke page and test (IT-13); .github/workflows/ci.yml (python + typescript on Node 22) | [Web development server, test pages and browser tests](../narrative/architecture/web-dev.md), [Testing](../narrative/testing.md), [Build and publish](../narrative/build-publish.md) |
