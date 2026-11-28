---
id: TC-1
title: Dependencies, package data and licence
verifies: [C1, C2, C3, C4, C5]
---

Python unit tests `python/tests/test_api.py` `DependencyAndPlatformTests`, on `python/pyproject.toml`
and the sources: `dependencies` is empty, and no module of `src/mockitdown` but `extension.py` and
`fence.py` imports anything outside the standard library and the package (C1, V1); the `markdown` extra
is exactly `Markdown>=3.6,<4` and `pymdown-extensions>=10,<14`, the only third-party imports of those two
modules (C2, V1); `requires-python` is `>=3.11` (C3, with TC-M1 for the platforms); the package data
names `page.css`, `packs/*/pack.json` and `packs/*/pack.css`, every shared pack has both files in the
package, and the console script `mockitdown` is `mockitdown.cli:main` (C4); the licence is `MIT` and both
`LICENSE` files hold the MIT licence (C5). IT-7 builds a wheel and checks its files (R-REPO-003.TC-1).
