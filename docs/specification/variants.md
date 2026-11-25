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

What moves to `shared/`: the 38 packs, `page.css`, the icon table now written in `icons.py`, and the modifier lists now written in `vocabulary.py`. Their content does not change.

**R-REPO-002.TC-1 — Python package copy matches shared**

Automated by `python/tests/test_shared.py`: every file under `shared/packs`, `shared/css`, `shared/icons` and `shared/language` has an identical copy in the installed package.

**R-REPO-002.TC-2 — No pack outside shared**

Automated by `python/tests/test_layout.py`: no `pack.json` or `pack.css` exists outside `shared/packs` and the build outputs.

**Realizes.** F-16

| | Statement |
|---|---|
| C1 | The built-in packs MUST exist only as `shared/packs/<id>/pack.json` and `shared/packs/<id>/pack.css`. |
| C2 | The page stylesheet MUST exist only as `shared/css/page.css`. |
| C3 | The icon glyphs and icon aliases MUST exist only as `shared/icons/icons.json`, an object with `glyphs` (name → SVG inner markup) and `aliases` (name → glyph name). |
| C4 | The modifier vocabulary (rendered and ignored modifiers) MUST exist only as `shared/language/vocabulary.json`, with `rendered` and `ignored` name lists. |
| C5 | Each variant's build MUST copy the shared files it publishes into its own package; neither package MAY read `shared/` at run time. |
| C6 | A test in each variant MUST fail when its package copy differs from `shared/` after a build. |
| C7 | Both variants MUST read the shared files as data and MUST NOT execute anything from them. |
| V1 | After the move, the Python icon, vocabulary and pack modules load their data from the packaged copies and the existing test suite passes unchanged. |

---

### R-REPO-003 — The Python variant after the move

**Requires:** R-REPO-002

The Python variant behaves exactly as before; only paths change.

**R-REPO-003.TC-1 — Wheel contains the shared assets**

Automated by `python/tests/test_shared.py`: a wheel built from `python/` lists every pack's `pack.json` and `pack.css`, `page.css`, `icons.json` and `vocabulary.json`.

**R-REPO-003.TC-2 — Existing suite passes after the move**

Automated: `python -m unittest discover -s tests -t .` from `python/` passes, including `ZensicalBuildTests`.

**Realizes.** F-16

| | Statement |
|---|---|
| C1 | The Python package built from `python/` MUST keep its PyPI name `mockitdown`, its import name, its public API, its command line and its Markdown extension and fence names. |
| C2 | The Python wheel and sdist MUST contain the shared assets the package needs (C5 of R-REPO-002). |
| C3 | `python -m pip install -e python[markdown]` MUST give a working development install, and the test suite MUST pass when run from `python/`. |
| C4 | The release workflow MUST build and publish the Python package from `python/`, and the Pages workflow MUST build the example site from `python/examples/site/`. |
| C5 | `tools/gen_reference.py` MUST keep generating the example site's Reference section and MUST also write `shared/reference/<pack>.json` (R-WEB-004). |
| V1 | The Python test suite, including the Zensical example-site build, passes from `python/`, and a wheel built from `python/` installs and renders a mockup in a fresh virtual environment. |

---

### R-REPO-004 — Conformance corpus

**Requires:** R-REPO-003

The corpus is the definition of "the same rendering" (ADR-18). It is regenerated deliberately, never to make a failing TypeScript test pass.

**R-REPO-004.TC-1 — Python matches the corpus**

Automated by `python/tests/test_conformance.py`.

**R-REPO-004.TC-2 — Corpus is current**

Automated: `python tools/gen_conformance.py --check` runs in the Python test suite.

**Realizes.** F-16

| | Statement |
|---|---|
| C1 | `shared/conformance/` MUST hold conformance cases, each a mockitdown source `<name>.mockitdown` with its render options in `<name>.json` and its expected HTML in `<name>.html`. |
| C2 | The corpus MUST cover every render role of the base pack, every shipped pack at least once, light and dark appearance, each device form, imports of components, annotations and overlays, charts, images and diagnostics. |
| C3 | The expected HTML MUST be produced by the Python renderer, by `python/tools/gen_conformance.py`. |
| C4 | `gen_conformance.py --check` MUST fail when an expected file differs from what the Python renderer now produces. |
| C5 | Each variant's test suite MUST render every case and fail on any difference from the expected HTML. |
| V1 | Changing one expected file makes both test suites fail. |
