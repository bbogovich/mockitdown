---
title: Testing
impl_version: 0.3.13
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
| IT-10 | `typescript/tests/unit/conformance.test.ts` | the conformance corpus in TypeScript: every case parses (or fails with its syntax error), its evaluation reproduces the pack lineage and the evaluation-stage diagnostics, and `render` returns exactly `<name>.html` and all of `<name>.diag.json` (`chart` is a render-stage code, like `icon` and `asset`) — 585 cases, none todo | R-WEB-001.TC-1, R-REPO-004.C5, R-REPO-004.C7 |
| IT-11 | `typescript/tests/unit/render.test.ts` | the TypeScript render API: `RenderResult` (html, diagnostics, packs, screen), the error box, `show_warnings`, `source`, `check`; images by `asset_base`, not found without one, remote and `data:image` passed through; `stylesheet` with ancestors once; the anchor prefix's SHA-1 (test vectors and a non-ASCII source); icon name resolution; Python `%.Nf`, `%g` and `round` ties to even | R-WEB-001.TC-4, R-ANN-003.C5 |
| IT-12 | `typescript/tests/unit/serve.test.ts` | the development server on a free port: the index links every page of `pages/`, pages/modules/pack CSS/JSON/`.mockitdown` with their content types, 404 for paths outside the served folders (`/../package.json`, encoded `..`, backslash, NUL), 405 for other methods; `loadAssetsFromUrl` over HTTP (one load per base, a failed load rejected with URL and status, then retried) | R-WEB-003.TC-1, A-WEB-2.K2 |
| IT-13 | `typescript/tests/browser/core.spec.mjs` (Playwright, Chromium) | the index links `pages/core.html`; the page loads `dist/shared/` like a browser host, renders a SwiftUI mockup styled by its pack stylesheet with icons, no failed request, page error or diagnostic; a syntax error is reported and a fix renders in MUI | R-WEB-005.TC-1 |
| IT-14 | `typescript/tests/browser/mockup.spec.mjs` (Playwright, Chromium), `typescript/tests/unit/elements.test.ts` | the `mockitdown-mockup` element on `pages/mockup.html`: defined by the entry, tags `mockitdown-`; a script child with `<`, `>`, `&` renders verbatim and its shadow HTML equals the Python output (fixture) and `render()`; five conformance cases (incl. an import from `import-base`) equal `<name>.html`; re-render on `pack`, script text and `code` (also creating the script child), `rendered` after each; one invalid + one valid element: two error boxes (render + fence) in the first, one composed event, the second renders; a throwing listener does not stop another element; empty boolean attributes, ignored foreign attributes; `asset-base`; a failed asset load gives each element an `element` error; the demo page renders. Unit: `scriptCode` dedent rules, `shadowCss` rewrites, the entry imports in Node | R-WEB-002.TC-1, R-WEB-002.TC-2, R-WEB-002.TC-3, A-WEB-2.K3, A-WEB-2.K5 |
| IT-15 | `typescript/tests/browser/gallery.spec.mjs` (Playwright, Chromium), `typescript/tests/unit/patterns.test.ts`, `python/tests/test_patterns.py` | the pack gallery `pages/packs.html`: the side panel equals `shared/reference/index.json` (groups, order); every pack (four parallel chunks) through `packGallery.select` + `renderAll()`: the element names of `<pack>.json` in order, one mockup per sample and variants sample plus one per pattern, none empty or zero-sized, no error diagnostic, no page error; an element card's name, role, arguments, defaults, variants, doc and two mockups; `#pack=carbon` deep link, `#pack=mui` on click, reload, Back; dark appearance on every mockup; the name filter and its count; the menu under 720 px; a missing or unknown fragment selects the first pack. Unit (both variants): the six required patterns are listed and each renders in every shipped pack (light and dark in TypeScript) with no error and a figure; in `base` with no diagnostic at all | R-WEB-004.TC-1, R-WEB-004.TC-2, R-WEB-004.TC-3 |
| IT-16 | `typescript/tests/browser/gallery.spec.mjs` + `geometry.mjs` (Playwright, Chromium), `python/tests/test_fit.py`, `typescript/tests/unit/render.test.ts` | geometry of every pack's element samples and variants after `renderAll()` (four chunks): fit frames as wide as their content, wide cards scrolling, no intersecting row children (a negative leading margin exempt), presentation surfaces ≥ 200 × 80 inside the frame, toasts holding their text, sheets ≥ 240 tall with grabber and 48 points of backdrop, tooltips unclipped with the arrow towards the anchor; the rows again in a 320-point phone frame; Alert, Dialog, Sheet, Popover, Toast, Tooltip, ConfirmationDialog (and a content-less Tooltip) alone at fit in every pack; eight captioned toggles in a 300 px host; a 40-word and a one-word `MessageBubble` inside its bubble, ≤ 75 % of its container. Python and TypeScript unit: the presenting elements render their layer, the tooltip anchor, placeholder and arrow; a positional argument takes its parameter's alias | R-WEB-004.TC-4, R-DEV-008.TC-1, R-DEV-008.TC-2, R-REND-013.TC-1, R-REND-013.TC-2, R-PACK-011.TC-1 |
| IT-17 | `python/tests/test_shapes_charts.py`, `typescript/tests/unit/render.test.ts`, `typescript/tests/browser/gallery.spec.mjs` + `geometry.mjs` (`inspectShapes`) | shapes: in every shipped pack a `Circle`, a stroked `Circle`, an `Ellipse`, a `Capsule` and a `RoundedRectangle(cornerRadius: 12)` in a 160 × 96 frame keep the frame, the circle's `::before` is 96 × 96 with 50 % radius and centred, the frame unpainted, the ellipse 50 % radii, the capsule radius ≥ half the shorter side; a frameless circle in a 200 × 80 row is 80 × 80. Unit (both variants): the circle keeps its frame, stroke and shadow go to `--mkd-shape-stroke` and `drop-shadow`, `.background(_, in: Ellipse())` is 50 %. Charts: every kind of R-REND-012.C1 draws a mark from `values: [3, 5, 2, 6, 4]` without a `chart` warning; five scatter dots, bubble radii in a 2 : 1 ratio for 4 : 1, one heatmap row, four candles; every kind but the gauge without data warns `chart` and draws axes or an outline | R-REND-014.TC-1, R-REND-012.TC-3 |
| IT-18 | `python/tests/test_samples.py`, `typescript/tests/browser/gallery.spec.mjs` | declared element samples: the registry reads `sample`; `gen_reference.sample` returns a declared sample verbatim and raises `SampleError` naming pack and element for one with a diagnostic; the variants sample is the declared sample with `.variant("…")` in an `HStack(alignment: .top, spacing: 24)`, and a declared sample of an element with variants that is not a call of it fails; `swiftui` declares samples for the elements of R-PACK-014/015 and its `Picker` shows three options; in every pack's reference JSON pickers, radio groups, segmented controls, tabs, date pickers and charts carry content; the `base` samples: `points:` for scatter, bubble, candlestick, a labelled `matrix:` heatmap, `labels:` for categorical charts, every chart drawing a mark with no diagnostic, Alert/Dialog/Sheet with title, message and actions, Toast with description and action, Picker with three options and a selection, Tab inside a `TabView`, NavigationSplitView with a sidebar `List` and `detail:`, Tooltip with an anchor `Button`, a 15-word MessageBubble, DatePicker with a selection; variants samples side by side in every pack. Browser: every `base` chart card draws at least one mark | R-PACK-013.TC-1, R-PACK-013.TC-2 |
| IT-19 | `python/tests/test_swiftui_controls.py`, the `control-*` conformance cases (both variants), `typescript/tests/browser/gallery.spec.mjs` + `geometry.mjs` | SwiftUI control styles from the declared samples at `fit`: ControlGroup `.automatic` default with three buttons, icon buttons for `.navigation`/`.palette`, one menu button (ellipsis, chevron for `.menu`, a label when given); DatePicker default Nov 23, 2026 / 9:41 AM, date and time capsules, `.date` and `.hourAndMinute` components, graphical 7 weekdays and one selected day, wheel columns (4 for date and time, 3 for a date) with band, `11/23/2026` field and stepper; Form sections and the columns title (`aria-label`); Gauge `.automatic` linear with bounds and value, open and closed rings, the accessoryLinear marker, capacity fills; List variants with two sections and the selection marked; Picker label, value and up-down chevron, the first option by default, tagged options, three segments, inline and radio rows, wheel with band, navigation link, palette, no-options fallback in every style; Toggle switch, button and checkbox; glass buttons. The gallery geometry (IT-16) covers the overlaps | R-PACK-014.TC-1 |
| IT-20 | `python/tests/test_swiftui_presentations.py`, the `present-*` conformance cases (both variants), `typescript/tests/browser/gallery.spec.mjs` | SwiftUI presentations and navigation from the declared samples at `fit`: Alert title, message and role actions, Button children as actions (and `actions:` winning), three actions stacked and two side by side (browser), 34-point corners; ConfirmationDialog rows with the cancel action below them, alert-style with iPadOS chrome; Popover placeholder anchor above the bubble and the arrow between them, `.popover` arrow; Sheet grabber, title and content; a lone Tab as one selected item in a bottom bar; TabView variants with the content above the bar at `fit`, page dots below the content, `.sidebarAdaptable` as a column beside the content on a tablet; NavigationSplitView columns from closures and from unlabelled children, column titles from `.navigationTitle`, a `NavigationStack` column keeping its bar, at least 640 × 360 at `fit` with the Mail title beside the detail, `.prominentDetail` detail as wide as the split view | R-PACK-015.TC-1, R-PACK-015.TC-2 |

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
| 0.3.8 | 2026-11-25 | IT-15 the pack gallery and the design patterns (#7) |
| 0.3.9 | 2026-11-25 | IT-16 geometry of fit frames, presentations, rows and bubbles (#8) |
| 0.3.10 | 2026-11-25 | IT-17 shape framing and charts drawn from values (#9) |
| 0.3.11 | 2026-11-25 | IT-18 declared element samples (#10) |
| 0.3.12 | 2026-11-25 | IT-19 SwiftUI control styles (#11) |
| 0.3.13 | 2026-11-25 | IT-20 SwiftUI presentations and navigation (#12) |
