---
title: Build and publish
impl_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: IMPL.BUILD
---

# Build and publish

## Development setup

```sh
cd mockitdown
python3 -m venv .venv
.venv/bin/pip install -e '.[markdown]'
.venv/bin/pip install -r examples/site/requirements.txt     # zensical, for the site build
.venv/bin/python -m unittest discover -s tests -t .
```

## Package

`pyproject.toml` (setuptools ≥ 68): name `mockitdown`, version `0.1.0`, `requires-python >= 3.11`,
MIT, no dependencies, extra `markdown = ["Markdown>=3.6,<4", "pymdown-extensions>=10,<14"]`,
console script `mockitdown`, package data `page.css` and `packs/*/pack.{json,css}`. The version is
also `mockitdown.__version__`. Build a wheel with `python -m build` (not a project dependency).

## Repository and branches

| Branch / worktree | Holds |
|---|---|
| `main` (`mockitdown/`) | the package, tests, example site (`examples/site`), CI |
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
must be installed in the environment that builds it (`pip install -e ../mockitdown`); its
`requirements.txt` names Zensical, pymdown-extensions and Markdown. Mermaid diagrams are rendered by
`specification/javascripts/mermaid-init.js` (Zensical does not inject Mermaid). The mockitdown CSS
is inlined per page (`css: inline`, the default). Zensical keeps a render cache in `.cache/`; delete
it when a rebuild seems not to pick up a mockitdown upgrade.

## Example site

```sh
cd mockitdown/examples/site
../../.venv/bin/zensical build --clean
```

### Reference pages

The Reference section (`examples/site/docs/reference/`) and its block of the example site's nav are
generated from the pack definitions. Regenerate them after adding or changing a pack, and commit the
result; the test suite fails when they are stale (R-PACK-012):

```sh
.venv/bin/python tools/gen_reference.py          # write the pages and the nav block
.venv/bin/python tools/gen_reference.py --check  # what the test runs
```

## Header tabs

Both sites enable `navigation.tabs` and list the same five sections in the same order — Demo,
Definition, Specification, Implementation, Reference. Each site's own sections are nav sections (with
their own sidebar); the other site's sections are absolute links to their published URLs
(`https://bbogovich.github.io/mockitdown/…`), so they leave a local preview.

## GitHub Pages

`.github/workflows/pages.yml` runs on pushes to `main` and `docs`: it checks out both branches,
installs mockitdown with the `markdown` extra and both sites' requirements, runs the tests, builds
the documentation site (published at `/`) and the example site (published at `/demos/`, with the
Reference section at `/demos/reference/`), writes a root `index.html` that redirects to the Demo
section, and deploys them with `actions/deploy-pages`.


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
