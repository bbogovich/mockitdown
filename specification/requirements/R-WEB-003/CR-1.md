---
id: R-WEB-003.CR-1
target: R-WEB-003
kind: revision
version: 0.6.5
date: 2026-11-25
issue: 5
summary: "as built (#5): URL layout /pages/ /dist/ /shared/, index generated from pages/*.html titles, .mockitdown as text/plain, 405 for other methods; reviewed against R-WEB-001@0.6.4"
from: ee3f6b8a739a
to: 26dd8aec9e55
---

## Clauses

@ C5 insert after C4
+ The server MUST map the URL paths `/pages/`, `/dist/` and `/shared/` to `typescript/pages/`, `typescript/dist/` and the repository's `shared/`, so that a test page reaches the package and the shared files by the relative paths `../dist/` and `../shared/`.
@ C6 insert after C5
+ The server MUST generate the index from the `.html` files in `pages/`, each linked with the text of its `<title>`.
@ C7 insert after C6
+ The server MUST serve `.mockitdown` files as `text/plain; charset=utf-8`.
@ C8 insert after C7
+ The server MUST answer a method other than `GET` and `HEAD` with status 405.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: Static server
-verifies: [C3]
+verifies: [C2, C3, C4, C5]
 ---
--- a/prose.md
+++ b/prose.md
@@ -1 +1,8 @@
 Development only; the package itself has no server part (F-17.C6).
+
+The server is `typescript/scripts/serve.mjs`. Because it mirrors the folders' relative positions
+(`/pages/` beside `/dist/` and `/shared/`), a test page imports the package as
+`../dist/mockitdown.js` and loads the shared assets from `../dist/shared/` with `loadAssetsFromUrl`
+(A-WEB-2), and the gallery reads `../shared/reference/<pack>.json` the same way. The index is
+generated on each request, so a new page in `pages/` is linked without editing anything; it is not a
+file in `pages/`. Responses carry `Cache-Control: no-store`, so a rebuild shows on reload.
```
