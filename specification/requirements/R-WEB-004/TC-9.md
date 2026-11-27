---
id: TC-9
title: Published gallery
verifies: [C27, C28, C29, C30, C31]
---

Run by the Pages workflow after the site is assembled (`typescript/tests/browser/published.spec.mjs`,
pointed at a static file server over the assembled `public/` folder through `GALLERY_URL`):

1. `/gallery/` redirects to `/gallery/pages/packs.html`, and `packGallery.state` becomes `ready`.
2. `renderAll()` for `base` and for `swiftui` (Elements and Examples) resolves with no error
   diagnostic and no mockup without rendered content.
3. No request fails, and every request URL starts with the server's `/gallery/`.
4. The assembled `public/gallery/` holds `pages/packs.html`, `dist/mockitdown.js`,
   `dist/shared/manifest.json`, `shared/reference/index.json` and `shared/patterns/index.json`.
5. The header tabs of `/` (documentation) and `/demos/` (example site) read Demo, Gallery,
   Definition, Specification, Implementation, Reference, and both Gallery tabs link to `/gallery/`
   (R-PACK-012.C6).

The workflow fails, and nothing is deployed, when the test fails.
