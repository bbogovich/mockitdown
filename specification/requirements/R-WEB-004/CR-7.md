---
id: R-WEB-004.CR-7
target: R-WEB-004
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "gallery published at /gallery/ by the Pages workflow, checked before deploy (SRC-17): C27-C31, TC-9 (ING-1)"
from: b42b06e4f3a7
to: 152e6443330b
---

## Clauses

@ meta.source
- [SRC-8, SRC-9, SRC-10, SRC-11]
+ [SRC-8, SRC-9, SRC-10, SRC-11, SRC-17]
@ C27 insert after V1
+ The Pages workflow `.github/workflows/pages.yml`, on both branches, MUST install the TypeScript package's development dependencies with `npm ci`, build it with `npm run build` in `typescript/` of `main`, and publish the pack gallery at `/gallery/` of the site.
@ C28 insert after C27
+ The published `/gallery/` MUST reproduce the development server's URL layout (R-WEB-003.C5): `gallery/pages/` holding the files of `typescript/pages/`, `gallery/dist/` the built package, and `gallery/shared/` the `reference/` and `patterns/` folders of `shared/`, so that every test page works unchanged as static files.
@ C29 insert after C28
+ `/gallery/index.html` MUST redirect to `pages/packs.html` with a meta refresh and a link.
@ C30 insert after C29
+ Every request a published test page makes MUST be for a file under `/gallery/`.
@ C31 insert after C30
+ The Pages workflow MUST serve the assembled site with a static file server before uploading it, open `/gallery/` in Chromium, and fail when the gallery does not reach `packGallery.state` `ready`, when `renderAll()` for `base` or `swiftui` reports an error diagnostic or a mockup without rendered content, or when a request fails.

## Files

```diff
--- /dev/null
+++ b/TC-9.md
@@ -0,0 +1,20 @@
+---
+id: TC-9
+title: Published gallery
+verifies: [C27, C28, C29, C30, C31]
+---
+
+Run by the Pages workflow after the site is assembled (`typescript/tests/browser/published.spec.mjs`,
+pointed at a static file server over the assembled `public/` folder through `GALLERY_URL`):
+
+1. `/gallery/` redirects to `/gallery/pages/packs.html`, and `packGallery.state` becomes `ready`.
+2. `renderAll()` for `base` and for `swiftui` (Elements and Examples) resolves with no error
+   diagnostic and no mockup without rendered content.
+3. No request fails, and every request URL starts with the server's `/gallery/`.
+4. The assembled `public/gallery/` holds `pages/packs.html`, `dist/mockitdown.js`,
+   `dist/shared/manifest.json`, `shared/reference/index.json` and `shared/patterns/index.json`.
+5. The header tabs of `/` (documentation) and `/demos/` (example site) read Demo, Gallery,
+   Definition, Specification, Implementation, Reference, and both Gallery tabs link to `/gallery/`
+   (R-PACK-012.C6).
+
+The workflow fails, and nothing is deployed, when the test fails.
--- a/prose.md
+++ b/prose.md
@@ -33 +33,7 @@
 for long lines; opening it never re-renders the example.
+
+**Published (SRC-17).** The Pages workflow builds the package and copies the test pages, the built
+package and the shared `reference/` and `patterns/` folders under `/gallery/` in the same layout as
+the development server, so `packs.js` reaches `../dist/` and `../shared/` unchanged. The workflow opens
+the published copy in a browser before it deploys, so a gallery that would not load is never published.
+Test pages added later (the designer test page) are published by the same copy.
```
