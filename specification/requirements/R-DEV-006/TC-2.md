---
id: TC-2
title: A mockup in a documentation page
verifies: [C1, C2]
---

Chromium test `typescript/tests/browser/devices.spec.mjs`: a SwiftUI mockup with a label, text, code
block, keys, a table, a spreadsheet, a list, an icon, a toggle and a button, at `desktop` and at `fit`,
placed once on a bare page and once inside `<article class="md-typeset">` under host rules modelled on
Material's and Zensical's (typography, letter spacing, margins, list, table, code and key styling) and,
when the repository's `.venv` holds Zensical, under Zensical's own stylesheet: every element in the
frame has the same box (within half a pixel) and the same font, line height, letter spacing, colours,
box shadow, margin, padding, list style and text transform (C1, V1). An alert's layer lies inside the
frame, which is isolated and clips, and the page below the figure is not covered (C2).
