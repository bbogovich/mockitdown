---
id: TC-1
title: Two cells from the same views
verifies: [C1, C2]
---

Python unit tests `python/tests/test_appearance.py` `SideBySideTests`: a SwiftUI phone mockup with
`appearance="both"` renders a stage of two cells, the light frame labelled `Light` then the dark frame
labelled `Dark`, whose frame contents are identical (C1). `page.css` makes the stage a flex row with a
gap and each cell `flex: 1 1 0`, `min-width: 0` and its own inline-size container, so each frame
shrinks to its half (C2).
