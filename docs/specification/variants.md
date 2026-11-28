---
title: "Variants, repository layout and shared assets"
spec_version: 0.6.0
status: draft
updated: 2026-11-25
page_id: REPO.1
---

# Variants, repository layout and shared assets

mockitdown ships two variants from one repository (F-16, ADR-17): the Python library (`python/`) and
the TypeScript web components (`typescript/`). Everything both publish — the packs, the page
stylesheet, the icon glyphs, images, the reference samples and patterns, and the conformance corpus —
lives once in `shared/`.

```text
mockitdown/
├── python/        pyproject.toml, src/mockitdown/, tests/, examples/site/, tools/
├── typescript/    package.json, tsconfig.json, src/, tests/, pages/, scripts/
├── shared/        packs/<id>/pack.{json,css}, css/page.css, icons/icons.json, images/,
│                  patterns/*.mockitdown, reference/<pack>.json, conformance/
├── .github/workflows/
└── README.md · LICENSE · CLAUDE.md · HANDOFF.md
```

### R-REPO-001 — Repository layout

The layout shown on this page. Moving files keeps their history (`git mv`).

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at 0.11.0.** Its cited items ADR-17 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against ADR-17 (changed at 0.12.4: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).

**R-REPO-001.TC-1 — Root holds only the variant folders and cross-variant files**

Automated by `python/tests/test_layout.py`: the root contains exactly the entries of C1 and C4 (plus ignored files).

**Realizes.** F-16

| | Statement |
|---|---|
| C1 | The repository MUST have the top-level folders `python/` (the Python variant), `typescript/` (the TypeScript variant) and `shared/` (A-REPO-1). |
| C2 | `python/` MUST hold the Python package's `pyproject.toml`, `src/mockitdown/`, `tests/`, `tools/` and the example site `examples/site/`. |
| C3 | `typescript/` MUST hold the NPM package's `package.json`, `tsconfig.json`, `src/`, `tests/`, `pages/` and `scripts/`. |
| C4 | The repository root MUST keep only cross-variant files: `README.md`, `LICENSE`, `CLAUDE.md`, `HANDOFF.md`, `.github/`, `.specitout/`, `.claude/` and `.gitignore`. |
| C5 | The root `README.md` MUST describe both variants and link to each variant's own `README.md`. |
| C6 | `CLAUDE.md` MUST give the build and test commands of both variants, and its release procedure MUST use the new paths. |
| V1 | A test lists the repository root and fails on any entry not named in C4 or C1. |

---

### R-REPO-002 — Shared assets are the single source

**Requires:** R-REPO-001

What moved to `shared/`: the 38 packs, `page.css`, the icon table formerly written in `icons.py`, and the modifier lists and neutral import names formerly written in `vocabulary.py`. Their content did not change; the Python modules now load the JSON copies packaged beside them.

The Python build copies the files with `python/tools/sync_shared.py`, run by `python/setup.py` at every build from a checkout; the copies are ignored by git and travel in the sdist.

