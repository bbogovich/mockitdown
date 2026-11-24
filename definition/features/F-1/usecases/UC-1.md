---
id: UC-1
title: Illustrate a requirement with a mockup
---

**Actor:** specification author. **Precondition:** the documentation site has the mockitdown
extension configured (F-11).

1. The author writes a requirement page and, below the requirement, a ```` ```mockitdown ```` block
   describing the screen.
2. The author adds `device="phone" title="Checkout"` to the fence.
3. The author builds the site.

**Outcome:** the page shows the requirement followed by a phone-sized, captioned mockup of the
checkout screen; the Markdown file remains the single source for both.
