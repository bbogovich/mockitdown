---
title: "Web components"
spec_version: 0.10.3
status: draft
updated: 2026-11-26
page_id: WEB.1
---

# Web components

The TypeScript variant (F-17) is an NPM package of web components whose tags begin with
`mockitdown-`. Its core is a port of the Python language, evaluation and rendering modules, held to
the same output by the conformance corpus (ADR-18). The renderer element carries its code in a
script child (ADR-19):

```html
<script type="module" src="node_modules/mockitdown/dist/mockitdown.js"></script>

<mockitdown-mockup pack="fluent" device="desktop" appearance="auto" title="Settings">
  <script type="text/mockitdown">
    import Fluent
    NavigationView { Text("Settings").font(.title) }
  </script>
</mockitdown-mockup>
```

The design-tool components (F-19, F-20) and the editing core they stand on (F-21) are specified on
[Editing core](editing.md), [Design-tool components](design-tools.md) and
[Canvas of named mockups](canvas.md).

### R-WEB-001 — TypeScript package and core

**Requires:** R-REPO-004

The library side of the web variant. Embedding assets as data URIs, the command line and the Markdown extension stay Python-only.

The core reads no files and fetches nothing (A-WEB-1.K1), so everything reaches it as data: the built-in packs, the vocabulary, the icon table and the page stylesheet once, through `loadAssets`, from `dist/shared/` (`mockitdown/node` reads them from disk; a browser host fetches the files `manifest.json` lists); an application's packs through `registerPack`; component files through `registerComponents` or an `import_resolver` option that returns a candidate path's text.

Imports try the same candidates as the Python variant — the importing file's directory, then each import search path, each as written and then with `.mockitdown` — as POSIX paths. Where the Python variant would find no candidate at all (no source path, no search paths), the TypeScript one tries the path as written, so registered components need no search path; the error message is unchanged (`(searched (no import paths))`). A component's diagnostics name its normalised path where the Python variant names the file's absolute path; the corpus holds no such diagnostic (R-REPO-004.C10).

Options keep the Python field names (`default_pack`, `show_warnings`, `import_paths`, `source_path` …); those that name files on disk (`asset_paths`, `pack_paths`, `embed_assets`, `max_embed_bytes`) have no TypeScript counterpart.

The corpus's `<name>.diag.json` (R-REPO-004.C7) is part of the expected result: the harness compares the pack lineage and every diagnostic, in order, as the Python suite does.

Images are never embedded (C7): a local path such as `Image("team.jpg")` becomes the `asset_base` URL joined with the path (C14), for the browser to load. With no `asset_base` there is nowhere to look, and the result is the one the Python renderer gives when none of its asset paths holds the file — the same warning and the photo placeholder (C15) — so the conformance case for a missing image holds in both variants.

`render` returns what the Python `render` returns (C16): the HTML (the error box first when there are errors, or warnings with `show_warnings`), every diagnostic, the pack lineage for `stylesheet`, and the evaluated screen.

The package also publishes the reference data (`dist/shared/reference/`), which the design-tool gallery
reads for every element's role, parameters and sample (R-TOOL-004). The manifest lists it apart from the
files a host loads into the core, because a browser host fetches every file of `files` at start-up and the
reference data is large.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**R-WEB-001.TC-1 — Conformance corpus in TypeScript**

Automated by `typescript/tests/unit/conformance.test.ts` (node:test).

**R-WEB-001.TC-2 — No runtime dependencies**

Automated by `typescript/tests/unit/package.test.ts`: `package.json` has no `dependencies` and exactly the `devDependencies` of ADR-20.

**R-WEB-001.TC-3 — Application pack**

Automated by `typescript/tests/unit/packs.test.ts`: a pack registered with `registerPack` that extends `mui` is selected by its module name and its tokens appear in `stylesheet`.

**R-WEB-001.TC-4 — Render API and images by base URL**

