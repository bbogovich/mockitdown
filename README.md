# mockitdown

UI mockups written in **SwiftUI syntax** inside Markdown, rendered at build time as HTML and CSS that
look like a real UI framework, in light and dark: **SwiftUI** (iOS, iPadOS, macOS), **Fluent (WinUI 3)**,
**Material UI**, **Angular Material**, **SAPUI5 (Fiori Horizon)**, **Bootstrap**, **shadcn/ui**,
**Android (Material 3)**, **GTK 4 / libadwaita**, **Qt 6** and **KDE Plasma** — plus retro systems
from the Xerox Star to Windows Vista. Charts, spreadsheets, boards, numbered callouts, pointers and
drag-select overlays are built in.

**[Demos](https://bbogovich.github.io/mockitdown/demos/)** ·
**[Documentation](https://bbogovich.github.io/mockitdown/)** ·
**[Source](https://github.com/bbogovich/mockitdown)**

````markdown
```mockitdown device="phone" appearance="both"
import SwiftUI

NavigationStack {
  List {
    Row("Wi-Fi", detail: "Home", systemImage: "wifi", chevron: true)
    Toggle("Airplane Mode", isOn: false)
  }
  .navigationTitle("Settings")
}
```
````

- **One notation, many frameworks.** `import SwiftUI`, `import FluentUI`, `import MUI`, … selects a
  *design pack*; each pack adds the framework's own component names and styles.
- **Custom components.** Declare `struct MyRow: View { … }` in a block or in a `.mockitdown`
  library and `import "shared/rows"` it anywhere in the site.
- **Self-contained output.** No JavaScript, no CDN, no web fonts; local images are embedded.
- **MkDocs and Zensical.** A Python-Markdown extension plus a superfences fence; no MkDocs plugin.

## Install and configure

```bash
pip install "mockitdown[markdown]"
# not yet on PyPI? install from GitHub:
pip install "mockitdown[markdown] @ git+https://github.com/bbogovich/mockitdown@main"
```

Python 3.11 or later. The core has no dependencies; the `markdown` extra adds Python-Markdown and
pymdown-extensions for the MkDocs / Zensical integration.

`mkdocs.yml` (read by both MkDocs and Zensical; any theme, Material recommended):

```yaml
markdown_extensions:
  - mockitdown:
      default_pack: swiftui          # pack for blocks that name none
      default_appearance: auto       # light | dark | auto (follow the page) | both
      import_paths: [docs/mockups]   # where import "…" looks
      asset_paths: [docs]            # where Image("…") looks
      strict: true                   # fail the build on mockup errors
  - pymdownx.superfences:
      custom_fences:
        - name: mockitdown
          class: mockitdown
          format: !!python/name:mockitdown.fence.format
          validator: !!python/name:mockitdown.fence.validate
```

## Command line

```bash
mockitdown render screen.mockitdown --standalone -o screen.html   # a full page with CSS
mockitdown check docs/mockups/*.mockitdown                         # diagnostics, exit 1 on errors
mockitdown css --pack fluent -o docs/assets/mockitdown.css         # for `css: none` sites
mockitdown packs                                                   # installed packs
mockitdown elements mui --markdown                                 # a pack's element catalogue
```

## Repository

| Path | Holds |
|---|---|
| `src/mockitdown/` | the library: `syntax/` (lexer, parser), `evaluate.py`, `render/`, `packs/<id>/`, `styles.py`, `extension.py`, `fence.py`, `cli.py` |
| `examples/site/` | the example site (Zensical): one page per pack; also the end-to-end test fixture |
| `tests/` | unit tests and the example-site test |
| `tools/snapshot.py` | render a mockup and screenshot it with headless Chrome |

The definition, specification and implementation documentation are on the `docs` branch (worktree
`../mockitdown.docs`), published to GitHub Pages.

```bash
python3.14 -m venv .venv && .venv/bin/pip install -e ".[markdown]" zensical
.venv/bin/python -m unittest discover -s tests -t .
cd examples/site && ../../.venv/bin/zensical serve
```

Licence: MIT.
