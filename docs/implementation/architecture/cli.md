---
title: Command line
impl_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: IMPL.CLI
---

# Command line

Realizes **A-CLI-1**; requirements R-CLI-001 – R-CLI-006.

`cli.py` builds an `argparse` parser with five subcommands, each a `cmd_<name>(args) -> int`:

| Function | Command | Notes |
|---|---|---|
| `cmd_render` | `render FILE` | `_read` (file or stdin) → `_options` → `api.render`; `--standalone` wraps the fragment in a page with `api.stylesheet(result.packs or ["base"])` |
| `cmd_check` | `check FILE…` | renders each file; text summary or `--json` report |
| `cmd_css` | `css` | `api.stylesheet(--pack… or all, minify=not --pretty)`; creates the output directory |
| `cmd_packs` | `packs` | registry listing, text or JSON |
| `cmd_elements` | `elements PACK` | element table; `--markdown` generates the specification's pack catalogues |

`_common` adds the rendering options shared by `render` and `check` (`--windowed` is a flag whose
absence leaves `windowed` to `@Screen`, R-DEV-010.C4); `_options` maps them onto
`RenderOptions`, setting `source_path` from the file so relative imports and assets work.
`main(argv)` returns the exit code; `MockitdownError` and `OSError` become `mockitdown: <message>`
with exit 1; argparse usage errors exit 2.

The console script is declared in `pyproject.toml` (`[project.scripts] mockitdown =
"mockitdown.cli:main"`).


## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-24 | Page written |
| 0.3.14 | 2026-11-25 | `--windowed` (#13) |
