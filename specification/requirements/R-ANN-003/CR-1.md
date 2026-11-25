---
id: R-ANN-003.CR-1
target: R-ANN-003
kind: revision
version: 0.6.2
date: 2026-11-25
issue: 2
summary: "as built: portable anchor prefix from the pack id and block source, so every variant names anchors alike (#2)"
from: 669b1db20a16
to: 97a8d862e8cb
---

## Clauses

@ C5 insert after C4
+ The anchor name MUST be `--mkd-<p>-<n>`, `<p>` being the first six hexadecimal digits of the SHA-1 of the pack id, a line feed and the block source (UTF-8), and `<n>` counting the figure's decorated elements from 1 in render order.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,4 @@
 Lists, cards and scroll areas clip their content, which would cut off a callout sitting on a corner. Anchor positioning draws the marks in an unclipped layer tied to the element; the inline copy keeps older browsers working.
+
+The anchor prefix is derived from the pack and the source text alone, so every variant names anchors
+alike (ADR-18) and two different figures on one page do not collide.
```
