---
id: TC-1
title: The error box
verifies: [C1, C2, C3, C4]
---

Python unit tests `python/tests/test_diagnostics.py` `ErrorBoxTests`: a block with one unknown element
and one unknown modifier starts with `div.mkd-error[role=alert]`, its `div.mkd-error__title` reading
`mockitdown: 1 error` and one escaped list item, before the figure (C1, C2, C3, V1); with `show_warnings`
the same title and two items, and a block with only a warning is titled `mockitdown: warnings` (C2, C3,
V1); two unknown elements give `mockitdown: 2 errors` (C2). A clean block, and a block with only warnings
when they are not shown, starts with the figure and has no box (C4).
