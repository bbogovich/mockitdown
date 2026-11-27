---
id: R-DEV-008.CR-2
target: R-DEV-008
kind: editorial
version: 0.10.6
date: 2026-11-27
issue: 53
summary: test cases name the split gallery specs (#50) (#53)
from: fd80e22c90b7
to: 99b83b3a96e9
---

## Clauses

(none)

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -6,2 +6,2 @@
 
-Python and TypeScript: render `Alert`, `Dialog`, `Sheet`, `Popover`, `Toast`, `Tooltip` and `ConfirmationDialog` alone at `fit` in every shipped pack; browser test (Playwright) asserts the surface box is at least 200 × 80 (toast: at least its text width) and inside the frame. A `fit` mockup of eight captioned toggles in a 300 px wide host: frame width equals its scroll width, the cell's scrollWidth exceeds its clientWidth. Every element sample and variant of the gallery (R-WEB-004 TC-4) is checked the same way, open menus and pickers included. (`python/tests/test_fit.py`, `typescript/tests/browser/gallery.spec.mjs`.)
+Python and TypeScript: render `Alert`, `Dialog`, `Sheet`, `Popover`, `Toast`, `Tooltip` and `ConfirmationDialog` alone at `fit` in every shipped pack; browser test (Playwright) asserts the surface box is at least 200 × 80 (toast: at least its text width) and inside the frame. A `fit` mockup of eight captioned toggles in a 300 px wide host: frame width equals its scroll width, the cell's scrollWidth exceeds its clientWidth. Every element sample and variant of the gallery (R-WEB-004 TC-4) is checked the same way, open menus and pickers included. (`python/tests/test_fit.py`, `typescript/tests/browser/gallery-render.spec.mjs`.)
```
