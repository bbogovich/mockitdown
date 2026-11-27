---
id: R-MDX-002
title: Extension options
status: active
version: 0.2.0
rev: 0
page: MDX.1
slot: reqs
order: 2
source: [SRC-2]
realizes: [F-11]
constrained_by: [A-MDX-1, M-OPT-1]
reverse_engineered: true
hash: 81168ddb34e2
---

C1: The Markdown extension MUST accept these options with these defaults: `default_pack` (`base`), `default_appearance` (`light`), `default_device` (empty: none), `import_paths` (`[docs]`), `asset_paths` (`[docs]`), `pack_paths` (`[]`), `embed_assets` (`true`), `max_embed_bytes` (`2000000`), `css` (`inline`), `strict` (`false`), `caption` (`true`), `elements` (`false`), `show_warnings` (`false`).
C2: The path options MUST accept one string or a list of strings.
C3: If `default_appearance` is not `light`, `dark`, `auto` or `both`, then the Markdown extension MUST fail configuration with "mockitdown: default_appearance must be one of …".
C4: If `css` is not `inline` or `none`, then the Markdown extension MUST fail configuration with "mockitdown: css must be 'inline' or 'none'".
C5: The options MUST apply to every block on the site unless a fence attribute overrides them.
V1: `- mockitdown: {default_pack: swiftui, css: none}` renders every block without a pack in SwiftUI and injects no CSS; `default_appearance: dim` fails the build at startup.
