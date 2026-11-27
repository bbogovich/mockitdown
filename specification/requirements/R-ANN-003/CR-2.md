---
id: R-ANN-003.CR-2
target: R-ANN-003
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "marks inside a dialog are placed at their views (F-15.C6): C6, TC-1 (ING-1)"
from: 97a8d862e8cb
to: d2b8478a1a2a
---

## Clauses

@ meta.source
- [SRC-4]
+ [SRC-4, SRC-12]
@ C6 insert after V1
+ A mark on a view inside a dialog MUST be drawn at that view, in browsers with and without CSS anchor positioning; the fallback layer of C2 MUST be positioned within the dialog, not within the screen.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,10 @@
+---
+id: TC-1
+title: Marks inside a dialog
+verifies: [C6]
+---
+
+Conformance case `annotate-dialog-contents` (a callout on a button inside a `Dialog`) in both suites.
+Browser test (Chromium): the callout's centre lies within 4 px of the button's top-left corner, once
+with anchor positioning and once with the fallback layer forced (anchor positioning disabled through
+the stylesheet's `@supports` branch).
--- a/prose.md
+++ b/prose.md
@@ -4 +4,5 @@
 alike (ADR-18) and two different figures on one page do not collide.
+
+**Marks inside a dialog (F-15.C6).** A dialog is its own decoration context: the marks of its
+contents are positioned against the dialog, so a callout on a dialog's button sits on that button rather
+than at the screen's top-left corner.
```
