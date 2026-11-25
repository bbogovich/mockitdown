The library side of the web variant. Embedding assets as data URIs, the command line and the Markdown extension stay Python-only.

The core reads no files and fetches nothing (A-WEB-1.K1), so everything reaches it as data: the built-in packs, the vocabulary, the icon table and the page stylesheet once, through `loadAssets`, from `dist/shared/` (`mockitdown/node` reads them from disk; a browser host fetches the files `manifest.json` lists); an application's packs through `registerPack`; component files through `registerComponents` or an `import_resolver` option that returns a candidate path's text.

Imports try the same candidates as the Python variant — the importing file's directory, then each import search path, each as written and then with `.mockitdown` — as POSIX paths. Where the Python variant would find no candidate at all (no source path, no search paths), the TypeScript one tries the path as written, so registered components need no search path; the error message is unchanged (`(searched (no import paths))`). A component's diagnostics name its normalised path where the Python variant names the file's absolute path; the corpus holds no such diagnostic (R-REPO-004.C10).

Options keep the Python field names (`default_pack`, `show_warnings`, `import_paths`, `source_path` …); those that name files on disk (`asset_paths`, `pack_paths`, `embed_assets`, `max_embed_bytes`) have no TypeScript counterpart.

The corpus's `<name>.diag.json` (R-REPO-004.C7) is part of the expected result: the harness compares the pack lineage and every diagnostic, in order, as the Python suite does.
