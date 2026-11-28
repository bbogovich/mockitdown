---
id: R-MDX-004.CR-2
target: R-MDX-004
kind: clarification
version: 0.12.10
date: 2026-11-27
issue: 59
summary: test cases backfilled (#59)
from: 512edd1be53b
to: 54f1e8925005
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,12 @@
+---
+id: TC-1
+title: One stylesheet per page
+verifies: [C1, C2, C3, C4, C5]
+---
+
+Python unit tests `python/tests/test_markdown_ext.py` `CssDeliveryTests`: a page with SwiftUI, Fluent and SwiftUI blocks starts with exactly one
+`<style data-mockitdown="base swiftui fluent">` (C1, V1) whose text equals `stylesheet(["base", "swiftui", "fluent"])`:
+minified, the page stylesheet once and first, then base, SwiftUI and Fluent, each pack's CSS before its token rules and
+each pack once (C2, V1); a page with prose and a Python code block only has no `<style>` (C3); with `css: none` no CSS
+is added and `mockitdown css --pack swiftui --pack fluent` writes the stylesheet the site includes instead (C4); after
+`Markdown.reset()` the packs used before are forgotten (C5).
```
