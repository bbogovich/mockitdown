The library side of the web variant. Embedding assets as data URIs, the command line and the Markdown extension stay Python-only.

The core reads no files and fetches nothing (A-WEB-1.K1), so everything reaches it as data: the built-in packs, the vocabulary, the icon table and the page stylesheet once, through `loadAssets`, from `dist/shared/` (`mockitdown/node` reads them from disk; a browser host fetches the files `manifest.json` lists); an application's packs through `registerPack`; component files through `registerComponents` or an `import_resolver` option that returns a candidate path's text.

Imports try the same candidates as the Python variant — the importing file's directory, then each import search path, each as written and then with `.mockitdown` — as POSIX paths. Where the Python variant would find no candidate at all (no source path, no search paths), the TypeScript one tries the path as written, so registered components need no search path; the error message is unchanged (`(searched (no import paths))`). A component's diagnostics name its normalised path where the Python variant names the file's absolute path; the corpus holds no such diagnostic (R-REPO-004.C10).

Options keep the Python field names (`default_pack`, `show_warnings`, `imports`, `source_path` …); those that name files on disk (`asset_paths`, `pack_paths`, `embed_assets`, `max_embed_bytes`) have no TypeScript counterpart.

The corpus's `<name>.diag.json` (R-REPO-004.C7) is part of the expected result: the harness compares the pack lineage and every diagnostic, in order, as the Python suite does.

Images are never embedded (C7): a local path such as `Image("team.jpg")` becomes the `asset_base` URL joined with the path (C14), for the browser to load. With no `asset_base` there is nowhere to look, and the result is the one the Python renderer gives when none of its asset paths holds the file — the same warning and the photo placeholder (C15) — so the conformance case for a missing image holds in both variants.

`render` returns what the Python `render` returns (C16): the HTML (the error box first when there are errors, or warnings with `show_warnings`), every diagnostic, the pack lineage for `stylesheet`, and the evaluated screen.

The package also publishes the reference data (`dist/shared/reference/`), which the design-tool gallery
reads for every element's role, parameters and sample (R-TOOL-004). The manifest lists it apart from the
files a host loads into the core, because a browser host fetches every file of `files` at start-up and the
reference data is large.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-18, ADR-20, R-REPO-004 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.
