# mockitdown

UI mockups written in **SwiftUI syntax**, rendered as HTML and CSS that look like a real UI framework
(SwiftUI, Fluent, Material, SAPUI5, Bootstrap, Carbon, GTK, Qt, retro systems and more), in light and
dark. One language, one set of design packs, two implementations:

| Variant | Folder | What it is |
|---|---|---|
| Python | [`python/`](python/README.md) | the `mockitdown` package on PyPI: library, command line, Python-Markdown extension and fence for MkDocs / Zensical sites, rendering at build time. See [python/README.md](python/README.md). |
| TypeScript | `typescript/` | `mockitdown-` web components that render (and later edit) mockups in a web app, published to npm. In progress; it gets its own `typescript/README.md`. |
| Shared assets | `shared/` | the single source of the packs (`packs/<id>/pack.json`, `pack.css`), the page stylesheet (`css/page.css`), the icon table (`icons/icons.json`), the modifier vocabulary (`language/vocabulary.json`) and the generated element reference (`reference/<pack>.json`). Each variant's build copies what it publishes; neither reads `shared/` at run time. |

**[Demos](https://bbogovich.github.io/mockitdown/demos/)** ·
**[Documentation](https://bbogovich.github.io/mockitdown/)**

## Development

```bash
python3.14 -m venv .venv && .venv/bin/pip install -e "python[markdown]" zensical
cd python && ../.venv/bin/python -m unittest discover -s tests -t .
```

The definition, specification and implementation documentation are on the `docs` branch (worktree
`../mockitdown.docs`), published to GitHub Pages.

Licence: MIT.
