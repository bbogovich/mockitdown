---
title: Build and publish
impl_version: 0.3.6
status: draft
updated: 2026-11-25
page_id: IMPL.BUILD
---

# Build and publish

## Development setup

The Python variant lives in `python/`; the virtual environment stays at the repository root
(see [Repository layout and shared assets](repository.md)).

```sh
cd mockitdown
python3 -m venv .venv
.venv/bin/pip install -e 'python[markdown]'                        # also copies shared/ into the package
.venv/bin/pip install -r python/examples/site/requirements.txt     # zensical, for the site build
cd python && ../.venv/bin/python -m unittest discover -s tests -t .
```

## Package

`python/pyproject.toml` (setuptools ≥ 68): name `mockitdown`, `requires-python >= 3.11`, MIT, no
dependencies, extra `markdown = ["Markdown>=3.6,<4", "pymdown-extensions>=10,<14"]`, console script
`mockitdown`, package data `page.css`, `icons.json`, `vocabulary.json` and `packs/*/pack.{json,css}`.
The package data are copies of `shared/`, written by `python/setup.py` (which runs
`tools/sync_shared.py`) at every build from a checkout; the sdist carries them, so a wheel built
from the sdist needs no `shared/`. The repository's `LICENSE` is copied beside `pyproject.toml` the
same way. The version is also `mockitdown.__version__`. Build with `cd python && python -m build`
(not a project dependency).

## Repository and branches

| Branch / worktree | Holds |
|---|---|
| `main` (`mockitdown/`) | `python/` (the package, tests, tools, example site `python/examples/site`), `shared/` (packs, CSS, icons, vocabulary, reference JSON), `typescript/` (web components, from issue #3), CI |
| `docs` (`mockitdown.docs/`) | this documentation: definition, specification and implementation tiers |

The documentation tiers are SpecItOut Tier A sources (`definition/`, `specification/`,
`implementation/`) compiled by `sio-docs build` into `docs/` and `mkdocs.yml` (from `site.yml`);
`sio-docs check` verifies them. Never edit `docs/` or `mkdocs.yml` by hand.

## Documentation site

Built with Zensical (ADR-14), which reads the generated `mkdocs.yml`:

```sh
cd mockitdown.docs
sio-docs build && sio-docs check
../mockitdown/.venv/bin/zensical build --clean      # → site/
../mockitdown/.venv/bin/zensical serve              # local preview
```

The site uses the mockitdown extension itself (live mockups in the specification), so mockitdown
must be installed in the environment that builds it (`pip install -e ../mockitdown/python`); its
`requirements.txt` names Zensical, pymdown-extensions and Markdown. Mermaid diagrams are rendered by
`specification/javascripts/mermaid-init.js` (Zensical does not inject Mermaid). The mockitdown CSS
is inlined per page (`css: inline`, the default). Zensical keeps a render cache in `.cache/`; delete
it when a rebuild seems not to pick up a mockitdown upgrade.

## Example site

```sh
cd mockitdown/python/examples/site
../../../.venv/bin/zensical build --clean
```

### Reference pages

The Reference section (`python/examples/site/docs/reference/`), its block of the example site's
nav and the element reference JSON (`shared/reference/`, for the TypeScript pack gallery) are
generated from the pack definitions. Regenerate them after adding or changing a pack, and commit the
result; the test suite fails when they are stale (R-PACK-012, R-REPO-003.C9):

```sh
cd python
../.venv/bin/python tools/gen_reference.py          # write the pages, the nav block and shared/reference/
../.venv/bin/python tools/gen_reference.py --check  # what the test runs
```

## Header tabs

Both sites enable `navigation.tabs` and list the same five sections in the same order — Demo,
Definition, Specification, Implementation, Reference. Each site's own sections are nav sections (with
their own sidebar); the other site's sections are absolute links to their published URLs
(`https://bbogovich.github.io/mockitdown/…`), so they leave a local preview.

`navigation.tabs.sticky` keeps the tabs in the header while scrolling, and a small stylesheet
(`assets/site.css` on the example site, `specification/stylesheets/tabs.css` on the documentation)
overrides the theme's rule that hides them below 1220 px. Framework packs are grouped as Desktop,
Web and Mobile in both the Demo and the Reference menus; `python/tools/gen_reference.py` derives the group
from each pack's default device and chrome.

## GitHub Pages

`.github/workflows/pages.yml` runs on pushes to `main` and `docs` (each branch carries its own copy;
keep them identical): it checks out both branches, installs `main/python` with the `markdown` extra
and both sites' requirements, runs the tests from `main/python`, builds
the documentation site (published at `/`) and the example site (published at `/demos/`, with the
Reference section at `/demos/reference/`), writes a root `index.html` that redirects to the Demo
section, and deploys them with `actions/deploy-pages`.

`.github/workflows/release.yml` runs on a `v*` tag: from `python/` it checks the tag against the
version, runs the tests, builds the sdist and wheel (`python/dist/`) and publishes them through PyPI
Trusted Publishing (R-REPO-003.C4).

## Continuous integration

`.github/workflows/ci.yml` (on `main` only; the `docs` branch has no code to test) runs on every push
and pull request: a `python` job (the suite with the real Zensical build) and a `typescript` job
(Node 22, `npm ci`, Playwright's Chromium, `npm test`) — R-WEB-005.C3, C5. It publishes nothing; see
[Web development](architecture/web-dev.md#ci).


---

<small style="opacity:.55">You have read the documentation to its last page. Thank you — here is
something not in any menu: [a starship console](../demos/eggs/lcars/),
[a green-screen ship computer](../demos/eggs/phosphor/) and
[a holographic heads-up display](../demos/eggs/hologram/).</small>

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-24 | Page written |
| 0.2.0 | 2026-11-24 | Demos published at /demos/; a reward for readers at the end |
| 0.3.0 | 2026-11-24 | Header tabs, generated Reference pages, root redirects to Demo |
| 0.1.1 | 2026-11-24 | Docs site back on inline CSS |
| 0.3.2 | 2026-11-25 | Python variant moved to python/, shared assets in shared/: setup, package data, example site, Reference JSON, workflows (#1) |
| 0.3.6 | 2026-11-25 | Continuous integration: ci.yml runs both variants' suites (#5) |
