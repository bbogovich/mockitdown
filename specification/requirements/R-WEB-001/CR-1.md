---
id: R-WEB-001.CR-1
target: R-WEB-001
kind: revision
version: 0.6.3
date: 2026-11-25
issue: 3
summary: "as built (#3): C8 includes <name>.diag.json (R-REPO-004.C7, 0.6.2 reviewed); C10 imports with no paths try the path as written; C11 imported diagnostics name the normalised path; C12 Python option names; C13 dist/shared/manifest.json"
from: ab66ec60e889
to: 1e90a0fea52e
---

## Clauses

@ C8 edit
~ For every case of the conformance corpus (R-REPO-004), `render` MUST return exactly the expected [-HTML.-]{+HTML, and its pack lineage and diagnostics MUST equal the case's `<name>.diag.json`.+}
@ C10 insert after C9
+ When the render options name neither a source path nor import search paths, `import "path"` MUST try the path as written, then with `.mockitdown`.
@ C11 insert after C10
+ A diagnostic located in an imported component file MUST name that file's normalised path (the registered or resolved candidate, e.g. `components/pill.mockitdown`) as its source.
@ C12 insert after C11
+ The render options MUST use the field names of the Python `RenderOptions` for the options both variants share, so that a conformance case's `<name>.json` applies unchanged.
@ C13 insert after C12
+ `npm run build` MUST write `dist/shared/manifest.json`, an object `{"packs": [id, …], "files": [path, …]}` listing the built-in pack ids and the files under `dist/shared/`.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,9 @@
 The library side of the web variant. Embedding assets as data URIs, the command line and the Markdown extension stay Python-only.
+
+The core reads no files and fetches nothing (A-WEB-1.K1), so everything reaches it as data: the built-in packs, the vocabulary, the icon table and the page stylesheet once, through `loadAssets`, from `dist/shared/` (`mockitdown/node` reads them from disk; a browser host fetches the files `manifest.json` lists); an application's packs through `registerPack`; component files through `registerComponents` or an `import_resolver` option that returns a candidate path's text.
+
+Imports try the same candidates as the Python variant — the importing file's directory, then each import search path, each as written and then with `.mockitdown` — as POSIX paths. Where the Python variant would find no candidate at all (no source path, no search paths), the TypeScript one tries the path as written, so registered components need no search path; the error message is unchanged (`(searched (no import paths))`). A component's diagnostics name its normalised path where the Python variant names the file's absolute path; the corpus holds no such diagnostic (R-REPO-004.C10).
+
+Options keep the Python field names (`default_pack`, `show_warnings`, `import_paths`, `source_path` …); those that name files on disk (`asset_paths`, `pack_paths`, `embed_assets`, `max_embed_bytes`) have no TypeScript counterpart.
+
+The corpus's `<name>.diag.json` (R-REPO-004.C7) is part of the expected result: the harness compares the pack lineage and every diagnostic, in order, as the Python suite does.
```
