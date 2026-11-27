---
title: Site integration guide
spec_version: 0.2.0
status: draft
updated: 2026-11-24
page_id: REF.4
---

# Site integration guide

How to add mockitdown to a Zensical or MkDocs site. The requirements are R-MDX-001 – R-MDX-006.

## Install

```sh
python3 -m venv .venv
.venv/bin/pip install "mockitdown[markdown]" zensical    # or: mkdocs mkdocs-material
```

Keep a `requirements.txt` beside `mkdocs.yml` naming exactly these packages, with bounded versions:

```text
zensical>=0.1.3,<0.2
mockitdown[markdown]>=0.1,<0.2
```

## Configure `mkdocs.yml`

Zensical reads `mkdocs.yml`. Add the extension and the fence; list `mockitdown` before
`pymdownx.superfences`.

```yaml
theme:
  name: material
  variant: classic            # Zensical: keep the Material look

markdown_extensions:
  - attr_list
  - md_in_html
  - mockitdown:
      default_pack: swiftui           # pack for blocks that name none (default: base)
      default_appearance: auto        # follow the site's light/dark toggle (default: light)
      imports:                        # import map: namespace → directory or URL (default: {"": docs})
        "": docs/mockups              #   import "kpi"        → docs/mockups/kpi.mockitdown
        acme/: https://example.com/acme/  # import "acme/cards" → …/acme/cards.mockitdown
      asset_paths: [docs]             # where Image("…") files are found (default: [docs])
      strict: true                    # fail the build on any mockitdown error
  - pymdownx.superfences:
      custom_fences:
        - name: mockitdown
          class: mockitdown
          format: !!python/name:mockitdown.fence.format
          validator: !!python/name:mockitdown.fence.validate
```

Paths are relative to the directory the build runs in (usually the one holding `mkdocs.yml`).

## Extension options

| Option | Default | Meaning |
|---|---|---|
| `default_pack` | `base` | Pack for a block that selects none (R-PACK-005) |
| `default_appearance` | `light` | `light`, `dark`, `auto` or `both` (R-APP-001) |
| `default_device` | none | Device for a block that names none, before the pack's default (R-DEV-002) |
| `imports` | `{"": docs}` | Import map for `import "…"`: namespace (`acme/`), exact path or `""` → directory, file, URL or list (R-IMP-002, R-IMP-007); replaces `import_paths` (ADR-24) |
| `asset_paths` | `[docs]` | Directories for local images (R-ASSET-002) |
| `pack_paths` | `[]` | Directories of site packs, `<dir>/<id>/pack.json` (R-PACK-001) |
| `embed_assets` | `true` | Inline local images as `data:` URIs (R-ASSET-003) |
| `max_embed_bytes` | `2000000` | Largest image inlined; larger ones are linked |
| `css` | `inline` | `inline`: one `<style>` per page; `none`: the site links `mockitdown css` output (R-MDX-004) |
| `strict` | `false` | Any error fails the build (R-MDX-005) |
| `caption` | `true` | Show the `id · title` caption |
| `elements` | `false` | Append the Elements table to every mockup |
| `show_warnings` | `false` | Show warnings in the page as well as the log |

## Writing a block

````markdown
```mockitdown device="phone" appearance="both" title="Inbox" id="SCR-MAIL-1"
import SwiftUI
NavigationStack {
  List { Row("Ana Lima", subtitle: "Lunch on Friday?", detail: "9:41") }
    .navigationTitle("Inbox")
}
```
````

## Fence attributes

| Attribute | Type | Example | Effect |
|---|---|---|---|
| `pack` | text | `pack="fluent"` | Pack for this block, overriding imports and `@Screen` |
| `device` | text | `device="phone"` | `phone`, `phone-landscape`, `tablet`, `tablet-portrait`, `desktop`, `wide`, `fit` or a pack size |
| `appearance` | text | `appearance="both"` | `light`, `dark`, `auto`, `both` |
| `width`, `height` | integer | `width="600"` | Frame size in points, overriding the device's |
| `chrome` | text | `chrome="browser"` | `auto`, `none`, `ios`, `ipados`, `macos`, `windows`, `android`, `browser` |
| `url` | text | `url="https://shop.example.com"` | Address shown by browser chrome |
| `title`, `id` | text | `title="Inbox" id="SCR-1"` | Caption and `aria-label` |
| `caption` | boolean | `caption="false"` | Hide the caption |
| `elements` | boolean | `elements="true"` | Append the Elements table |
| `source` | boolean | `source="true"` | Append the block's source in a collapsible box |

Booleans accept `true`, `yes`, `on`, `1` (anything else is false). An unknown attribute is reported
in an error box above the figure rather than ignored.

## Component libraries and site packs

```text
docs/
  mockups/
    shared/kpi.mockitdown       ← import "shared/kpi"
packs/
  acme/pack.json, pack.css      ← pack_paths: [packs], then pack="acme"
```

## Linking the CSS instead (`css: none`)

```sh
mockitdown css --pack swiftui --pack fluent -o docs/assets/mockitdown.css
```

```yaml
extra_css: [assets/mockitdown.css]
markdown_extensions:
  - mockitdown: {css: none}
```

Regenerate the file whenever mockitdown or a pack is upgraded.

## Zensical notes

- Zensical (0.1.x) runs Python-Markdown extensions and superfences fences but not MkDocs plugins —
  mockitdown needs none (ADR-3).
- Use `theme.variant: classic` to keep the Material header colours (ADR-14).
- Mermaid is not injected by Zensical; this site loads it with a small `extra_javascript` loader.
- `navigation.instant` works with mockitdown (R-MDX-006).
- **Use `css: none` under Zensical 0.1.x.** The inline `<style>` of `css: inline` is lost by
  Zensical 0.1.3 and its text pollutes heading ids and page titles (R-MDX-004, known deviation).
  Generate the stylesheet with `mockitdown css` and link it with `extra_css`, as this site does.

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
| 0.12.0 | 2026-11-27 | `imports` (import map) replaces `import_paths` (ADR-24, SRC-19) |
