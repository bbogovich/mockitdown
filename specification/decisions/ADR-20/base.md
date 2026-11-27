---
id: ADR-20
title: "Web development dependencies: typescript and Playwright only"
status: active
version: 0.6.0
rev: 0
page: ADR.2
slot: decisions
order: 999
hash: d4a23f378eaa
source: [SRC-8]
constrains: [R-WEB-001, R-WEB-003, R-WEB-005]
---

D1: The TypeScript project's only development dependencies are `typescript` (compiler) and `@playwright/test` (browser tests); it has no runtime dependencies.
D2: Unit tests use `node:test`; the development server uses `node:http` and `node:fs`.
O1: rejected: Express or another web server package — a static file server is a few dozen lines on `node:http` (SRC-8).
O2: rejected: a bundler (esbuild, Vite, Rollup) — `tsc` emits ES modules browsers load directly.
O3: rejected: a hand-written Chrome DevTools-protocol driver — code to maintain where Playwright is stable (Apache-2.0, Microsoft).
C1: `npm install` fetches two packages and their own dependencies; `npx playwright install chromium` fetches the test browser.
<!-- file: prose.md -->
Chosen by the developer (SRC-8#clar-deps), following the rule that third-party dependencies are avoided unless building the feature would be prohibitively expensive. Playwright: licence Apache-2.0, maintained by Microsoft with monthly releases, development only.
