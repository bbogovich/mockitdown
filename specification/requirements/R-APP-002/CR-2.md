---
id: R-APP-002.CR-2
target: R-APP-002
kind: clarification
version: 0.12.7
date: 2026-11-27
issue: 56
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#56)"
from: 0caba4633f1d
to: 97471928f814
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,12 @@
+---
+id: TC-1
+title: Token rules per appearance
+verifies: [C1, C2, C3, C4, C5]
+---
+
+Python unit tests `python/tests/test_appearance.py` `TokenTests`, for base, fluent and mui: the
+stylesheet declares `color-scheme: light` and every light token on `.mkd-pack-<id> .mkd-frame` (C1);
+`color-scheme: dark` and every token of the light set overridden by the dark set on
+`…[data-appearance="dark"]` (C2), on `[data-md-color-scheme="slate"] … [data-appearance="auto"]` (C3)
+and on `body:not([data-md-color-scheme]) … [data-appearance="auto"]` inside
+`@media (prefers-color-scheme: dark)` (C4). An `auto` figure and the stylesheet hold no script (C5).
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,12 @@
+---
+id: TC-2
+title: An auto frame follows the page
+verifies: [C3, C4, C5]
+---
+
+Browser tests (Chromium) `typescript/tests/browser/appearance.spec.mjs`: `auto`, `light` and `dark`
+frames rendered with the package's Node entry on a page without any script, with the base stylesheet.
+With `data-md-color-scheme="default"` on the body the auto frame's `--mkd-bg` is base's light value;
+setting the attribute to `slate` turns it to the dark value and its `color-scheme` to dark, while the
+light frame stays light, and back (C3, C5, V1). Without the attribute the auto frame follows
+`prefers-color-scheme` as the browser emulates light and dark; adding the attribute takes over (C4, C5).
```
