---
id: R-REND-013.CR-1
target: R-REND-013
kind: revision
version: 0.8.1
date: 2026-11-25
issue: 8
summary: "as built (#8): a deliberate overlap by negative leading margin (joined group segments, stacked avatars) is not a forbidden overlap (C5)"
from: 2da046f433b1
to: 6413f808c068
---

## Clauses

@ C5 insert after V1
+ A pack MAY overlap adjacent children of a row on purpose with a negative leading margin (the joined segments of a control group, stacked avatars); such an overlap is not one that C1–C3 forbid.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,5 +3,5 @@
 title: No overlapping siblings
-verifies: [C1, C2, C3]
+verifies: [C1, C2, C3, C5]
 ---
 
-Browser test over every pack's element samples and variants (gallery `renderAll`): for each row container, child bounding boxes pairwise do not intersect (1-pixel tolerance); repeated inside a `device=phone` frame.
+Browser test over every pack's element samples and variants (gallery `renderAll`): for each row container, child bounding boxes pairwise do not intersect (1-pixel tolerance); repeated inside a `device=phone` frame. A pair whose second child has a negative leading margin (C5) is left out. (`typescript/tests/browser/geometry.mjs`.)
--- a/prose.md
+++ b/prose.md
@@ -2 +2,8 @@
 wraps or truncates its text, and the controls keep their size.
+
+**As built.** In an `HStack`, toolbar or labelled row every child but text, spacers and fillers
+(`maxWidth: .infinity`) keeps `min-width: min-content`; text is `overflow-wrap: break-word`, so it wraps
+at word boundaries first and breaks a long word only when it must. At `fit` a `MessageBubble` takes a
+conversation's width (300 points) so that its 75 % bubble holds a short text on one line and wraps a
+long one. Segments of a control group that share a border, and avatar stacks, overlap by a negative
+margin on purpose; the geometry test leaves those pairs out.
```
