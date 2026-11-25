---
id: R-WEB-005.CR-2
target: R-WEB-005
kind: editorial
version: 0.6.5
date: 2026-11-25
issue: 5
summary: "as built (#5): TC-1, the browser smoke test"
from: 84b91373e8ba
to: 8d4d0943570e
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,10 @@
+---
+id: TC-1
+title: Browser smoke test
+verifies: [C1, C2, C6]
+---
+
+Automated by `typescript/tests/browser/core.spec.mjs` (Playwright, started by `npm test`): the index
+links `pages/core.html`; the page loads `dist/shared/` with `loadAssetsFromUrl`, renders a SwiftUI
+mockup styled by its pack stylesheet with no failed request, page error or diagnostic; an edited
+source with a syntax error reports it, and a corrected one renders in the MUI pack.
```
