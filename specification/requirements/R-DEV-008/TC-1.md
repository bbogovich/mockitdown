---
id: TC-1
title: Fit frames keep their width and hold presentations
verifies: [C1, C2, C3, C6, C7, C8, C9, C10]
---

Python and TypeScript: render `Alert`, `Dialog`, `Sheet`, `Popover`, `Toast`, `Tooltip` and `ConfirmationDialog` alone at `fit` in every shipped pack; browser test (Playwright) asserts the surface box is at least 200 × 80 (toast: at least its text width) and inside the frame. A `fit` mockup of eight captioned toggles in a 300 px wide host: frame width equals its scroll width, the cell's scrollWidth exceeds its clientWidth. Every element sample and variant of the gallery (R-WEB-004 TC-4) is checked the same way, open menus and pickers included. (`python/tests/test_fit.py`, `typescript/tests/browser/gallery.spec.mjs`.)
