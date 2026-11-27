---
id: TC-1
title: User guide structure and option tables
verifies: [C1, C4, C5, C6, C8]
---

`python/tests/test_examples.py`: the first nav section of `python/examples/site/mkdocs.yml` is `User guide` with Home, Installation, Language tour, Custom components first (C1); every key of the extension's configuration schema and every fence attribute of R-MDX-003.C1 appears in the first column of the Installation page's option and attribute tables (C4); the Installation page names `imports`, `-I`, the render option `imports` and `mockitdown-imports` (C5); the Custom components page holds a block with `library=`, an `import "#` in a later block, a qualified call, an `as` import and a struct with a `content` slot, a defaulted and an optional view property (C6); the site configuration has `imports` and no `import_paths` (C8).
