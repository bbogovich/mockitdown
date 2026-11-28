---
id: TC-1
title: Isolation rules
verifies: [C1, C2, C3]
---

Python unit tests `python/tests/test_devices.py` `IsolationTests`, on `shared/css/page.css`: the frame
reset sets margin, padding, border, font, letter spacing, colour, background, maximum width and box
shadow for every HTML element the renderer writes inside a frame (the conformance corpus, SVG drawing
elements and table columns aside), boxes are `border-box` and tables collapse (C1); `.mkd-frame` is
`isolation: isolate`, `overflow: hidden` and `position: relative` (C2); every selector of `page.css` and
of the base, SwiftUI and Fluent stylesheets names a mockitdown class (C3).
