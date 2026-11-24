---
id: UC-1
title: Show a product photo in a mockup
---

**Actor:** designer. **Precondition:** `docs/assets/images/photo-2.svg` exists and `docs` is an asset
directory.

1. The designer writes `Image("assets/images/photo-2.svg").resizable().frame(width: 180, height: 120)`.

**Outcome:** the built page shows the photo inside the mockup; the page has no dependency on the
image's URL.
