---
id: R-WEB-006.CR-2
target: R-WEB-006
kind: revision
version: 0.12.14
date: 2026-11-27
issue: 62
summary: "as built (#62): C10 a hidden pack whose reference file fails is linked by its id; C11 no hidden pack shows a sentence saying there are none; TC-1 names IT-45 and gains step 8"
from: 339dd1ed8976
to: 7ca0d2c51ae5
---

## Clauses

@ C10 insert after C9
+ When a hidden pack's `shared/reference/<id>.json` cannot be loaded, the home page MUST still link that pack, labelled with its id.
@ C11 insert after C10
+ When `hidden` in `shared/reference/index.json` is missing or empty, the home page MUST show in place of the easter-egg links a sentence saying there are none.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,6 +3,6 @@
 title: Home page content, links and easter eggs
-verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9]
+verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, C11]
 ---
 
-New browser test `typescript/tests/browser/gallery-home.spec.mjs` against the development server, and
+Browser test `typescript/tests/browser/gallery-home.spec.mjs` (IT-45) against the development server, and
 step 1 of R-WEB-004.TC-9 against the published copy:
@@ -27 +27,4 @@
    and gallery link and the sentence that the easter eggs could not be loaded (C9).
+8. With the first hidden pack's reference file answered by HTTP 404, its link is labelled with its id and
+   the others with their names; with `index.json` answered with an empty `hidden`, the section holds no
+   link and the sentence that there are none (C10, C11).
--- a/prose.md
+++ b/prose.md
@@ -9,2 +9,4 @@
 
+A missing reference file or an empty `hidden` list degrades the section rather than the page (C10, C11).
+
 **Verification.** TC-1.
```
