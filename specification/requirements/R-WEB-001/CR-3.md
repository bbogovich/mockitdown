---
id: R-WEB-001.CR-3
target: R-WEB-001
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "reference data published in dist/shared/reference/, listed apart in the manifest: C13, C17, TC-5 (ING-1)"
from: 313971112fea
to: e76b933d628f
---

## Clauses

@ meta.source
- [SRC-8]
+ [SRC-8, SRC-12]
@ C13 edit
~ `npm run build` MUST write `dist/shared/manifest.json`, an object `{"packs": [id, …], "files": [path, {+…], "reference": [path, +}…]}` listing the built-in pack [-ids and-]{+ids,+} the files under [-`dist/shared/`.-]{+`dist/shared/` that a host loads into the core, and the reference files of C17.+}
@ C17 insert after V1
+ `npm run build` MUST copy `shared/reference/index.json` and every `shared/reference/<pack>.json` into `dist/shared/reference/`, listed under `reference` and not under `files` in the manifest, so that `loadAssetsFromUrl` does not fetch them.

## Files

```diff
--- /dev/null
+++ b/TC-5.md
@@ -0,0 +1,10 @@
+---
+id: TC-5
+title: Reference data in the package
+verifies: [C13, C17]
+---
+
+`node scripts/copy-shared.mjs --check` (run by `npm test`) fails when `dist/shared/reference/` differs
+from `shared/reference/`; a unit test reads `dist/shared/manifest.json` and checks that `reference` lists
+`reference/index.json` and one `reference/<pack>.json` per pack, that none of them is in `files`, and
+that `loadAssetsFromUrl` with a recording `fetch` requests no reference file.
--- a/prose.md
+++ b/prose.md
@@ -13 +13,6 @@
 `render` returns what the Python `render` returns (C16): the HTML (the error box first when there are errors, or warnings with `show_warnings`), every diagnostic, the pack lineage for `stylesheet`, and the evaluated screen.
+
+The package also publishes the reference data (`dist/shared/reference/`), which the design-tool gallery
+reads for every element's role, parameters and sample (R-TOOL-004). The manifest lists it apart from the
+files a host loads into the core, because a browser host fetches every file of `files` at start-up and the
+reference data is large.
```
