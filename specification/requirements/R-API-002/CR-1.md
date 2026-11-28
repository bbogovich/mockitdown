---
id: R-API-002.CR-1
target: R-API-002
kind: clarification
version: 0.12.7
date: 2026-11-27
issue: 56
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#56)"
from: f27f25799de0
to: 72c8d7e74c86
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,15 @@
+---
+id: TC-1
+title: check, evaluate, stylesheet and the exports
+verifies: [C1, C2, C3, C4]
+---
+
+Python unit tests `python/tests/test_api.py` `CheckEvaluateStylesheetTests`: `check` returns the same
+diagnostics as `render` for the same source and overrides, the render-stage `icon` and `asset`
+warnings included (C1). `evaluate` returns the screen, with its pack and views, and an empty collector
+for a source whose only problem is found while rendering (an unknown icon), and `None` with the syntax
+error for a broken source (C2). `stylesheet(["fluent"])` holds `page.css`, fluent and its ancestor base
+and no other pack; `stylesheet()` holds every registered pack; `minify=False` keeps the pack comments; a
+site pack in `pack_paths` contributes its tokens and scaled CSS (C3). `mockitdown.__all__` is exactly the
+twelve names of C4, each an attribute of the package (C4).
+`<style>{stylesheet(r.packs)}</style>{r.html}` holds the figure and its pack rules (V1).
```
