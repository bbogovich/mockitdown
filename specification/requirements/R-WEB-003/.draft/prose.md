Development only; the package itself has no server part (F-17.C6).

The server is `typescript/scripts/serve.mjs`. Because it mirrors the folders' relative positions
(`/pages/` beside `/dist/` and `/shared/`), a test page imports the package as
`../dist/mockitdown.js` and loads the shared assets from `../dist/shared/` with `loadAssetsFromUrl`
(A-WEB-2), and the gallery reads `../shared/reference/<pack>.json` the same way. The index is
generated on each request, so a new page in `pages/` is linked without editing anything; it is not a
file in `pages/`. Responses carry `Cache-Control: no-store`, so a rebuild shows on reload.

Checked at 0.10.1 after R-WEB-001.C13 and C17 (reference data in `dist/shared/reference/`): the server already serves `dist/` and `shared/` as they are (C5), so it needs no change.
