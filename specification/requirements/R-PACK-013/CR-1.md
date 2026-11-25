---
id: R-PACK-013.CR-1
target: R-PACK-013
kind: revision
version: 0.8.4
date: 2026-11-25
issue: 10
summary: "as built: a declared sample of an element with variants is a call of it, varied with .variant (C6); declared samples are inherited and checked in every extending pack (C7); generic samples give pickers, radio groups and segmented controls options and a selection, date pickers a date, charts values, table rows cells and tabs a TabView (C8) (#10)"
from: f8a59581afb3
to: 82509851a883
---

## Clauses

@ C6 insert after C5
+ When an element with variants declares a `sample`, the sample MUST be a call of that element, and `tools/gen_reference.py` MUST build the variants sample by applying `.variant("…")` to it; otherwise it MUST fail, naming the pack and element.
@ C7 insert after C6
+ A declared `sample` MUST be inherited with its element by every pack that extends the declaring pack, and `tools/gen_reference.py` MUST check it in each of those packs as in C2.
@ C8 insert after C7
+ Where an element declares no `sample`, the generic sample of `tools/gen_reference.py` MUST give pickers, radio groups and segmented controls three options and a selection (unless a positional argument already gives a list), date pickers a selection, charts values, table rows two cells, and an element of role `tab` a place as one of two tabs inside a `TabView`.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: Declared samples
-verifies: [C1, C2, C4]
+verifies: [C1, C2, C4, C6, C7, C8]
 ---
@@ -7 +7,3 @@
 Python unit test of `gen_reference`: a declared sample is used verbatim; a declared sample with a diagnostic fails naming pack and element; `--check` passes on the shipped packs.
+
+Also: a declared sample of an element with variants that is not a call of the element fails; the variants sample is the declared sample with `.variant("…")`; every pack's reference JSON shows pickers, radio groups, segmented controls, tabs, date pickers and charts with content (IT-18, `python/tests/test_samples.py`).
--- a/TC-2.md
+++ b/TC-2.md
@@ -7 +7,3 @@
 Python test over `shared/reference/base.json`: the listed elements' samples contain the required arguments; browser gallery test asserts each chart sample draws at least one mark.
+
+IT-18: `python/tests/test_samples.py` (`BaseSampleTests`, every chart sample rendered with at least one mark) and `typescript/tests/browser/gallery.spec.mjs` ("R-PACK-013 TC-2").
--- a/prose.md
+++ b/prose.md
@@ -2 +2,17 @@
 nothing about the element (SRC-9). Packs now name a sample where the generic one is empty.
+
+A sample is mockitdown source, written in the pack's own vocabulary, for example the `base` picker:
+
+```
+Picker("Size", selection: "Medium") { Text("Small"); Text("Medium"); Text("Large") }
+```
+
+The generator takes a declared sample verbatim, so a mistake in it is reported (pack, element and the
+diagnostics) rather than quietly simplified away. An element with variants is shown once per variant by
+appending `.variant("…")` to its sample, which is why such a sample must be a call of the element itself;
+a `Tab`, which has none, may instead be shown inside a `TabView`.
+
+Samples declared by `base` travel with the core vocabulary into every pack, so they are checked in every
+pack's style. For the many framework elements that declare none, the generic sample gives the content
+their role needs — options and a selection for pickers, a date for date pickers, a `TabView` around a
+tab — so that only elements whose job the generic sample cannot show need a declaration.
```
