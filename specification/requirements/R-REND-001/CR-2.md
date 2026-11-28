---
id: R-REND-001.CR-2
target: R-REND-001
kind: clarification
version: 0.12.10
date: 2026-11-27
issue: 59
summary: test cases backfilled (#59)
from: f0780c3216df
to: ec9da96ece2f
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,13 @@
+---
+id: TC-1
+title: Figure, stage, cells, frames and caption
+verifies: [C1, C2, C3, C4, C5, C6, C7]
+---
+
+Python unit tests `python/tests/test_markup.py` `FigureStructureTests`: the figure's classes, `role`, `aria-label` (title, else id, else
+"<pack name> mockup") and data attributes (C1); `appearance="both"` gives `data-count="2"`, two cells, frames light
+and dark with `data-device`, `data-chrome` and the size, cell labels `Light` and `Dark` and the caption `S · T`; one
+appearance gives one cell without a label, and `device="fit"` `data-fit="true"` without a size (C2, C3, C5, V1); a
+SwiftUI phone with a sheet has the status chrome, one screen holding the views and then the presentation layer, and the
+home indicator, in that order (C4); the caption shows whichever of id and title exists and nothing with neither or with
+captions off (C6); the options' title and id win over `@Screen`'s (C7).
```