Automated by `typescript/tests/unit/render.test.ts`: `render` returns html, diagnostics, packs and screen; the error box, `show_warnings` and `source`; `check`; a local image resolved against `asset_base`, reported as not found without one, remote and `data:image` references passed through; `stylesheet` with ancestors once; the anchor prefix's SHA-1; icon names; Python number formatting.

**R-WEB-001.TC-5 — Reference data in the package**

`node scripts/copy-shared.mjs --check` (run by `npm test`) fails when `dist/shared/reference/` differs
from `shared/reference/`; a unit test reads `dist/shared/manifest.json` and checks that `reference` lists
`reference/index.json` and one `reference/<pack>.json` per pack, that none of them is in `files`, and
that `loadAssetsFromUrl` with a recording `fetch` requests no reference file.

**Realizes.** F-16, F-17

| | Statement |
|---|---|
| C1 | `typescript/` MUST be an NPM package named `mockitdown`, licensed MIT, of type `module`, with no runtime dependencies and only the development dependencies of ADR-20. |
| C2 | `npm run build` MUST compile the TypeScript with `tsc` into `dist/` as ES modules with type declarations, and copy the shared assets the package publishes into `dist/shared/`. |
| C3 | The package MUST export `render`, `check` and `stylesheet` with the semantics of the Python library API (R-API-001, R-API-002), taking a source string and render options and returning HTML strings and diagnostics. |
| C4 | The TypeScript core MUST accept the same language, pack selection by `import <Module>` and by option, options and diagnostics as the Python variant. |
| C5 | Packs MUST be registered from data: the built-in packs from the package's shared assets, an application's own packs by `registerPack(json, css)`; packs MUST extend one another as in the Python variant. |
| C6 | `import "path"` of components MUST resolve against components registered by `registerComponents(name, source)` and, in the custom elements, against URLs relative to an import base URL, trying the name as written and then with `.mockitdown`. |
| C7 | Image references MUST follow R-ASSET-001; local paths MUST resolve against an asset base URL, and no asset is embedded. |
| C8 | For every case of the conformance corpus (R-REPO-004), `render` MUST return exactly the expected HTML, and its pack lineage and diagnostics MUST equal the case's `<name>.diag.json`. |
| C9 | The TypeScript core MUST run in current Chromium, Firefox and WebKit browsers and in Node 22 or later. |
| C10 | When the render options name neither a source path nor import search paths, `import "path"` MUST try the path as written, then with `.mockitdown`. |
| C11 | A diagnostic located in an imported component file MUST name that file's normalised path (the registered or resolved candidate, e.g. `components/pill.mockitdown`) as its source. |
| C12 | The render options MUST use the field names of the Python `RenderOptions` for the options both variants share, so that a conformance case's `<name>.json` applies unchanged. |
| C13 | `npm run build` MUST write `dist/shared/manifest.json`, an object `{"packs": [id, …], "files": [path, …], "reference": [path, …]}` listing the built-in pack ids, the files under `dist/shared/` that a host loads into the core, and the reference files of C17. |
| C14 | The render options MUST name the asset base URL `asset_base`; a local image path MUST resolve to that URL joined with the path. |
| C15 | When the render options name no asset base URL, a local image path MUST be reported as the Python renderer reports an image no asset path holds (`asset '<path>' not found (searched (no asset paths))`, code `asset`) and render as the image placeholder. |
| C16 | `render` MUST return an object with `html`, `diagnostics`, `packs` (the pack lineage, root first, empty after a syntax error) and `screen`, as the Python `RenderResult`, and `check` MUST return the diagnostics of `render`. |
| V1 | `node --test` runs the conformance cases against `dist/` and fails on any difference. |
| C17 | `npm run build` MUST copy `shared/reference/index.json` and every `shared/reference/<pack>.json` into `dist/shared/reference/`, listed under `reference` and not under `files` in the manifest, so that `loadAssetsFromUrl` does not fetch them. |

---

### R-WEB-002 — The mockitdown-mockup element

**Requires:** R-WEB-001

The renderer element of SRC-8, with the script child chosen in place of CDATA (ADR-19).

