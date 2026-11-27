---
id: TC-1
title: Resolution through the import map
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]
---

In a temporary directory used as the working directory, with files `docs/mockups/shared/kpi.mockitdown` (importing `rows` and `./rows`), `docs/mockups/shared/rows.mockitdown`, `vendor/acme/cards.mockitdown`, `alt/one.mockitdown` and a local `http.server` on 127.0.0.1 serving `remote/acme/extra.mockitdown`, render through the API with `imports` = `{"shared/": "docs/mockups/shared/", "acme/": ["vendor/acme/", "http://127.0.0.1:<port>/remote/acme/"], "one": "alt/one.mockitdown", "": "docs"}` and check:

1. An absolute path loads as written (C1); `import "./x"` in a block with no source path reports C4, and with `source_path` set resolves beside it (C2).
2. `import "shared/kpi"` loads the library and its two nested imports, with `.mockitdown` appended (C3, C5, C6); `shared/` wins over `""` for that path (C7).
3. `import "acme/cards"` loads the vendor file; `import "acme/extra"` falls through to the HTTP candidate (C8, C9); a 404 for `acme/none` reports C4 listing the four candidates in order, and does not try `docs/acme/none` (C8); a server that is stopped produces `cannot read import` (C9).
4. `import "one"` loads `alt/one.mockitdown`; `import "one/x"` does not match the exact key (C7).
5. Without `imports`, the API and the CLI resolve `import "kpi"` only beside the source file (C10).

Automated in `python/tests/test_imports.py`; the TypeScript variant runs the same cases through R-WEB-001.TC-6.
