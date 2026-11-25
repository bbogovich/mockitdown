# mockitdown — TypeScript

The web variant of [mockitdown](../README.md): UI mockups written in SwiftUI syntax, rendered as HTML
styled after real UI frameworks, in the browser and in Node. It shares the language, the packs and the
page stylesheet with the [Python variant](../python/README.md) through the repository's `shared/`
folder, and it is held to the Python output by the conformance corpus in `shared/conformance/`.

**Status:** in progress. The core's language, evaluation, packs, diagnostics, options and stylesheet are
ported; the HTML renderer (`render`, `check`) and the `mockitdown-` web components follow.

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
import { loadSharedAssets, evaluate, registerPack, registerComponents, stylesheet } from "mockitdown/node";

loadSharedAssets();                                   // the built-in packs from dist/shared/
registerComponents("components/pill.mockitdown", pillSource);
const { screen, diagnostics } = evaluate('import "components/pill"\nStatusPill(text: "Online")');
const css = stylesheet(screen.pack.lineage().map((p) => p.id));
```

In a browser, fetch `dist/shared/manifest.json` and the files it lists and pass them to `loadAssets`
(the custom elements will do this for you).

Options use the Python `RenderOptions` field names (`pack`, `default_pack`, `device`, `appearance`,
`width`, `height`, `chrome`, `title`, `id`, `caption`, `elements`, `source`, `window`, `url`,
`import_paths`, `source_path`, `show_warnings`), plus `import_resolver`, a function returning a
component file's text for a candidate path.

## Development

Node 22 or later.

```bash
cd typescript
npm install
npm run build        # tsc → dist/ (ES modules + .d.ts), then scripts/copy-shared.mjs → dist/shared/
npm test             # build, compile tests/ → test-build/, node --test
```

`node scripts/copy-shared.mjs --check` reports a stale `dist/shared/`. The unit tests (`tests/unit/`,
`node:test`) run against `dist/`; `conformance.test.ts` walks every case of `shared/conformance/`.

Licence: MIT.
