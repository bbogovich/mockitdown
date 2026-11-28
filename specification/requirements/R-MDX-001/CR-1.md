---
id: R-MDX-001.CR-1
target: R-MDX-001
kind: clarification
version: 0.12.10
date: 2026-11-27
issue: 59
summary: test cases backfilled (#59)
from: df38463cc45a
to: e459afa33bb4
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,13 @@
+---
+id: TC-1
+title: Loading, registration and the fence without the extension
+verifies: [C1, C2, C3, C4, C5]
+---
+
+Python unit tests `python/tests/test_markdown_ext.py` `IntegrationTests`: `markdown.Markdown(extensions=["mockitdown", "pymdownx.superfences"])`
+registers `MockitdownExtension` and converts a page with a block to one figure (C1, V1); `mockitdown.fence.format`
+and `mockitdown.fence.validate` import by their dotted names, the example site's `mkdocs.yml` registers them, and a
+fence with any other class name renders (C2); `pyproject.toml` declares no `mkdocs.plugins` entry point, no module
+imports MkDocs or subclasses `BasePlugin`, and the example site has no `plugins:`, while `test_examples.py`
+`ZensicalBuildTests` builds the example site under Zensical (C3, V1); a fence without the extension renders a `base`
+desktop light figure and no `<style>` (C4); the example site lists `mockitdown` before `pymdownx.superfences` (C5).
```
