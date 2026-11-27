---
id: F-15.CR-2
target: F-15
kind: additive
version: 0.10.0
date: 2026-11-27
summary: "SRC-18: annotations present a design in a document and are added while it is refined: N1, UC-1, UC-2"
from: a8cb76f1f8b4
to: acb4a8c2f1a7
---

## Clauses

@ meta.source
- [SRC-4, SRC-12]
+ [SRC-4, SRC-12, SRC-18]
@ N1 insert after AC3
+ Annotations are callouts for presenting a design in a document; they are added to a mockup in the designer tool or in a SpecItOut application while the design is refined (SRC-18#answers).

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -6 +6,7 @@
 they belong.
+
+**Who adds annotations, and when (SRC-18#answers).** Callouts exist for presenting a design in a
+document — a design specification, a manual, a review page. They are added while the design is refined,
+either in the mockitdown designer or in a SpecItOut application that holds the design, and are then
+shown wherever the mockup is rendered.
+
--- /dev/null
+++ b/usecases/UC-1.md
@@ -0,0 +1,13 @@
+---
+id: UC-1
+title: Present a design with numbered callouts in a document
+---
+
+**Actor:** designer writing a design specification or a manual page.
+
+1. The designer writes a mockup of the screen and attaches callouts 1 to 4 to the parts the text
+   explains, choosing a colour for them.
+2. The designer refers to (#1) to (#4) in the paragraphs around the mockup.
+
+**Outcome:** the rendered page shows the mockup with numbered circles on those parts and the same
+circles in the prose, so a reader matches each sentence to its part of the screen.
--- /dev/null
+++ b/usecases/UC-2.md
@@ -0,0 +1,14 @@
+---
+id: UC-2
+title: Annotate a mockup while refining the design
+---
+
+**Actor:** designer refining a design in the mockitdown designer or in a SpecItOut application.
+
+1. The designer selects an element of a mockup and adds a callout, a pointer, a tap or a focus
+   highlight to it, or marks a drag-selection over a group of elements.
+2. The designer saves the design.
+
+**Outcome:** the marks are part of the mockup's source; wherever the mockup is presented — the
+designer's canvas, the SpecItOut document, a Markdown page — they are drawn on the elements they belong
+to, including elements inside dialogs and other overlays.
```
