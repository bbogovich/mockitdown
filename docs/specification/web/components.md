---
title: "Web components"
spec_version: 0.6.0
status: draft
updated: 2026-11-25
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

The design-tool components (F-19, F-20) are specified after the designer design document is reviewed.

### R-WEB-001 — TypeScript package and core

**Requires:** R-REPO-004

The library side of the web variant. Embedding assets as data URIs, the command line and the Markdown extension stay Python-only.

**R-WEB-001.TC-1 — Conformance corpus in TypeScript**

Automated by `typescript/tests/unit/conformance.test.ts` (node:test).

**R-WEB-001.TC-2 — No runtime dependencies**

Automated by `typescript/tests/unit/package.test.ts`: `package.json` has no `dependencies` and exactly the `devDependencies` of ADR-20.

**R-WEB-001.TC-3 — Application pack**

Automated by `typescript/tests/unit/packs.test.ts`: a pack registered with `registerPack` that extends `mui` is selected by its module name and its tokens appear in `stylesheet`.

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
| C8 | For every case of the conformance corpus (R-REPO-004), `render` MUST return exactly the expected HTML. |
| C9 | The TypeScript core MUST run in current Chromium, Firefox and WebKit browsers and in Node 22 or later. |
| V1 | `node --test` runs the conformance cases against `dist/` and fails on any difference. |

---

### R-WEB-002 — The mockitdown-mockup element

**Requires:** R-WEB-001

The renderer element of SRC-8, with the script child chosen in place of CDATA (ADR-19).

**R-WEB-002.TC-1 — Script child with markup characters**

Automated by `typescript/tests/browser/mockup.spec.ts`: code with `Text("a < b && c > d")` renders the text verbatim and the HTML equals the conformance output.

**R-WEB-002.TC-2 — Re-render on change**

Automated by `typescript/tests/browser/mockup.spec.ts`: changing `pack` and then the script text updates the rendering; `rendered` resolves after each.

**R-WEB-002.TC-3 — Diagnostics isolated**

Automated by `typescript/tests/browser/mockup.spec.ts`: a page with one invalid and one valid mockup shows the error box in the first, renders the second, and fires one `mockitdown-diagnostics` event.

**Realizes.** F-17

| | Statement |
|---|---|
| C1 | Loading the package entry `dist/mockitdown.js` MUST define the custom element `mockitdown-mockup`, and every custom element of the package MUST have a tag beginning with `mockitdown-`. |
| C2 | The mockup element MUST take its code from its first child `<script type="text/mockitdown">`, with the common leading indentation of its lines removed; other children MUST be ignored. |
| C3 | The mockup element MUST accept the fence attributes of R-MDX-003 as HTML attributes with the same names and meanings (`pack`, `device`, `appearance`, `chrome`, `title`, `id`, `url`, `width`, `height`, `caption`, `elements`, `source`), plus `import-base` and `asset-base` (URLs, default: the document's base URL). |
| C4 | The mockup element MUST render into an open shadow root holding the stylesheet for the packs used and the rendered HTML. |
| C5 | The mockup element MUST re-render when an observed attribute changes or the script's text changes. |
| C6 | When rendering produces diagnostics, the mockup element MUST show them as the Python variant's error box does and MUST dispatch a `mockitdown-diagnostics` event whose `detail` lists them. |
| C7 | An error in one mockup element MUST NOT stop other mockup elements on the page from rendering. |
| C8 | The mockup element MUST expose the properties `code` (get and set the code), `diagnostics` (the last render's diagnostics) and `rendered` (a promise that resolves after the next render). |
| C9 | If the script child contains `</script`, the page cannot carry it; the element's documentation MUST say so and SHOULD suggest setting `code` by script. |
| V1 | The browser tests mount mockup elements with code containing `<`, `>` and `&`, change attributes and code, and compare the shadow root's HTML with the conformance output. |
