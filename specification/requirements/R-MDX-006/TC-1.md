---
id: TC-1
title: A page with mockups under instant navigation
verifies: [C1, C2]
---

Python unit tests `python/tests/test_markdown_ext.py` `InstantNavigationTests`: a converted page holds its `<style data-mockitdown>` before its
figures and no script or event-handler attribute (C1); no module mentions instant navigation (C2). With Zensical
installed (`ZENSICAL=…`), a two-page site with `navigation.instant` builds with no word about it in the build output
(C2), and the page with a mockup carries its stylesheet and figure inside `[data-md-component="content"]` — the part
instant navigation swaps in — and the same script tags as the page without mockups (C1, V1).
