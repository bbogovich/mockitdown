---
id: TC-1
title: Token rules per appearance
verifies: [C1, C2, C3, C4, C5]
---

Python unit tests `python/tests/test_appearance.py` `TokenTests`, for base, fluent and mui: the
stylesheet declares `color-scheme: light` and every light token on `.mkd-pack-<id> .mkd-frame` (C1);
`color-scheme: dark` and every token of the light set overridden by the dark set on
`…[data-appearance="dark"]` (C2), on `[data-md-color-scheme="slate"] … [data-appearance="auto"]` (C3)
and on `body:not([data-md-color-scheme]) … [data-appearance="auto"]` inside
`@media (prefers-color-scheme: dark)` (C4). An `auto` figure and the stylesheet hold no script (C5).
