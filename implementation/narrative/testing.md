---
title: Testing
impl_version: 0.3.7
status: draft
updated: 2026-11-25
page_id: IMPL.TEST
---

# Testing

Python tests use the standard library's `unittest` (no test dependency). Run them from `python/`, with
the virtual environment at the repository root:

```sh
cd python
../.venv/bin/python -m unittest discover -s tests -t .
ZENSICAL=$PWD/../.venv/bin/zensical ../.venv/bin/python -m unittest discover -s tests -t .   # with IT-5
```

The TypeScript tests use `node:test` (ADR-20) and run against `dist/` (Node 22+):

```sh
cd typescript
npm install && npx playwright install chromium   # once
npm test      # build, compile tests/ to test-build/, node --test test-build/unit/, Playwright (Chromium)
```

The browser tests (`tests/browser/*.spec.mjs`) start the development server themselves; see
[Web development](architecture/web-dev.md).

`tests/types/node-shim.d.ts` declares the few Node APIs the tests use (ADR-20 allows no `@types/node`).
Module paths below are relative to `python/` for IT-1 … IT-8. `tests/helpers.py` puts `src/` on `sys.path` and provides `html(src, **options)` (asserts no
errors) and `diags(src, **options)`.

## Test catalogue

| ID | Module | Covers | Requirements (test cases) |
|---|---|---|---|
| IT-1 | `tests/test_syntax.py` | lexing and parsing: top-level forms, modifier chains across lines, trailing and labelled closures, closure parameters and interpolation, if/else and ranges, `#Preview`, comments and `;`, located errors | R-LANG-001.TC-1, R-LANG-002.TC-1, R-LANG-003.TC-1, R-LANG-005.TC-1, R-LANG-007.TC-1, R-LANG-009.TC-1 |
| IT-2 | `tests/test_render.py` | evaluation and rendering: struct components with slots and defaults, `ForEach` with tuples, if/ternary, modifiers to style and data, navigation and toolbar, `TabView`, alerts, unknown elements and modifiers, syntax error block, options and `@Screen`, Elements table, imports and assets, escaping, stylesheet scaling and scoping | R-LANG-004.TC-1, R-EVAL-003.TC-1, R-EVAL-005.TC-1, R-EVAL-006.TC-1, R-EVAL-007.TC-1, R-EVAL-009.TC-1, R-EVAL-010.TC-1, R-REND-004.TC-1, R-REND-005.TC-1, R-REND-009.TC-1, R-REND-010.TC-1, R-DEV-004.TC-1, R-ASSET-003.TC-1, R-IMP-005.TC-1, R-DIAG-005.TC-1 |
| IT-3 | `tests/test_packs.py` | the pack contract for every pack (built-in and future): roles, scoped CSS, no appearance branching, light/dark tokens, unique modules, every element renders, full stylesheet | R-PACK-004.TC-1, R-PACK-005.TC-1, R-PACK-006.TC-1, R-PACK-007.TC-1 |
| IT-4 | `tests/test_examples.py` `ExampleSiteTests` | end to end through Python-Markdown: every page of `examples/site/docs` converts with **no** mockitdown error or warning, renders one figure per fence, and carries the `<style data-mockitdown>` element | F-14, R-MDX-001, R-MDX-004 |
| IT-5 | `tests/test_examples.py` `ZensicalBuildTests` | builds the example site with `zensical build --clean` (skipped when Zensical is not installed; set `ZENSICAL` to its path) | F-14.AC2, R-MDX-001.C3 |
| IT-6 | `tests/test_layout.py` | repository layout from `git ls-files`: only the variant folders and cross-variant files at the root, no `pack.json`/`pack.css` outside `shared/packs`, root README links `python/README.md` (skipped outside a git checkout) | R-REPO-001.TC-1, R-REPO-002.TC-2, R-REPO-001.C5 |
| IT-7 | `tests/test_shared.py` | the package copy of `shared/` is identical (and a stale copy is detected); a wheel built with `pip wheel` holds every pack file, `page.css`, `icons.json`, `vocabulary.json` and the `LICENSE`; `shared/reference/` has a well-formed file per listed pack | R-REPO-002.TC-1, R-REPO-003.TC-1, R-REPO-003.TC-3 |
| IT-8 | `tests/test_conformance.py` | the conformance corpus (see [Conformance corpus](conformance.md)): every case renders to its expected HTML and `.diag.json`; `gen_conformance.py --check` passes and fails on a changed expected file; coverage of every base role, every pack, light/dark and every device; option keys and types | R-REPO-004.TC-1, R-REPO-004.TC-2, R-REPO-004.TC-3 |
| IT-9 | `typescript/tests/unit/{values,syntax,evaluate,packs,package,core}.test.ts` | the TypeScript core (`node:test`, against `dist/`): Python value semantics (float repr, `%g`, string repr, dict keys, JSON ints/floats), lexing and parsing with code-point columns and Python-worded errors, evaluation (arithmetic, collections, structs, `ForEach`, pack selection, diagnostics), imports through `registerComponents` and `import_resolver`, an application pack extending `mui` selected by module and styled, the package manifest and `dist/shared/`, no DOM/network/file access in `src/core/` | R-WEB-001.TC-2, R-WEB-001.TC-3, A-WEB-1.K1 |
| IT-10 | `typescript/tests/unit/conformance.test.ts` | the conformance corpus in TypeScript: every case parses (or fails with its syntax error), its evaluation reproduces the pack lineage and the evaluation-stage diagnostics, and `render` returns exactly `<name>.html` and all of `<name>.diag.json` — 572 cases, none todo | R-WEB-001.TC-1, R-REPO-004.C5, R-REPO-004.C7 |
| IT-11 | `typescript/tests/unit/render.test.ts` | the TypeScript render API: `RenderResult` (html, diagnostics, packs, screen), the error box, `show_warnings`, `source`, `check`; images by `asset_base`, not found without one, remote and `data:image` passed through; `stylesheet` with ancestors once; the anchor prefix's SHA-1 (test vectors and a non-ASCII source); icon name resolution; Python `%.Nf`, `%g` and `round` ties to even | R-WEB-001.TC-4, R-ANN-003.C5 |
| IT-12 | `typescript/tests/unit/serve.test.ts` | the development server on a free port: the index links every page of `pages/`, pages/modules/pack CSS/JSON/`.mockitdown` with their content types, 404 for paths outside the served folders (`/../package.json`, encoded `..`, backslash, NUL), 405 for other methods; `loadAssetsFromUrl` over HTTP (one load per base, a failed load rejected with URL and status, then retried) | R-WEB-003.TC-1, A-WEB-2.K2 |
| IT-13 | `typescript/tests/browser/core.spec.mjs` (Playwright, Chromium) | the index links `pages/core.html`; the page loads `dist/shared/` like a browser host, renders a SwiftUI mockup styled by its pack stylesheet with icons, no failed request, page error or diagnostic; a syntax error is reported and a fix renders in MUI | R-WEB-005.TC-1 |
| IT-14 | `typescript/tests/browser/mockup.spec.mjs` (Playwright, Chromium), `typescript/tests/unit/elements.test.ts` | the `mockitdown-mockup` element on `pages/mockup.html`: defined by the entry, tags `mockitdown-`; a script child with `<`, `>`, `&` renders verbatim and its shadow HTML equals the Python output (fixture) and `render()`; five conformance cases (incl. an import from `import-base`) equal `<name>.html`; re-render on `pack`, script text and `code` (also creating the script child), `rendered` after each; one invalid + one valid element: two error boxes (render + fence) in the first, one composed event, the second renders; a throwing listener does not stop another element; empty boolean attributes, ignored foreign attributes; `asset-base`; a failed asset load gives each element an `element` error; the demo page renders. Unit: `scriptCode` dedent rules, `shadowCss` rewrites, the entry imports in Node | R-WEB-002.TC-1, R-WEB-002.TC-2, R-WEB-002.TC-3, A-WEB-2.K3, A-WEB-2.K5 |

