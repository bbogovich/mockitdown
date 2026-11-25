---
id: R-WEB-001.CR-2
target: R-WEB-001
kind: revision
version: 0.6.4
date: 2026-11-25
issue: 4
summary: "as built (#4): C14 asset_base option joins local image paths; C15 no asset base reports the Python not-found warning and the placeholder; C16 RenderResult (html, diagnostics, packs, screen) and check; TC-4"
from: 1e90a0fea52e
to: 313971112fea
---

## Clauses

@ C14 insert after C13
+ The render options MUST name the asset base URL `asset_base`; a local image path MUST resolve to that URL joined with the path.
@ C15 insert after C14
+ When the render options name no asset base URL, a local image path MUST be reported as the Python renderer reports an image no asset path holds (`asset '<path>' not found (searched (no asset paths))`, code `asset`) and render as the image placeholder.
@ C16 insert after C15
+ `render` MUST return an object with `html`, `diagnostics`, `packs` (the pack lineage, root first, empty after a syntax error) and `screen`, as the Python `RenderResult`, and `check` MUST return the diagnostics of `render`.

## Files

```diff
--- /dev/null
+++ b/TC-4.md
@@ -0,0 +1,7 @@
+---
+id: TC-4
+title: Render API and images by base URL
+verifies: [C3, C14, C15, C16]
+---
+
+Automated by `typescript/tests/unit/render.test.ts`: `render` returns html, diagnostics, packs and screen; the error box, `show_warnings` and `source`; `check`; a local image resolved against `asset_base`, reported as not found without one, remote and `data:image` references passed through; `stylesheet` with ancestors once; the anchor prefix's SHA-1; icon names; Python number formatting.
--- a/prose.md
+++ b/prose.md
@@ -9 +9,5 @@
 The corpus's `<name>.diag.json` (R-REPO-004.C7) is part of the expected result: the harness compares the pack lineage and every diagnostic, in order, as the Python suite does.
+
+Images are never embedded (C7): a local path such as `Image("team.jpg")` becomes the `asset_base` URL joined with the path (C14), for the browser to load. With no `asset_base` there is nowhere to look, and the result is the one the Python renderer gives when none of its asset paths holds the file — the same warning and the photo placeholder (C15) — so the conformance case for a missing image holds in both variants.
+
+`render` returns what the Python `render` returns (C16): the HTML (the error box first when there are errors, or warnings with `show_warnings`), every diagnostic, the pack lineage for `stylesheet`, and the evaluated screen.
```
