---
id: TC-1
title: Loading, registration and the fence without the extension
verifies: [C1, C2, C3, C4, C5]
---

Python unit tests `python/tests/test_markdown_ext.py` `IntegrationTests`: `markdown.Markdown(extensions=["mockitdown", "pymdownx.superfences"])`
registers `MockitdownExtension` and converts a page with a block to one figure (C1, V1); `mockitdown.fence.format`
and `mockitdown.fence.validate` import by their dotted names, the example site's `mkdocs.yml` registers them, and a
fence with any other class name renders (C2); `pyproject.toml` declares no `mkdocs.plugins` entry point, no module
imports MkDocs or subclasses `BasePlugin`, and the example site has no `plugins:`, while `test_examples.py`
`ZensicalBuildTests` builds the example site under Zensical (C3, V1); a fence without the extension renders a `base`
desktop light figure and no `<style>` (C4); the example site lists `mockitdown` before `pymdownx.superfences` (C5).
