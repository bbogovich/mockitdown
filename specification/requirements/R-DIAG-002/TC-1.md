---
id: TC-1
title: One ordered, de-duplicated collector
verifies: [C1, C2]
---

Python unit tests `python/tests/test_diagnostics.py` `CollectorTests`: rendering a block with an unknown
element, an unknown modifier and a missing image prints nothing on standard output or error and returns
the three diagnostics in stage order (evaluation, then rendering); `evaluate` returns its collector; a
syntax error is raised by `parse` as `MockitdownSyntaxError` with code `syntax`, and `evaluate` reports it
in the collector with no screen (C1). The collector keeps the order reported and drops a diagnostic equal
in severity, message and location to an earlier one, whatever its code, through `add` and `extend` (C2);
an unknown icon inside `ForEach(1...5)` is reported once (C2, V1).