## The example site as fixture

`python/examples/site/` is both the demo and the end-to-end test (F-14): one page per pack, a language
tour, a custom-components page with an imported library (`docs/mockups/shared/kpi.mockitdown`) and
images under `docs/assets/images/`. Its `mkdocs.yml` sets `strict: true`, so a broken example also
fails the site build. When adding a pack or a feature, add an example to the relevant page: the
test suite then covers it without new test code.

## Gaps

- No visual regression: the fidelity of pack CSS is reviewed by eye on the example site.
- Several requirements are verified only through the example site (determinism R-REND-007, safety
  R-REND-006, icon resolution R-ASSET-005, CLI behaviour R-CLI); dedicated unit tests would make
  their test cases explicit.
- `ZensicalBuildTests` builds the example site with a cleared `.cache` and asserts that the built
  tour page has a clean title, exactly one mockitdown `<style>` and frame-unit rules;
  `CssInjectionTests` reproduces Zensical's extra `convert()` calls without a build.


## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-24 | Page written |
| 0.1.1 | 2026-11-24 | ZensicalBuildTests and CssInjectionTests now cover CSS delivery |
| 0.3.2 | 2026-11-25 | Run from python/; IT-6 layout and IT-7 shared-asset tests (#1) |
| 0.3.3 | 2026-11-25 | IT-8 conformance corpus (#2) |
| 0.3.4 | 2026-11-25 | IT-9 TypeScript unit tests, IT-10 TypeScript conformance harness (#3) |
| 0.3.5 | 2026-11-25 | IT-10 compares every rendered case; IT-11 TypeScript render API (#4) |
| 0.3.6 | 2026-11-25 | IT-12 development server and asset loader, IT-13 Playwright smoke test; CI (#5) |
| 0.3.7 | 2026-11-25 | IT-14 the mockup element (#6) |
