---
id: TC-2
title: Rendering flags and the source path
verifies: [C1, C2]
---

Python unit tests `python/tests/test_cli.py` `RenderingOptionTests`, with `cli.render` wrapped to record
the options it is given: `render` and `check` with every flag of C1 except `-I` (TC-1) build equal
options carrying each value; without flags the options are the render defaults (`default_pack` `base`,
`chrome` `auto`, embedding on); a bare `--menubar` gives `"true"`; an appearance outside the four is a
usage error; repeated `-A/--asset-path` and `-P/--pack-path` keep their order (C1). A file given through
a path with `..` sets `source_path` to its resolved path, so `import "kpi"` and `Image("logo.png")` beside
it resolve with no diagnostic; standard input sets none (C2). R-API-003.TC-1 checks the same flags
against the render options.
