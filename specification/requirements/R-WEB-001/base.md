---
id: R-WEB-001
title: TypeScript package and core
status: active
version: 0.6.0
rev: 0
page: WEB.1
slot: reqs
order: 1
hash: ab66ec60e889
source: [SRC-8]
realizes: [F-16, F-17]
requires: [R-REPO-004]
constrained_by: [ADR-18, ADR-20]
---

C1: `typescript/` MUST be an NPM package named `mockitdown`, licensed MIT, of type `module`, with no runtime dependencies and only the development dependencies of ADR-20.
C2: `npm run build` MUST compile the TypeScript with `tsc` into `dist/` as ES modules with type declarations, and copy the shared assets the package publishes into `dist/shared/`.
C3: The package MUST export `render`, `check` and `stylesheet` with the semantics of the Python library API (R-API-001, R-API-002), taking a source string and render options and returning HTML strings and diagnostics.
C4: The TypeScript core MUST accept the same language, pack selection by `import <Module>` and by option, options and diagnostics as the Python variant.
C5: Packs MUST be registered from data: the built-in packs from the package's shared assets, an application's own packs by `registerPack(json, css)`; packs MUST extend one another as in the Python variant.
C6: `import "path"` of components MUST resolve against components registered by `registerComponents(name, source)` and, in the custom elements, against URLs relative to an import base URL, trying the name as written and then with `.mockitdown`.
C7: Image references MUST follow R-ASSET-001; local paths MUST resolve against an asset base URL, and no asset is embedded.
C8: For every case of the conformance corpus (R-REPO-004), `render` MUST return exactly the expected HTML.
C9: The TypeScript core MUST run in current Chromium, Firefox and WebKit browsers and in Node 22 or later.
V1: `node --test` runs the conformance cases against `dist/` and fails on any difference.
<!-- file: TC-1.md -->
---
id: TC-1
title: Conformance corpus in TypeScript
verifies: [C8]
---

Automated by `typescript/tests/unit/conformance.test.ts` (node:test).
<!-- file: TC-2.md -->
---
id: TC-2
title: No runtime dependencies
verifies: [C1]
---

Automated by `typescript/tests/unit/package.test.ts`: `package.json` has no `dependencies` and exactly the `devDependencies` of ADR-20.
<!-- file: TC-3.md -->
---
id: TC-3
title: Application pack
verifies: [C5]
---

Automated by `typescript/tests/unit/packs.test.ts`: a pack registered with `registerPack` that extends `mui` is selected by its module name and its tokens appear in `stylesheet`.
<!-- file: prose.md -->
The library side of the web variant. Embedding assets as data URIs, the command line and the Markdown extension stay Python-only.
