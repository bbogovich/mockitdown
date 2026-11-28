---
id: TC-2
title: An auto frame follows the page
verifies: [C3, C4, C5]
---

Browser tests (Chromium) `typescript/tests/browser/appearance.spec.mjs`: `auto`, `light` and `dark`
frames rendered with the package's Node entry on a page without any script, with the base stylesheet.
With `data-md-color-scheme="default"` on the body the auto frame's `--mkd-bg` is base's light value;
setting the attribute to `slate` turns it to the dark value and its `color-scheme` to dark, while the
light frame stays light, and back (C3, C5, V1). Without the attribute the auto frame follows
`prefers-color-scheme` as the browser emulates light and dark; adding the attribute takes over (C4, C5).
