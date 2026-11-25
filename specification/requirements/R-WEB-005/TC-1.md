---
id: TC-1
title: Browser smoke test
verifies: [C1, C2, C6]
---

Automated by `typescript/tests/browser/core.spec.mjs` (Playwright, started by `npm test`): the index
links `pages/core.html`; the page loads `dist/shared/` with `loadAssetsFromUrl`, renders a SwiftUI
mockup styled by its pack stylesheet with no failed request, page error or diagnostic; an edited
source with a syntax error reports it, and a corrected one renders in the MUI pack.
