---
id: TC-1
title: The import map option replaces import_paths
verifies: [C1, C6, C7]
---

Python unit tests on the extension's configuration: with no options the effective import map is `{"": "docs"}` and `import "shared/kpi"` is looked up as `docs/shared/kpi` (C1); `import_paths: [docs/mockups]` raises at `markdown.Markdown(...)` with the exact message of C6 naming `docs/mockups`; `imports: {"a/": 3}` and `imports: [docs]` raise with the message of C7; `imports: {"shared/": "docs/mockups/shared/", "": ["docs", "lib"]}` is accepted. Automated in `python/tests/` by the issue that implements it.
