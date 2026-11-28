---
id: TC-1
title: Callout references in prose
verifies: [C1, C2, C3]
---

Python unit tests `python/tests/test_annotations.py` `CalloutReferenceTests`, through Python-Markdown
with the `mockitdown` extension: `Enter the name (#1).` holds `<span class="mkd-ref">1</span>` (V1);
`(#12)` and `(#A)` become circles, while `(#123)`, `(#a)`, `(#AB)`, `(# 1)` and a bare `#1` do not;
with `callout_refs: false` nothing is converted (C1). `(#2 <colour>)` for each of the ten colours gives
`data-color="<colour>"`, which `page.css` styles, and `(#2 magenta)` is not converted (C2).
`Go to [the field](#1) and (#2).` keeps the link `<a href="#1">` and converts only `(#2)` (C3).
