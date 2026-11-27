---
id: F-15.CR-1
target: F-15
kind: correction
version: 0.9.0
date: 2026-11-26
summary: "overlays keep their callouts; marks inside a dialog are placed at their elements: C5, C6, AC3 (ING-1)"
from: e864f7b6a46d
to: a8cb76f1f8b4
---

## Clauses

@ meta.source
- [SRC-4]
+ [SRC-4, SRC-12]
@ C5 insert after AC2
+ Callouts and other marks attached to an overlay — a dialog, a toast or a floating action button — are drawn as on any other element.
@ C6 insert after C5
+ Marks on elements inside a dialog are placed at those elements, not at a corner of the screen.
@ AC3 insert after C6
+ A dialog and a toast with callouts show them, and a callout on a button inside a dialog sits at that button's corner.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,6 @@
 Manuals and design specifications explain screens by numbering their parts. mockitdown draws those numbers, pointers and selections as part of the mockup so they move with the layout.
+
+**Overlays keep their marks (SRC-12#s13).** A dialog, a toast or a floating action button dropped its
+own callouts, and callouts inside a dialog landed at the screen's top-left corner. An editor that lets
+a designer annotate any element must not lose them, so marks on and inside overlays are drawn where
+they belong.
```
