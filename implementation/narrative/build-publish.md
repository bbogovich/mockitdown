---
title: Build and publish
impl_version: 0.3.34
status: draft
updated: 2026-11-27
page_id: IMPL.BUILD
---

# Build and publish

## Development setup

The Python variant lives in `python/`; the virtual environment stays at the repository root
(see [Repository layout and shared assets](repository.md)).

Python 3.11 or newer is needed: on a machine whose `python3` is older (macOS ships 3.9), name the
interpreter, e.g. `python3.14 -m venv .venv`; with 3.9 `pip install` backtracks and never finishes.

```sh
cd mockitdown
python3 -m venv .venv                                              # or python3.11+ explicitly
.venv/bin/pip install -e 'python[markdown]'                        # also copies shared/ into the package
.venv/bin/pip install -r python/examples/site/requirements.txt     # zensical, for the site build
cd python && ../.venv/bin/python -m unittest discover -s tests -t .
```

The TypeScript variant (Node ≥ 22) is built and tested in `typescript/` (see
[Web development](architecture/web-dev.md)); `npm test` builds first, and its browser tests need
Playwright's Chromium (`npx playwright install chromium`, once):

```sh
cd typescript
npm ci
npm run build          # tsc, then copies shared/ into dist/shared/
npm test               # build, build:tests, node:test unit suites, Playwright (Chromium)
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
`implementation/`) compiled by `vio-docs build` into `docs/` and `mkdocs.yml` (from `site.yml`);
`vio-docs check` verifies them. Never edit `docs/` or `mkdocs.yml` by hand.

## Documentation site

Built with Zensical (ADR-14), which reads the generated `mkdocs.yml`:

```sh
cd mockitdown.docs
vio-docs build && vio-docs check
../mockitdown/.venv/bin/zensical build --clean      # → site/ (after pip install -e ../mockitdown/python)
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

Both sites enable `navigation.tabs` and list the same six sections in the same order — Demo,
Gallery, Definition, Specification, Implementation, Reference (R-PACK-012.C6). Each site's own sections
are nav sections (with their own sidebar); the other site's sections, and Gallery (the pack gallery at
`/gallery/`, built by neither site), are absolute links to their published URLs
(`https://bbogovich.github.io/mockitdown/…`), so they leave a local preview. The Gallery entry is in
`site.yml` (documentation) and `python/examples/site/mkdocs.yml` (example site), right after Demo;
`python/tests/test_site_nav.py` checks the example site's six tabs (R-PACK-012.TC-1).

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
Reference section at `/demos/reference/`), builds the web components (Node 22, `npm ci` and
`npm run build` in `main/typescript`), writes a root `index.html` that redirects to the Demo
section, assembles the pack gallery at `/gallery/`, tests the assembled site, and deploys it with
`actions/deploy-pages`.

### The published pack gallery

`node main/typescript/scripts/assemble-gallery.mjs public/gallery` (after `npm run build`) reproduces
the development server's URL layout (R-WEB-003.C5) as static files, so the test pages work unchanged
(R-WEB-004.C27–C30):

| Published | From |
|---|---|
| `/gallery/index.html` | a meta refresh and a link to `pages/index.html`, the gallery home page (C29, R-WEB-006) |
| `/gallery/pages/` | `typescript/pages/` |
| `/gallery/dist/` | `typescript/dist/` (the built package, `dist/shared/` included) |
| `/gallery/shared/reference/`, `/gallery/shared/patterns/` | the same folders of `shared/` |

