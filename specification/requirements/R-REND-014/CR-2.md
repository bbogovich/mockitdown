---
id: R-REND-014.CR-2
target: R-REND-014
kind: clarification
version: 0.10.7
date: 2026-11-27
issue: 53
summary: "re-checked after the renderer split and the gallery spec split: unaffected (#53)"
from: eddbb178ba17
to: 0793372eb8b8
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -3 +3,3 @@
 As built, the circle's frame is laid out at its full size and the circle itself is drawn inside it, centred, at the shorter side; a stroke or shadow on a circle therefore follows the circle (C5), and the pencil-drawn Sketch pack draws its stroke and hatching on that circle instead of wobbling the outline. A `Capsule` keeps a very large corner radius, which the browser reduces to exactly half the shorter side. `.clipShape(Circle())` on content that is not square still clips to a capsule; R-REND-014 does not cover it.
+
+**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.
```
