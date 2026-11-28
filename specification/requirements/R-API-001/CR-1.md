---
id: R-API-001.CR-1
target: R-API-001
kind: clarification
version: 0.12.7
date: 2026-11-27
issue: 56
summary: "test cases backfilled (TC-1); prose: source and options are positional, so source=True works as an override (#56)"
from: d66ed75ab2f6
to: 4c49cd480695
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,16 @@
+---
+id: TC-1
+title: render and its result
+verifies: [C1, C2, C3, C4]
+---
+
+Python unit tests `python/tests/test_api.py` `RenderTests`:
+`render('import SwiftUI\nText("Hello")', device="phone")` returns a `RenderResult` that is `ok`, with
+`packs` `["base", "swiftui"]`, a phone figure without CSS and the evaluated screen (C1, V1); a syntax
+error gives empty `packs` and no screen (C1).
+`render(src, RenderOptions(pack="fluent", device="tablet"), device="phone", pack=None, nope=1)` renders
+fluent on a phone without an error, and every render option can be given as an override, `source`
+included (C2). An unknown element puts one error in `errors` and makes `ok` false, while warnings stay
+out of `errors`; warnings alone leave `ok` true (C3). With `source=True` and an error the HTML is the
+error box, then the figure, then the source disclosure; warnings show a box only with `show_warnings`; a
+syntax error is the error box alone, even with `source=True` (C4).
--- a/prose.md
+++ b/prose.md
@@ -1 +1,4 @@
 `render` is the one entry point the fence, the CLI and other tools share.
+
+`source` and `options` are positional, so that every render option can be given as a keyword
+override, `source=True` included (found while writing TC-1, #56).
```
