---
title: mockitdown Implementation
impl_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: HOME
---

# mockitdown Implementation

How the code on `main` realizes the [specification](../specification/index.md): its modules and
data flow, how it is tested, how packs are authored, and how the package and the documentation are
built and published. Pages cite the architecture elements (`A-…`) and requirements (`R-…`) they
realize.

| Page | Contents |
|---|---|
| [Architecture overview](architecture/index.md) | Package layout, data flow of one block, module map, known debt |
| [Syntax](architecture/syntax.md) · [Evaluation](architecture/evaluate.md) · [Packs](architecture/packs.md) · [Rendering](architecture/render.md) · [Styles and assets](architecture/styles-assets.md) · [Markdown integration](architecture/markdown.md) · [Command line](architecture/cli.md) | One page per module group |
| [Testing](testing.md) | Unit tests, pack contract tests, the example site as end-to-end fixture |
| [Pack authoring guide](pack-authoring.md) | Writing or extending a pack |
| [Build and publish](build-publish.md) | Development setup, packaging, the documentation and example sites, GitHub Pages |

## At a glance

| | |
|---|---|
| Language | Python ≥ 3.11, standard library only in the core (ADR-12) |
| Package | `mockitdown` (`src/mockitdown/`), version 0.1.0, MIT |
| Optional extra | `mockitdown[markdown]`: Markdown 3.6–3, pymdown-extensions 10–13 |
| Entry points | console script `mockitdown`; Python-Markdown extension `mockitdown`; fence `mockitdown.fence.format` / `validate` |
| Build | `python3 -m pip install -e '.[markdown]'` |
| Test | `python3 -m unittest discover -s tests -t .` |
| Docs | this site, branch `docs` (worktree `../mockitdown.docs`), built with Zensical |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-24 | Implementation documentation written for the production code |