The role rule table joins the vocabulary as shared language data (R-PACK-016). Both packages carry it,
and the copy tests of C6 cover it; only the TypeScript design tools read it for now.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.
**Stylesheet partials (SRC-18#health).** A pack stylesheet may include shared partials
(R-PACK-018); the partials live in `shared/packs/_partials/` and reach the packages only inside the
resolved `pack.css` copies, so the copy check compares a copy with its resolution rather than with the
file in `shared/`.

Re-checked against ADR-17 after the stylesheet partials were built (#54): a `pack.css` copy that includes partials is compared with its resolved text, as C6 says; no obligation changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-REPO-002.TC-1 — Python package copy matches shared**

Automated by `python/tests/test_shared.py`: every file under `shared/packs` (except `_partials/`), `shared/css`, `shared/icons` and `shared/language` has a copy in the installed package, identical except for a `pack.css` that includes partials, whose copy equals its resolution (R-PACK-018.TC-1); `typescript/scripts/copy-shared.mjs --check`, run by `npm test`, checks `dist/shared/` the same way.

**R-REPO-002.TC-2 — No pack outside shared**

Automated by `python/tests/test_layout.py`: no `pack.json` or `pack.css` exists outside `shared/packs` and the build outputs.

**R-REPO-002.TC-3 — Role rule table shared and copied**

`python/tests/test_shared.py` (the copy test of TC-1 covers `shared/language/`, which then holds
`roles.json`) and `typescript/scripts/copy-shared.mjs --check`, run by `npm test`: `shared/language/roles.json`
exists once, in `shared/`, and each package holds an identical copy beside `vocabulary.json`; no other
`roles.json` exists outside `shared/language/` and the build outputs.

**R-REPO-002.TC-4 — Shared files in place, copied as data**

Automated, in the files named (steps 1, 2, 3 and 5 written with R-PACK-018, #54).

1. `python/tests/test_layout.py` (`test_no_pack_outside_shared`, `test_icon_and_vocabulary_files_hold_their_tables`):
   no `pack.json`, `pack.css`, `page.css`, `icons.json` or `vocabulary.json` exists outside `shared/`, the
   build outputs and the R-PACK-018 test fixture `python/tests/fixtures/` (C1, C2, C3, C4); `icons.json`
   holds `glyphs` and `aliases` objects and `vocabulary.json` the lists `rendered`, `ignored` and
   `neutral_modules` (C3, C4).
2. `python/tests/test_shared.py::test_wheel_contains_the_shared_assets` and the TypeScript
   `package.test.ts` manifest test: each package holds its copies, and neither variant's source opens a
   path under `shared/` at run time — `test_layout.py::test_no_run_time_access_to_shared` finds no string
   naming `shared` in `python/src/mockitdown/` outside docstrings, and in `typescript/src/` no `shared/`
   outside comments except a `new URL("…shared/", import.meta.url)` that resolves, from the compiled
   module, to the package's own `dist/shared/` (C5).
3. Both builds only copy and parse the files: the Python sync and `copy-shared.mjs` read them as text
   or JSON, and no shared file is imported, evaluated or executed —
   `test_layout.py::test_builds_and_loaders_execute_nothing_shared` finds no call of `eval`, `exec`,
   `Function`, `import(`, `__import__`, `run_path` or `import_module` in both build scripts and the
   loaders of both variants (C7).
4. `python/tests/test_shared.py::test_stale_copy_is_detected`: changing one copied file makes the copy
   check fail (C6, with TC-1).
5. A `.css` file under `shared/packs/` is either `<id>/pack.css` of a directory holding `pack.json` or
   `_partials/<name>.css`; any other fails `test_layout.py::test_shared_css_is_a_pack_stylesheet_or_a_partial` (C1).

**Realizes.** F-16

| | Statement |
|---|---|
| C1 | The built-in packs MUST exist only as `shared/packs/<id>/pack.json`, `shared/packs/<id>/pack.css` and the stylesheet partials `shared/packs/_partials/<name>.css` they include (R-PACK-018). |
| C2 | The page stylesheet MUST exist only as `shared/css/page.css`. |
| C3 | The icon glyphs and icon aliases MUST exist only as `shared/icons/icons.json`, an object with `glyphs` (name → SVG inner markup) and `aliases` (name → glyph name). |
| C4 | The modifier vocabulary (rendered and ignored modifiers) MUST exist only as `shared/language/vocabulary.json`, with `rendered`, `ignored` and `neutral_modules` name lists, `neutral_modules` being the import names that select no pack. |
| C5 | Each variant's build MUST copy the shared files it publishes into its own package; neither package MAY read `shared/` at run time. |
| C6 | A test in each variant MUST fail when its package copy differs, after a build, from what the build writes from `shared/`: an identical copy of every file, except a `pack.css` that includes partials, whose copy is resolved as R-PACK-018.C4 says. |
| C7 | Both variants MUST read the shared files as data and MUST NOT execute anything from them. |
| V1 | After the move, the Python icon, vocabulary and pack modules load their data from the packaged copies and the existing test suite passes unchanged. |
| C8 | The role rule table (R-PACK-016) MUST exist only as `shared/language/roles.json`, and each variant's build MUST copy it into its package beside `vocabulary.json`. |

---

### R-REPO-003 — The Python variant after the move

**Requires:** R-REPO-002

The Python variant behaves exactly as before; only paths change. A wheel built after the move holds the same files as the 0.3.0 wheel, plus `icons.json` and `vocabulary.json`, which `icons.py` and `vocabulary.py` now load.

The reference JSON carries the same data as the Reference page of a pack, so the TypeScript pack gallery (R-WEB-004) and the example site show the same samples. `index.json` gives the gallery its side-panel groups (Core, Wireframe, Desktop, Web, Mobile, Retro). The repository's `LICENSE` stays at the root (R-REPO-001.C4) and is copied beside `pyproject.toml` at build time.

Checked at 0.10.1 after R-REPO-002.C8 (`shared/language/roles.json`): the file is a shared asset the wheel and sdist carry through C2, copied by the same build step as `vocabulary.json`; the other clauses are unaffected.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at 0.11.0.** Its cited items ADR-17, R-REPO-002 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.

Re-checked after R-REPO-002 was recorded as built (#54, partials resolved into the package copies, TC-4 tests named): no obligation of this requirement changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-REPO-003.TC-1 — Wheel contains the shared assets**

Automated by `python/tests/test_shared.py`: a wheel built from `python/` lists every pack's `pack.json` and `pack.css`, `page.css`, `icons.json`, `vocabulary.json` and the `LICENSE`.

**R-REPO-003.TC-2 — Existing suite passes after the move**

Automated: `python -m unittest discover -s tests -t .` from `python/` passes, including `ZensicalBuildTests`.

**R-REPO-003.TC-3 — Reference JSON for every listed pack**

Automated by `python/tests/test_shared.py` (`ReferenceJsonTests`): `index.json` lists the groups, and every pack it names has a `<pack>.json` with its id and elements carrying exactly the keys of C7; `python/tests/test_examples.py` runs `gen_reference.py --check`.

**Realizes.** F-16

| | Statement |
|---|---|
| C1 | The Python package built from `python/` MUST keep its PyPI name `mockitdown`, its import name, its public API, its command line and its Markdown extension and fence names. |
| C2 | The Python wheel and sdist MUST contain the shared assets the package needs (C5 of R-REPO-002). |
| C3 | `python -m pip install -e python[markdown]` MUST give a working development install, and the test suite MUST pass when run from `python/`. |
| C4 | The release workflow MUST build and publish the Python package from `python/`, and the Pages workflow MUST build the example site from `python/examples/site/`. |
| C5 | `tools/gen_reference.py` MUST keep generating the example site's Reference section and MUST also write `shared/reference/<pack>.json` (R-WEB-004). |
| C6 | Each `shared/reference/<pack>.json` MUST be an object with `id`, `name`, `framework`, `version`, `modules`, `device`, `chrome`, `group` (its Reference menu group) and `elements`, the elements in Reference page order (own elements, then inherited core elements, each by name). |
| C7 | Each element entry in `shared/reference/<pack>.json` MUST be an object with `name`, `role`, `params`, `defaults` (attribute → value), `variants`, `doc`, `own`, `sample` (a source that renders without a diagnostic) and `variants_sample` (a source showing each variant, or null). |
| C8 | `tools/gen_reference.py` MUST write `shared/reference/index.json` as `{"groups": [{"title", "packs": [id, …]}, …]}`, in the order of the Reference menu. |
| C9 | `tools/gen_reference.py --check` MUST fail when a Reference page or a `shared/reference/` file is missing or out of date. |
| C10 | The Python wheel and sdist MUST contain the repository's `LICENSE`. |
| V1 | The Python test suite, including the Zensical example-site build, passes from `python/`, and a wheel built from `python/` installs and renders a mockup in a fresh virtual environment. |

---

### R-REPO-004 — Conformance corpus

**Requires:** R-REPO-003

The corpus is the definition of "the same rendering" (ADR-18). It is regenerated deliberately, never to make a failing TypeScript test pass.

The cases are many and small, so a port can make them pass one area at a time. Areas, by name prefix:
`role-<role>-<element>` (every base element, from its Reference sample), `pack-<id>` (every shipped pack,
hidden ones included) and `pack-<id>-own-<n>` (each listed pack's own elements, twelve per case),
`appearance-`, `device-`, `chrome-`, `option-`, `import-`, `annotate-`, `overlay-`, `chart-`, `image-`,
`lang-` and `diag-`.

A case, for example `annotate-callout-label`:

```text
annotate-callout-label.mockitdown   // a callout with a label …
annotate-callout-label.json         {"device": "fit"}
annotate-callout-label.html         <div class="mkd-figure …">…</div>⏎
annotate-callout-label.diag.json    {"packs": ["base"], "diagnostics": []}
```

The harness is fixed so that nothing in the output depends on the machine: there is no source path
(diagnostics in the block read `line L:C`), images come from `data:` or remote URLs, and imports are
found through the one search path `.` — the corpus directory — so a missing import reports
`(searched .)`. A diagnostic inside an imported file would carry that file's resolved path, so the
corpus has none. Regenerate with `cd python && ../.venv/bin/python tools/gen_conformance.py`.

The corpus also holds edit-mode cases (`edit: true`, R-EDIT-004), generated by the Python renderer like
the others (ADR-22). The edit corpus beside it, `shared/conformance/edit/`, is data for the TypeScript
edit API (ADR-21) and is outside the render cases' rules.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-18, ADR-22, R-REPO-003 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against R-REPO-003 (changed at 0.12.4: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-REPO-004.TC-1 — Python matches the corpus**

Automated by `python/tests/test_conformance.py`.

**R-REPO-004.TC-2 — Corpus is current**

Automated: `python tools/gen_conformance.py --check` runs in the Python test suite.

**R-REPO-004.TC-3 — Corpus covers the required areas**

Automated by `test_coverage`, `test_layout` and `test_options_are_known` in `python/tests/test_conformance.py`.

**R-REPO-004.TC-4 — The edit corpus is no set of render cases**

Automated by `test_edit_corpus_is_ignored` in `python/tests/test_conformance.py`: `shared/conformance/edit/`
exists, none of its files is counted as a corpus file, and in a copy of the corpus with an extra file
under `edit/`, `gen_conformance.py --check` passes and the file is still there afterwards.

**Realizes.** F-16

| | Statement |
|---|---|
| C1 | `shared/conformance/` MUST hold conformance cases, each a mockitdown source `<name>.mockitdown` with its render options in `<name>.json` and its expected HTML in `<name>.html`. |
| C2 | The corpus MUST cover every render role of the base pack, every shipped pack at least once, light and dark appearance, each device form, imports of components, annotations and overlays, charts, images and diagnostics. |
| C3 | The expected HTML MUST be produced by the Python renderer, by `python/tools/gen_conformance.py`. |
| C4 | `gen_conformance.py --check` MUST fail when an expected file differs from what the Python renderer now produces. |
| C5 | Each variant's test suite MUST render every case and fail on any difference from the expected HTML. |
| C6 | Each `<name>.json` MUST be a JSON object holding only render options — `pack`, `default_pack`, `device`, `default_device`, `appearance`, `default_appearance`, `chrome`, `title`, `id`, `window`, `url` (strings), `width`, `height` (integers), `caption`, `elements`, `source`, `show_warnings`, `windowed`, `edit` (booleans) — with every absent key taking its default. |
| C7 | Each case MUST have `<name>.diag.json`, an object `{"packs": [id, …], "diagnostics": [{"severity", "code", "message", "line", "col", "source"}, …]}` holding the render's pack lineage and its diagnostics in order, and each variant's test suite MUST fail when its result differs from it. |
| C8 | `<name>.html` MUST be the rendered HTML followed by one line feed. |
| C9 | A case MUST be rendered with no source path, no asset or pack search paths and the single import search path `.` resolved against `shared/conformance/`; component files the cases import MUST lie under `shared/conformance/components/`. |
| C10 | An expected file MUST NOT contain a path of the machine that generated it; `gen_conformance.py` MUST refuse a case whose output does. |
| C11 | `shared/conformance/index.json` MUST list every case in generation order as `{"cases": [{"name", "area"}, …]}`, the area being the case name up to its first hyphen. |
| C12 | Each case source MUST begin with a `//` comment line saying what the case exercises. |
| C13 | Every case outside the `diag` area MUST render without a diagnostic, and every `diag` case MUST report at least one; `gen_conformance.py` MUST refuse a case that breaks this. |
| C14 | `gen_conformance.py --check` MUST also fail when a corpus file is missing or a file in `shared/conformance/` belongs to no case. |
| V1 | Changing one expected file makes both test suites fail. |
| C15 | `shared/conformance/edit/` holds the edit corpus (R-EDIT-002.C15), which is not a set of render cases: `gen_conformance.py` MUST ignore it, and C11 and C14 MUST NOT apply to its files. |
