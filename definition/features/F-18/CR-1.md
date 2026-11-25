---
id: F-18.CR-1
target: F-18
kind: additive
version: 0.6.0
date: 2026-11-25
summary: "SRC-9: SwiftUI gallery defects, multi-platform chrome, macOS menu bar, meaningful samples"
from: 0311b23aa4d8
to: 93353cdfb8ad
---

## Clauses

@ meta.source
- [SRC-8]
+ [SRC-8, SRC-9]
@ C6 insert after AC4
+ Every element sample shows the element doing its job: a picker has options, a tab sits in a tab view, a split view has its columns, a chart has data suited to its kind, a presentation shows the surface it presents.
@ C7 insert after C6
+ Variants of an element keep their natural size side by side; when they are wider than the card, the card scrolls horizontally instead of squeezing them, so each variant is seen whole and none overlaps another.
@ C8 insert after C7
+ A pack whose framework spans several platforms also shows complete example applications for each: for SwiftUI an iPhone app, an iPad app and a Mac app with its menu bar and an open menu.
@ AC5 insert after C8
+ The SwiftUI pack's examples include at least one phone, one tablet and one desktop application.
@ AC6 insert after AC5
+ The browser tests fail when any two variant cells of an element card overlap.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -3 +3,5 @@
 **Change.** A test page in `typescript/` lists the packs on the left and shows the selected pack's elements and complete design patterns on the right, all as `mockitdown-mockup` components. The browser test suite (Playwright, SRC-8#clar-deps) drives the same page.
+
+**Meaningful samples (SRC-9).** Generic samples (`Picker("Label")` without options, a lone `Tab`)
+said nothing about the element. Packs can name a sample per element; the gallery lays out variants
+so each is seen whole; multi-platform packs show an example application per platform.
--- /dev/null
+++ b/usecases/UC-2.md
@@ -0,0 +1,12 @@
+---
+id: UC-2
+title: Review a multi-platform pack across phone, tablet and desktop
+---
+
+**Actor:** designer or reviewer.
+
+1. The reviewer opens the pack gallery and selects SwiftUI.
+2. The reviewer scrolls past the element cards to the examples.
+
+**Outcome:** each element card shows a meaningful sample and its variants without overlap; the
+examples show an iPhone app, an iPad app and a Mac app with its menu bar.
```