```html
<script type="module" src="node_modules/mockitdown/dist/mockitdown.js"></script>

<mockitdown-mockup pack="mui" device="phone" import-base="mockups/">
  <script type="text/mockitdown">
    import "components/pill"
    VStack {
      Text("a < b && c > d")
      StatusPill(text: "Online")
    }
  </script>
</mockitdown-mockup>
```

The script's text reaches the element exactly as written, so `<`, `>` and `&` need no escaping. The
line break after `<script …>` and the indentation before `</script>` are dropped, and the indentation
common to the lines is removed, so the code is what a Markdown fence holding the same lines would
contain. The one thing a page cannot put in the script is `</script` — it ends the element. Code that
contains it (in a string, say) is set from a script instead: `element.code = source`.

The attributes are the fence's, with the fence's meanings; as in HTML, a boolean attribute written
without a value (`<mockitdown-mockup elements source>`) is on. Other attributes (`class`, `style`,
`data-*`) belong to the page and are ignored. Note that `id` and `title` are also global HTML
attributes: on a mockup element they name and caption the figure as well as the element.

Every element renders on its own: a syntax error, a bad attribute or a missing import shows the error
box in that element only, and the page hears about it through the `mockitdown-diagnostics` event,
which bubbles out of shadow roots. `await element.rendered` waits for the render a change has
started; it is the hook tests and editors use after setting an attribute or `code`.

Pages that show many mockups can create them on demand: the pack gallery (R-WEB-004) sets `code` on
a new element before inserting it, so each one renders once, and waits on `rendered` to know when a
whole pack is done.

`<mockitdown-mockup edit>` renders the mockup for editing (R-EDIT-004): every element produced from a
call carries `data-mkd-node`. The design tools use it; a page showing a mockup to readers does not.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**R-WEB-002.TC-1 — Script child with markup characters**

Automated by `typescript/tests/browser/mockup.spec.mjs`: code with `Text("a < b && c > d")` renders the text verbatim and the HTML equals the conformance output.

**R-WEB-002.TC-2 — Re-render on change**

Automated by `typescript/tests/browser/mockup.spec.mjs`: changing `pack` and then the script text updates the rendering; `rendered` resolves after each.

**R-WEB-002.TC-3 — Diagnostics isolated**

Automated by `typescript/tests/browser/mockup.spec.mjs`: a page with one invalid and one valid mockup shows the error box in the first, renders the second, and fires one `mockitdown-diagnostics` event.

**R-WEB-002.TC-4 — Edit attribute**

Browser test (`mockup.spec.mjs`): a mockup element with `edit` holds, in its shadow root, the HTML that
`render` returns with `edit: true` for the same code; removing the attribute re-renders without any
`data-mkd-node`.

**Realizes.** F-17

