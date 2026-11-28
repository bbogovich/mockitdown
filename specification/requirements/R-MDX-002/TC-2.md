---
id: TC-2
title: Defaults, path options, validation and site-wide options
verifies: [C1, C2, C3, C4, C5]
---

Python unit tests `python/tests/test_markdown_ext.py` `OptionTests`: with no options the extension's configuration holds the defaults of C1
(`imports` excepted, TC-1) and the session's render options follow them (C1); `asset_paths` and `pack_paths` take
one string or a list (C2); `default_appearance: dim` raises at `markdown.Markdown(...)` with the exact message of C3
and the four appearances are accepted (C3, V1); `css: link` raises with the message of C4 (C4); with
`default_pack: swiftui`, `css: none`, `default_appearance: dark` and `caption: false`, every block renders in
SwiftUI, dark, without a caption or CSS, except the block whose fence names `pack`, `appearance` and `caption` (C5, V1).
