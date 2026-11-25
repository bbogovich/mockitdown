---
id: TC-4
title: Render API and images by base URL
verifies: [C3, C14, C15, C16]
---

Automated by `typescript/tests/unit/render.test.ts`: `render` returns html, diagnostics, packs and screen; the error box, `show_warnings` and `source`; `check`; a local image resolved against `asset_base`, reported as not found without one, remote and `data:image` references passed through; `stylesheet` with ancestors once; the anchor prefix's SHA-1; icon names; Python number formatting.
