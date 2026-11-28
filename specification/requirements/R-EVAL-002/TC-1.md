---
id: TC-1
title: What a block renders
verifies: [C1, C2, C3, C4]
---

Python unit tests `python/tests/test_evaluate.py` `BlockContentTests`: top-level statements and those of
`#Preview` and `#Preview("Named")` blocks render in source order, and declared structs are not rendered
when there are statements (C1). A block of declarations only renders its last struct, called without
arguments, without diagnostics; its property `title` without a default shows as `title`, `count = 3`
as `3`, while an explicit `Card()` still reports the missing argument (C2, C4, V1). An empty block, a
comment, a lone `let`, a false `if` and a lone import each produce exactly the warning "the mockup has no
views" with code `empty` (C3, V1).
