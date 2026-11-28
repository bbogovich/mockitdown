---
id: TC-1
title: The frame unit rules
verifies: [C1, C2, C3, C4]
---

Python unit tests `python/tests/test_devices.py` `FrameUnitTests`, on `shared/css/page.css`: the
`.mkd-frame` rule defines `--u: min(1px, calc(100cqw / var(--mkd-w, 1280)))` and sizes the frame
`var(--mkd-w) × var(--u)` by `var(--mkd-h) × var(--u)`, unscaled in the assembled stylesheet (C1, C2);
`[data-fit="true"]` sets `--u: 1px`, `max-content` width and automatic height, and the cell holding it
`max-width: 100%`, `overflow-x: auto` and no size container (C3); `.mkd-figure` and `.mkd-cell` are
`container-type: inline-size`, and a figure holds its frames in cells (C4).
