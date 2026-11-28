---
id: TC-1
title: Finding local images
verifies: [C1, C2, C3, C4]
---

Python unit tests `python/tests/test_assets.py` `LocalImageTests`, in a temporary tree with the block's
file in `src/` and the asset paths `one/` and `two/`: `pic.svg` in `src/` and `one/` is taken from
`src/`, from `one/` without a source file, `other.svg` only in `two/` from `two/`, and
`pic.svg?v=2#top` finds `pic.svg` (C1). `../outside/secret.svg`, the absolute path of that file and a
symbolic link in `one/` pointing to it are not found, never embedded, and warn (C2, V1). A missing file
warns exactly "asset 'nope.png' not found (searched <src>, <one>, <two>)" with code `asset` (C3). With
the working directory at the tree's root, `asset_paths: [docs]` finds
`docs/assets/images/logo.svg` for `Image("assets/images/logo.svg")` (C4, V1).
