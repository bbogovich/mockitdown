---
id: TC-1
title: Nested imports and cycles
verifies: [C1, C2]
---

Python unit tests `python/tests/test_imports.py` `NestedImportTests`: `lib/a` importing `b` resolves it
beside `a`; both files' structs are available, and for a struct both declare, `b`'s is taken first and
`a`'s replaces it with the R-IMP-004.C1 warning (C1). Files `a` and `b` importing each other both load,
with no diagnostic (C2, V1). A file imported by the block, by a nested import and again as
`kpi.mockitdown` and `./kpi.mockitdown` is loaded once (its ignored-view warning appears once), and
another mockup loads it again (C2).
