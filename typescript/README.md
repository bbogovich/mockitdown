# mockitdown — TypeScript

The web variant of [mockitdown](../README.md): UI mockups written in SwiftUI syntax, rendered as HTML
styled after real UI frameworks, in the browser and in Node. It shares the language, the packs and the
page stylesheet with the [Python variant](../python/README.md) through the repository's `shared/`
folder, and it is held to the Python output by the conformance corpus in `shared/conformance/`.

**Status:** in progress. The core is ported — language, evaluation, packs, diagnostics, options,
stylesheet and the HTML renderer (`render`, `check`), byte-identical to Python on every conformance
case; the `mockitdown-` web components follow.

## Package

- NPM package `mockitdown`, MIT, ES modules, **no runtime dependencies**. Development dependencies:
  `typescript` and `@playwright/test` only (ADR-20).
- `dist/mockitdown.js` — the package entry (the core today; it will define the custom elements).
- `dist/node.js` (`mockitdown/node`) — the core plus a loader that reads the shared assets from disk.
- `dist/shared/` — the packs (`packs/<id>/pack.json`, `pack.css`), `page.css`, `icons.json`,
  `vocabulary.json` and `manifest.json` (the pack ids and files, for loaders), copied from `shared/` at
  build time.

The core (`src/core/`) touches no DOM, network or file system: the shared assets reach it as data,
once, through `loadAssets`.

```js
import { loadSharedAssets, render, check, registerComponents, stylesheet } from "mockitdown/node";

loadSharedAssets();                                   // the built-in packs from dist/shared/
registerComponents("components/pill.mockitdown", pillSource);
const result = render('import "components/pill"\nStatusPill(text: "Online")', { device: "phone" });
result.html;                                          // the figure (error box first if there are errors)
result.diagnostics;                                   // Diagnostic[] (also: check(source, options))
const css = stylesheet(result.packs);                 // CSS for the pack lineage, page.css included
```

In a browser, `loadAssetsFromUrl(base)` (from the package entry) fetches `manifest.json` and the files
it lists from `base` — by default the package's own `dist/shared/` — and passes them to `loadAssets`
once (the custom elements will do this for you):

```js
import { loadAssetsFromUrl, render, stylesheet } from "./dist/mockitdown.js";

await loadAssetsFromUrl();                            // or loadAssetsFromUrl("/assets/mockitdown/")
const { html, packs } = render(source, {});
```

Options use the Python `RenderOptions` field names (`pack`, `default_pack`, `device`, `appearance`,
`width`, `height`, `chrome`, `title`, `id`, `caption`, `elements`, `source`, `window`, `windowed`, `menubar`, `app`, `url`,
`import_paths`, `source_path`, `show_warnings`), plus `import_resolver`, a function returning a
component file's text for a candidate path, and `asset_base`, the URL local image paths resolve
against (images are never embedded; without it a local path is reported as not found).

## Development

Node 22 or later.

```bash
cd typescript
npm install
npm run build        # tsc → dist/ (ES modules + .d.ts), then scripts/copy-shared.mjs → dist/shared/
npm run serve        # build, then serve the test pages on http://127.0.0.1:8173/ (PORT=… to change)
npx playwright install chromium                     # once: the test browser
npm test             # build, compile tests/ → test-build/, node --test, then Playwright (Chromium)
npx playwright test --project=firefox               # or webkit, after `npx playwright install firefox`
```

`scripts/serve.mjs` is a static server on `node:http`: `/` lists every page in `pages/`, and
`/pages/`, `/dist/` and `/shared/` serve `typescript/pages/`, `typescript/dist/` and the repository's
`shared/`; anything else is 404. The browser tests (`tests/browser/*.spec.mjs`) start it themselves.

Test pages: `pages/core.html` (the core API), `pages/mockup.html` (the `mockitdown-mockup` element) and
`pages/packs.html`, the pack gallery — every pack of `shared/reference/index.json` in a side panel, the
selected pack's elements (`shared/reference/<pack>.json`) and the design patterns of `shared/patterns/`
rendered in it, with `#pack=<id>` deep links, light/dark appearance and an element-name filter. Mockups
are created as they scroll into view; `window.packGallery.renderAll()` renders a whole pack at once.

`node scripts/copy-shared.mjs --check` reports a stale `dist/shared/`. The unit tests (`tests/unit/`,
`node:test`) run against `dist/`; `conformance.test.ts` walks every case of `shared/conformance/`.

Licence: MIT.
