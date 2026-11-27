---
id: R-WEB-001
title: TypeScript package and core
status: active
version: 0.11.0
rev: 6
page: WEB.1
slot: reqs
order: 1
hash: 5201d350af86
source: [SRC-8, SRC-12]
realizes: [F-16, F-17]
requires: [R-REPO-004]
constrained_by: [ADR-18, ADR-20]
refs: [ADR-20, R-API-001, R-API-002, R-ASSET-001, R-REPO-004]
---

C1: `typescript/` MUST be an NPM package named `mockitdown`, licensed MIT, of type `module`, with no runtime dependencies and only the development dependencies of ADR-20.
C2: `npm run build` MUST compile the TypeScript with `tsc` into `dist/` as ES modules with type declarations, and copy the shared assets the package publishes into `dist/shared/`.
C3: The package MUST export `render`, `check` and `stylesheet` with the semantics of the Python library API (R-API-001, R-API-002), taking a source string and render options and returning HTML strings and diagnostics.
C4: The TypeScript core MUST accept the same language, pack selection by `import <Module>` and by option, options and diagnostics as the Python variant.
C5: Packs MUST be registered from data: the built-in packs from the package's shared assets, an application's own packs by `registerPack(json, css)`; packs MUST extend one another as in the Python variant.
C6: `import "path"` of components MUST resolve against components registered by `registerComponents(name, source)` and, in the custom elements, against URLs relative to an import base URL, trying the name as written and then with `.mockitdown`.
C7: Image references MUST follow R-ASSET-001; local paths MUST resolve against an asset base URL, and no asset is embedded.
C8: For every case of the conformance corpus (R-REPO-004), `render` MUST return exactly the expected HTML, and its pack lineage and diagnostics MUST equal the case's `<name>.diag.json`.
C9: The TypeScript core MUST run in current Chromium, Firefox and WebKit browsers and in Node 22 or later.
C10: When the render options name neither a source path nor import search paths, `import "path"` MUST try the path as written, then with `.mockitdown`.
C11: A diagnostic located in an imported component file MUST name that file's normalised path (the registered or resolved candidate, e.g. `components/pill.mockitdown`) as its source.
C12: The render options MUST use the field names of the Python `RenderOptions` for the options both variants share, so that a conformance case's `<name>.json` applies unchanged.
C13: `npm run build` MUST write `dist/shared/manifest.json`, an object `{"packs": [id, …], "files": [path, …], "reference": [path, …]}` listing the built-in pack ids, the files under `dist/shared/` that a host loads into the core, and the reference files of C17.
C14: The render options MUST name the asset base URL `asset_base`; a local image path MUST resolve to that URL joined with the path.
C15: When the render options name no asset base URL, a local image path MUST be reported as the Python renderer reports an image no asset path holds (`asset '<path>' not found (searched (no asset paths))`, code `asset`) and render as the image placeholder.
C16: `render` MUST return an object with `html`, `diagnostics`, `packs` (the pack lineage, root first, empty after a syntax error) and `screen`, as the Python `RenderResult`, and `check` MUST return the diagnostics of `render`.
V1: `node --test` runs the conformance cases against `dist/` and fails on any difference.
C17: `npm run build` MUST copy `shared/reference/index.json` and every `shared/reference/<pack>.json` into `dist/shared/reference/`, listed under `reference` and not under `files` in the manifest, so that `loadAssetsFromUrl` does not fetch them.
