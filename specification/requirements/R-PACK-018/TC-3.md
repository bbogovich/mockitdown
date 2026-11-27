---
id: TC-3
title: Rendering unchanged by the migration
verifies: [C10]
---

Run once by the issue that moves rules, and again by any later issue that moves rules:

1. `gen_conformance.py --check` and both conformance suites pass with no expected file changed.
2. Before changing any stylesheet, capture with Playwright full-page screenshots of the gallery
   (`pages/packs.html#pack=<id>&tab=elements` and `&tab=examples`, after `renderAll()`) for every pack
   whose `pack.css` will change, in light and dark appearance, at 1280 × 800; after the change, capture
   them again and compare pixel by pixel (`expect(page).toHaveScreenshot` with `maxDiffPixels: 0`
   against the baseline taken before). Any difference fails. The script is
   `typescript/tests/browser/css-migration.spec.mjs`, run with `MIGRATION_BASELINE=1` to record the
   baseline; it is not part of `npm test`.
