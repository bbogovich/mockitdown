---
id: R-API-004.CR-1
target: R-API-004
kind: clarification
version: 0.12.7
date: 2026-11-27
issue: 56
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#56)"
from: 905bb1ed3202
to: abbe874c95dd
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,14 @@
+---
+id: TC-1
+title: Dependencies, package data and licence
+verifies: [C1, C2, C3, C4, C5]
+---
+
+Python unit tests `python/tests/test_api.py` `DependencyAndPlatformTests`, on `python/pyproject.toml`
+and the sources: `dependencies` is empty, and no module of `src/mockitdown` but `extension.py` and
+`fence.py` imports anything outside the standard library and the package (C1, V1); the `markdown` extra
+is exactly `Markdown>=3.6,<4` and `pymdown-extensions>=10,<14`, the only third-party imports of those two
+modules (C2, V1); `requires-python` is `>=3.11` (C3, with TC-M1 for the platforms); the package data
+names `page.css`, `packs/*/pack.json` and `packs/*/pack.css`, every shared pack has both files in the
+package, and the console script `mockitdown` is `mockitdown.cli:main` (C4); the licence is `MIT` and both
+`LICENSE` files hold the MIT licence (C5). IT-7 builds a wheel and checks its files (R-REPO-003.TC-1).
--- /dev/null
+++ b/TC-M1.md
@@ -0,0 +1,10 @@
+---
+id: TC-M1
+title: The suite on every platform
+verifies: [C3]
+---
+
+Before a release: run the Python suite (`python -m unittest discover -s tests -t .` in `python/`) under
+Python 3.11 and the newest supported Python, on macOS, Windows and Linux, each in a fresh virtual
+environment with `pip install -e "python[markdown]"`. Record the platforms, versions and results on the
+release issue; a failure fails the release. CI runs Linux with Python 3.12 only.
```
