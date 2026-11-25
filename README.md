# mockitdown

UI mockups written in **SwiftUI syntax**, rendered as HTML and CSS that look like a real UI framework
(SwiftUI, Fluent, Material, SAPUI5, Bootstrap, Carbon, GTK, Qt, retro systems and more), in light and
dark. One language, one set of design packs, two implementations:

| Variant | Folder | What it is |
|---|---|---|
| Python | [`python/`](python/README.md) | the `mockitdown` package on PyPI: library, command line, Python-Markdown extension and fence for MkDocs / Zensical sites, rendering at build time. See [python/README.md](python/README.md). |
| TypeScript | [`typescript/`](typescript/README.md) | the `mockitdown` npm package: the same core in TypeScript for browsers and Node, and `mockitdown-` web components that render (and later edit) mockups in a web app. In progress. See [typescript/README.md](typescript/README.md). |
| Shared assets | `shared/` | the single source of the packs (`packs/<id>/pack.json`, `pack.css`), the page stylesheet (`css/page.css`), the icon table (`icons/icons.json`), the modifier vocabulary (`language/vocabulary.json`) the generated element reference (`reference/<pack>.json`) and the design patterns of the pack gallery (`patterns/`, core vocabulary, checked in every pack by both variants' tests). Each variant's build copies what it publishes; neither reads `shared/` at run time. |

**[Demos](https://bbogovich.github.io/mockitdown/demos/)** ·
**[Documentation](https://bbogovich.github.io/mockitdown/)**

## Development

```bash
python3.14 -m venv .venv && .venv/bin/pip install -e "python[markdown]" zensical
cd python && ../.venv/bin/python -m unittest discover -s tests -t .
cd ../typescript && npm install && npm test        # Node 22+
```

The definition, specification and implementation documentation are on the `docs` branch (worktree
`../mockitdown.docs`), published to GitHub Pages.

Licence: MIT.
