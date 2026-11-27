---
id: R-WEB-004.CR-9
target: R-WEB-004
kind: clarification
version: pending
date: 2026-11-26
issue: 51
summary: "TC-9 step 5 checks /definition/ and /demos/ (the root only redirects); TC-10 ties C3, C6-C8, C11, C12 to their tests (audit #51)"
from: abb4cf5070bf
to: e495a8d0660d
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-10.md
@@ -0,0 +1,23 @@
+---
+id: TC-10
+title: Gallery page behaviour
+verifies: [C3, C6, C7, C8, C11, C12]
+---
+
+Automated, in the files named; no step is new behaviour, the case only ties the clauses to their tests.
+
+1. `typescript/tests/unit/patterns.test.ts`: `shared/patterns/index.json` lists, in order, the patterns of
+   C3 (sign-in form, list and detail, settings, dashboard with charts, data table with toolbar and
+   filters, wizard), each entry with `id`, `title` and `file`, and each file imports no module (C8).
+2. `gallery.spec.mjs`, "light and dark appearance, and the element-name filter": choosing dark sets the
+   page and every mockup to dark, and typing `chart` in the filter hides every element card whose name
+   does not contain it, and clearing it shows all (C6).
+3. `gallery.spec.mjs`, "under 720 px the side panel collapses into a menu": at 600 px wide the side panel
+   is hidden behind the menu button, which opens it, and choosing a pack closes it; at 1200 px the panel
+   is shown and the button hidden (C7). The 720 px boundary itself is not tested.
+4. `gallery.spec.mjs`, "a missing or unknown #pack= selects the first pack of the side panel" (C12).
+5. `gallery.spec.mjs`, TC-1 uses `window.packGallery.state`, `select(id)` and `renderAll()` for every
+   pack (C11).
+
+Not covered by an automated test at 0.10.1: C9 (render with `device="fit"`; patterns with the device and
+chrome of their index entry, partly through TC-5) and C10 (lazy creation, a SHOULD).
--- a/TC-9.md
+++ b/TC-9.md
@@ -15,5 +15,6 @@
    `dist/shared/manifest.json`, `shared/reference/index.json` and `shared/patterns/index.json`.
-5. The header tabs of `/` (documentation) and `/demos/` (example site) read Demo, Gallery,
-   Definition, Specification, Implementation, Reference, and both Gallery tabs link to `/gallery/`
-   (R-PACK-012.C6).
+5. The header tabs of `/definition/` (the first page of the documentation site, which has no page at
+   `/`: the published root only redirects to `/demos/`) and of `/demos/` (example site) read Demo,
+   Gallery, Definition, Specification, Implementation, Reference, and both Gallery tabs link to
+   `/gallery/` (R-PACK-012.C6).
 
```
