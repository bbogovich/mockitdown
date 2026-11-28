---
id: R-MDX-002.CR-3
target: R-MDX-002
kind: correction
version: 0.12.10
date: 2026-11-27
issue: 59
summary: "as built: C1 lists callout_refs (true, R-ANN-004.C1); TC-2 verifies C1-C5 (#59)"
from: 2654ec2ed518
to: baf20c5046d4
---

## Clauses

@ C1 edit
~ The Markdown extension MUST accept these options with these defaults: `default_pack` (`base`), `default_appearance` (`light`), `default_device` (empty: none), `imports` (`{"": "docs"}`), `asset_paths` (`[docs]`), `pack_paths` (`[]`), `embed_assets` (`true`), `max_embed_bytes` (`2000000`), `css` (`inline`), `strict` (`false`), `caption` (`true`), `elements` (`false`), `show_warnings` [-(`false`).-]{+(`false`), `callout_refs` (`true`, R-ANN-004.C1).+}

## Files

```diff
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,12 @@
+---
+id: TC-2
+title: Defaults, path options, validation and site-wide options
+verifies: [C1, C2, C3, C4, C5]
+---
+
+Python unit tests `python/tests/test_markdown_ext.py` `OptionTests`: with no options the extension's configuration holds the defaults of C1
+(`imports` excepted, TC-1) and the session's render options follow them (C1); `asset_paths` and `pack_paths` take
+one string or a list (C2); `default_appearance: dim` raises at `markdown.Markdown(...)` with the exact message of C3
+and the four appearances are accepted (C3, V1); `css: link` raises with the message of C4 (C4); with
+`default_pack: swiftui`, `css: none`, `default_appearance: dark` and `caption: false`, every block renders in
+SwiftUI, dark, without a caption or CSS, except the block whose fence names `pack`, `appearance` and `caption` (C5, V1).
```
