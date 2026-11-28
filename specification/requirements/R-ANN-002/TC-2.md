---
id: TC-2
title: The selection rectangle surrounds the view
verifies: [C2]
---

Browser test (Chromium) `typescript/tests/browser/annotations.spec.mjs`: a `List` of two rows with
`.dragSelect()`, rendered with the package's Node entry and put on a blank page with its stylesheet.
The visible selection rectangle lies outside the list's box on all four sides, by more than 0 and less
than 16 px, with a border wider than 0 and a translucent background colour (V1).
