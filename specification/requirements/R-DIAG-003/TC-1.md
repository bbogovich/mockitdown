---
id: TC-1
title: Every diagnostic uses a listed code
verifies: [C1, C2]
---

Python unit tests `python/tests/test_diagnostics.py` `CodeTests`: an AST scan of `python/src/mockitdown`
finds every diagnostic created (`error`, `warning`, `add`, `Diagnostic(…)`) with a literal code from the
list of C1; every diagnostic in the conformance corpus (`shared/conformance/*.diag.json`, which both
variants must reproduce) has a listed code; sources triggering `syntax`, `empty`, `directive`, `pack`,
`import`, `unknown`, `modifier`, `icon`, `asset` and `appearance` report exactly that code (C1, V1). The
test's list is the clause's, so a new code fails the scan until the specification lists it (C2).