Every request of the gallery is relative (`../dist/`, `../shared/`, the package's own `dist/shared/`),
so it stays under `/gallery/` (C30). The page's brand link goes to `../`: the index on the development
server, the redirect back to the gallery when published.

**Before upload** (C31, R-WEB-004.TC-9) the step *Test the published site* installs Playwright's
Chromium, serves `public/` with `python -m http.server 8174` and runs
`GALLERY_URL=http://127.0.0.1:8174/gallery/ npx playwright test -c playwright.published.config.mjs`
(`typescript/tests/browser/published.spec.mjs`, IT-26). A failure fails the build job, so nothing is
deployed. The same check locally, after building both sites and the package:

```sh
P=$(mktemp -d)/public; mkdir -p "$P/demos"
cp -R ../mockitdown.docs/site/. "$P/"; cp -R python/examples/site/site/. "$P/demos/"
(cd typescript && node scripts/assemble-gallery.mjs "$P/gallery")
python3 -m http.server 8174 --bind 127.0.0.1 --directory "$P" &
(cd typescript && GALLERY_URL=http://127.0.0.1:8174/gallery/ npx playwright test -c playwright.published.config.mjs)
```

The regular browser suite (`npm test`) ignores `published.spec.mjs`; the published config has no
`webServer`, it needs `GALLERY_URL`.

`.github/workflows/release.yml` runs on a `v*` tag: from `python/` it checks the tag against the
version, runs the tests, builds the sdist and wheel (`python/dist/`) and publishes them through PyPI
Trusted Publishing (R-REPO-003.C4).

## TypeScript releases

The TypeScript package has its own version line (`version` in `typescript/package.json`), its own
tags `ts-vX.Y.Z` and its own workflow, `.github/workflows/release-ts.yml` (R-WEB-007, ADR-23). The
Python workflow's `v*` filter does not match `ts-v…` (GitHub tag filters are anchored), so a
TypeScript tag never starts a PyPI release, and a Python tag never starts this one.

| Step (in `typescript/`) | What it does |
|---|---|
| Check the tag | `ts-v` + `version` of `package.json` must equal `GITHUB_REF_NAME`, else `exit 1` before anything is installed (C2); sets `VERSION` |
| Install, audit | Node 22, `npm ci`, `npm audit --audit-level=high` (C3) |
| Test | `npx playwright install --with-deps chromium`, `npm test` (C3) |
| Pack | `npm pack` → `mockitdown-X.Y.Z.tgz`: `package.json`, `README.md`, `LICENSE`, `dist/` with `dist/shared/` (the `files` of `package.json`; C4) |
| Release | `gh release create ts-vX.Y.Z mockitdown-X.Y.Z.tgz --title "mockitdown TypeScript X.Y.Z" --verify-tag`, with `GH_TOKEN` = the workflow's `GITHUB_TOKEN` (`permissions: contents: write`; C5) |

The notes give the install command
`npm install https://github.com/bbogovich/mockitdown/releases/download/ts-vX.Y.Z/mockitdown-X.Y.Z.tgz`
(built from `GITHUB_REPOSITORY`) and the commits since the previous `ts-v` tag (all of them for the
first release) that touch `typescript/` or `shared/`, one `- <sha> <subject>` line each (C6; the
checkout fetches full history for this). Nothing is published to the npm registry and no secret
but `GITHUB_TOKEN` is used (C7). `typescript/README.md` says how to install a release (C8).

To release: set `version` in `typescript/package.json`, commit and push `main`, then
`git tag -a ts-vX.Y.Z -m "mockitdown TypeScript X.Y.Z" && git push origin ts-vX.Y.Z`, and follow the
run with `gh run watch`. A pushed tag is never moved or reused (ADR-23.C1). Before tagging, the same
archive can be checked locally: `npm pack --pack-destination <dir>`, then `npm install <dir>/mockitdown-X.Y.Z.tgz`
in an empty project and import `mockitdown` or `mockitdown/node`.

`typescript/tests/unit/package.test.ts` (IT-46) reads both release workflows and `npm pack --dry-run --json`
in `npm test`, so a change that breaks the tag filters, the step order or the archive's content fails CI.

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
| 0.3.19 | 2026-11-27 | Pack gallery published at /gallery/ and tested before upload; Gallery header tab on both sites (#19) |
| 0.3.20 | 2026-11-26 | Audit: development setup covers the TypeScript build and test |
| 0.3.29 | 2026-11-27 | Audit: vio-docs replaces sio-docs; Python 3.11+ interpreter named in the setup |
| 0.3.33 | 2026-11-27 | The `/gallery/` redirect goes to the home page, `pages/index.html` (#62) |
| 0.3.34 | 2026-11-27 | TypeScript releases: `release-ts.yml`, `ts-v` tags, the `npm pack` archive on a GitHub release (#63) |
