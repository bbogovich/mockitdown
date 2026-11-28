---
id: TC-2
title: Frame scaling in a browser
verifies: [C1, C2, C3, C4]
---

Chromium test `typescript/tests/browser/devices.spec.mjs`, mockups rendered by the package's Node entry
on a page without script: a desktop frame in a 640 px column measures 640 × 400 px and in a 1600 px or
1280 px column 1280 × 800 px, its text's padding and font size scaled by the same factor (C1, C2, V1);
with `appearance="both"` each phone frame fills its own cell at the phone's aspect ratio (C4); a `fit`
frame has `--u: 1px`, holds its content without overflow and keeps the same width in a 700 px and a
120 px column, the cell scrolling sideways (C3).
