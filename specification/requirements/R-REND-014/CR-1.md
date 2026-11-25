---
id: R-REND-014.CR-1
target: R-REND-014
kind: revision
version: 0.8.3
date: 2026-11-25
issue: 9
summary: "as built (#9): a Circle's stroke and shadow follow the circle (C5); shapes in .background(_, in:) and .clipShape() follow C2 (C6)"
from: 032fd3dff7dc
to: eddbb178ba17
---

## Clauses

@ C5 insert after C4
+ A `Circle`'s `.stroke()` and `.shadow()` MUST be drawn on the circle of C1, not on its frame.
@ C6 insert after C5
+ A shape given to `.background(_, in:)` or `.clipShape()` MUST follow C2: `Ellipse` with radii half the width and half the height, `Capsule` with radius half the shorter side.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,5 +3,5 @@
 title: Circle in a wide frame
-verifies: [C1, C2, C3]
+verifies: [C1, C2, C3, C4, C5, C6]
 ---
 
-Python and TypeScript render tests plus a browser box check: V1 in every shipped pack (computed `border-radius` of the ellipse is 50%, the circle's box square), and the ellipse, capsule and rounded rectangle cases.
+Python and TypeScript render tests plus a browser box check: V1 in every shipped pack (computed `border-radius` of the ellipse is 50%, the circle's box square), and the ellipse, capsule and rounded rectangle cases; a stroked circle keeps its stroke on the circle (C5), and an ellipse given to `.background(_, in:)` has 50% radii (C6).
--- a/prose.md
+++ b/prose.md
@@ -1 +1,3 @@
 SwiftUI fits a circle into its frame and draws an ellipse as an ellipse; neither is ever a capsule (SRC-9, SRC-9#ellipse). The base stylesheet gave circle, ellipse and capsule the same 9999-pixel radius, so every pack drew both as capsules.
+
+As built, the circle's frame is laid out at its full size and the circle itself is drawn inside it, centred, at the shorter side; a stroke or shadow on a circle therefore follows the circle (C5), and the pencil-drawn Sketch pack draws its stroke and hatching on that circle instead of wobbling the outline. A `Capsule` keeps a very large corner radius, which the browser reduces to exactly half the shorter side. `.clipShape(Circle())` on content that is not square still clips to a capsule; R-REND-014 does not cover it.
```
