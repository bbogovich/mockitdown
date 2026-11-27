---
id: R-ANN-001.CR-1
target: R-ANN-001
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "overlays keep their marks (F-15.C5): C6, TC-1 (ING-1)"
from: bacce64ec962
to: d39b3d42c845
---

## Clauses

@ meta.source
- [SRC-4]
+ [SRC-4, SRC-12]
@ C6 insert after V1
+ The renderer MUST draw the marks of a view whose role is an overlay (`dialog`, `toast`, `fab`) — callouts, pointers, selections, highlights and taps — as for any other view, including when the overlay is presented through a modifier.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,9 @@
+---
+id: TC-1
+title: Callouts on overlays
+verifies: [C6]
+---
+
+Conformance cases `annotate-overlay-callouts` (a `Dialog`, a `Toast` and a floating action button each
+with `.callout(n)`, one presented through `.overlay`) in both suites: each overlay's callout mark is in
+the expected HTML. Browser test: each mark is visible and centred on its overlay's corner within 4 px.
--- a/prose.md
+++ b/prose.md
@@ -1 +1,4 @@
 Documentation often has to point at a part of a screen and then talk about it. A numbered circle on the element, matched by the same number in the prose (R-ANN-004), is the convention of manuals and design specs.
+
+**Overlays keep their marks (F-15.C5).** A dialog, a toast or a floating action button with
+`.callout(…)` draws the callout like any other element.
```
