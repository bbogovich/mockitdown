---
id: TC-2
title: The Installation steps build a page
verifies: [C2, C3]
---

`python/tests/test_examples.py` (with Zensical installed): extracts the Installation page's Python configuration block and first page into a temporary directory, runs `zensical build` and finds a rendered mockup figure in the built page (C2). A browser test serves a temporary directory holding `dist/` and the Installation page's HTML snippet and finds a rendered `mockitdown-mockup` with no diagnostic (C3).
