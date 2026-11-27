---
id: TC-1
title: Every pack renders
verifies: [C2]
---

Automated by `typescript/tests/browser/gallery-packs.spec.mjs`: for every pack, select it, render and wait for all mockups (`window.packGallery.renderAll()`), and fail on any error diagnostic, any empty shadow root or zero-sized visible mockup, any element of `shared/reference/<pack>.json` or pattern of `shared/patterns/index.json` missing.
