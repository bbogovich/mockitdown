---
id: UC-2
title: Reuse a component across the blocks of one page
---

**Actor:** page author.

1. The author writes a block marked as the page's library `cards`, declaring `struct Pill: View`.
2. Further down the page, the author writes `import "#cards"` in each block that shows pills.

**Outcome:** every block on the page uses the same `Pill`; no file outside the page is needed, and
other pages are unaffected.