| | Statement |
|---|---|
| C1 | Loading the package entry `dist/mockitdown.js` MUST define the custom element `mockitdown-mockup`, and every custom element of the package MUST have a tag beginning with `mockitdown-`. |
| C2 | The mockup element MUST take its code from its first child `<script type="text/mockitdown">`, with a first line and a last line holding only whitespace dropped and the common leading indentation of the remaining lines removed; other children MUST be ignored. |
| C3 | The mockup element MUST accept the fence attributes of R-MDX-003 as HTML attributes with the same names and meanings (`pack`, `device`, `appearance`, `chrome`, `title`, `id`, `url`, `width`, `height`, `caption`, `elements`, `source`, `window` and `windowed`, which the fence also accepts), plus `import-base` and `asset-base` (URLs, default: the document's base URL). |
| C4 | The mockup element MUST render into an open shadow root holding the stylesheet for the packs used and the rendered HTML. |
| C5 | The mockup element MUST re-render when an observed attribute changes or the script's text changes. |
| C6 | When rendering produces diagnostics, the mockup element MUST show them as the Python variant's error box does and MUST dispatch a bubbling, composed `mockitdown-diagnostics` event whose `detail.diagnostics` lists them. |
| C7 | An error in one mockup element MUST NOT stop other mockup elements on the page from rendering. |
| C8 | The mockup element MUST expose the properties `code` (get and set the code), `diagnostics` (the last render's diagnostics) and `rendered` (a promise that resolves after the next render, at once when the element is rendered and up to date, and never rejects). |
| C9 | If the script child contains `</script`, the page cannot carry it; the element's documentation MUST say so and SHOULD suggest setting `code` by script. |
| C10 | The mockup element MUST read a boolean attribute that is present with an empty value as true. |
| C11 | If an attribute of C3 has an invalid value, then the mockup element MUST report a fence error (code `fence`) as R-MDX-003.C4 does, after the render's diagnostics, and place an error box listing the fence errors above the rendering; attributes not named in C3 MUST be ignored. |
| C12 | If the mockup element cannot render (the shared assets fail to load, or rendering throws), then it MUST show an error box holding one error of code `element` that names the cause. |
| V1 | The browser tests mount mockup elements with code containing `<`, `>` and `&`, change attributes and code, and compare the shadow root's HTML with the conformance output. |
| C13 | The mockup element MUST accept the boolean attribute `edit`, which renders with the `edit` option (R-EDIT-004.C1); like `import-base` and `asset-base`, it is not a fence attribute. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Design-tool components now specified on their own pages (ING-1) |
| 0.8.9 | 2026-11-25 | as built: the windowed attribute (R-DEV-010.C4) (#13) |
| 0.6.7 | 2026-11-25 | reviewed against ADR-19 as clarified (#7); prose: elements created on demand by the pack gallery (R-WEB-004) |
| 0.6.6 | 2026-11-25 | as built (#6): C2 drops the script's first and last blank lines before dedenting; C3 adds window; C6 bubbling composed event with detail.diagnostics; C8 rendered resolves at once when up to date and never rejects; C10 empty boolean attribute is true; C11 fence errors for invalid attributes, other attributes ignored; C12 error box of code element when the element cannot render; TCs name mockup.spec.mjs; reviewed against R-WEB-001@0.6.4 |
| 0.6.4 | 2026-11-25 | as built (#4): C14 asset_base option joins local image paths; C15 no asset base reports the Python not-found warning and the placeholder; C16 RenderResult (html, diagnostics, packs, screen) and check; TC-4 |
| 0.6.3 | 2026-11-25 | as built (#3): C8 includes <name>.diag.json (R-REPO-004.C7, 0.6.2 reviewed); C10 imports with no paths try the path as written; C11 imported diagnostics name the normalised path; C12 Python option names; C13 dist/shared/manifest.json |
| 0.10.0 | 2026-11-26 | Design-tool components now specified on their own pages (ING-1) |
| 0.8.9 | 2026-11-25 | as built: the windowed attribute (R-DEV-010.C4) (#13) |
| 0.6.7 | 2026-11-25 | reviewed against ADR-19 as clarified (#7); prose: elements created on demand by the pack gallery (R-WEB-004) |
| 0.6.6 | 2026-11-25 | as built (#6): C2 drops the script's first and last blank lines before dedenting; C3 adds window; C6 bubbling composed event with detail.diagnostics; C8 rendered resolves at once when up to date and never rejects; C10 empty boolean attribute is true; C11 fence errors for invalid attributes, other attributes ignored; C12 error box of code element when the element cannot render; TCs name mockup.spec.mjs; reviewed against R-WEB-001@0.6.4 |
| 0.6.4 | 2026-11-25 | as built (#4): C14 asset_base option joins local image paths; C15 no asset base reports the Python not-found warning and the placeholder; C16 RenderResult (html, diagnostics, packs, screen) and check; TC-4 |
| 0.6.3 | 2026-11-25 | as built (#3): C8 includes <name>.diag.json (R-REPO-004.C7, 0.6.2 reviewed); C10 imports with no paths try the path as written; C11 imported diagnostics name the normalised path; C12 Python option names; C13 dist/shared/manifest.json |
