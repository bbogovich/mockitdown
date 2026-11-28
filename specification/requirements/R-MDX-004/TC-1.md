---
id: TC-1
title: One stylesheet per page
verifies: [C1, C2, C3, C4, C5]
---

Python unit tests `python/tests/test_markdown_ext.py` `CssDeliveryTests`: a page with SwiftUI, Fluent and SwiftUI blocks starts with exactly one
`<style data-mockitdown="base swiftui fluent">` (C1, V1) whose text equals `stylesheet(["base", "swiftui", "fluent"])`:
minified, the page stylesheet once and first, then base, SwiftUI and Fluent, each pack's CSS before its token rules and
each pack once (C2, V1); a page with prose and a Python code block only has no `<style>` (C3); with `css: none` no CSS
is added and `mockitdown css --pack swiftui --pack fluent` writes the stylesheet the site includes instead (C4); after
`Markdown.reset()` the packs used before are forgotten (C5).
