---
id: R-WEB-005.CR-1
target: R-WEB-005
kind: revision
version: 0.6.5
date: 2026-11-25
issue: 5
summary: "as built (#5): npm test runs Chromium only; CI on Node 22 and with Zensical; a browser smoke test through the core"
from: 01ae1a017828
to: 84b91373e8ba
---

## Clauses

@ C4 insert after C3
+ `npm test` MUST run the browser tests in the `chromium` project only, so that it needs no other browser installed.
@ C5 insert after C4
+ The CI workflow MUST run the TypeScript suite on Node 22 with the Chromium of Playwright, and the Python suite with Zensical installed so that the example site's real build runs.
@ C6 insert after C5
+ The browser tests MUST include a smoke test that loads a test page, loads the shared assets as a browser host does, renders a mockup through the core and fails on any failed request, page error or error diagnostic.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,6 @@
 One command for the web variant's tests, as the Python variant has `unittest discover`.
+
+The browser tests live in `typescript/tests/browser/*.spec.mjs` and the configuration in
+`typescript/playwright.config.mjs` (plain JavaScript, so neither needs type declarations). The CI
+workflow is `.github/workflows/ci.yml`, with one job per variant; it publishes nothing, so it does not
+overlap `pages.yml` and `release.yml`.
```
