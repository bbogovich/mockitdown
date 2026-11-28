---
id: R-DEV-003.CR-1
target: R-DEV-003
kind: revision
version: 0.12.9
date: 2026-11-27
issue: 58
summary: "as built: C3 a fit frame is not capped, its cell scrolls (R-DEV-008.C1); C4 a fit frame's cell is no size container; TC-1 rules, TC-2 Chromium measurements (#58)"
from: df1ee3879f9f
to: 17d1138e28dd
---

## Clauses

@ C3 edit
~ In `fit` mode the page stylesheet MUST set `--u: [-1px`,-]{+1px` and+} size the frame to its content [-(`max-content`, capped at the column width)-]{+(`max-content`)+} with automatic [-height.-]{+height; a narrower column scrolls the cell (R-DEV-008.C1).+}
@ C4 edit
~ The figure and each cell MUST be CSS size containers (`container-type: inline-size`) so that `cqw` refers to the available column [-width.-]{+width, except a cell holding a `fit` frame, which sizes to its frame.+}

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,12 @@
+---
+id: TC-1
+title: The frame unit rules
+verifies: [C1, C2, C3, C4]
+---
+
+Python unit tests `python/tests/test_devices.py` `FrameUnitTests`, on `shared/css/page.css`: the
+`.mkd-frame` rule defines `--u: min(1px, calc(100cqw / var(--mkd-w, 1280)))` and sizes the frame
+`var(--mkd-w) × var(--u)` by `var(--mkd-h) × var(--u)`, unscaled in the assembled stylesheet (C1, C2);
+`[data-fit="true"]` sets `--u: 1px`, `max-content` width and automatic height, and the cell holding it
+`max-width: 100%`, `overflow-x: auto` and no size container (C3); `.mkd-figure` and `.mkd-cell` are
+`container-type: inline-size`, and a figure holds its frames in cells (C4).
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,12 @@
+---
+id: TC-2
+title: Frame scaling in a browser
+verifies: [C1, C2, C3, C4]
+---
+
+Chromium test `typescript/tests/browser/devices.spec.mjs`, mockups rendered by the package's Node entry
+on a page without script: a desktop frame in a 640 px column measures 640 × 400 px and in a 1600 px or
+1280 px column 1280 × 800 px, its text's padding and font size scaled by the same factor (C1, C2, V1);
+with `appearance="both"` each phone frame fills its own cell at the phone's aspect ratio (C4); a `fit`
+frame has `--u: 1px`, holds its content without overflow and keeps the same width in a 700 px and a
+120 px column, the cell scrolling sideways (C3).
```
