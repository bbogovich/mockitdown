---
id: R-EVAL-004.CR-1
target: R-EVAL-004
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "unknown labelled arguments are warned (F-12.C6): C7-C10, TC-1 (ING-1)"
from: e319b855a0be
to: e19e846f658a
---

## Clauses

@ meta.source
- [SRC-2]
+ [SRC-2, SRC-12]
@ meta.realizes
- [F-2, F-3]
+ [F-2, F-3, F-12]
@ C7 insert after V1
+ A labelled argument of an element call is understood when its label is a name in the element definition's `params` or `defaults`, an argument alias of its pack (R-PACK-011), a label its render role reads, a closure or slot label (C3, C4, C6), or a discarded action label (C5).
@ C8 insert after C7
+ Each variant MUST hold, for every render role, the labels that role reads, and the two variants' lists MUST be the same.
@ C9 insert after C8
+ If a labelled argument of an element call is not understood (C7) and its value is not a binding (`$name`), then the evaluator MUST report the warning "'<label>' is not understood by <Element> in pack '<id>'" with code `argument`, at the argument's location, and still render the element.
@ C10 insert after C9
+ The shipped design patterns, the reference samples and the example site MUST render without a warning of C9.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,11 @@
+---
+id: TC-1
+title: Unknown labelled arguments
+verifies: [C7, C8, C9, C10]
+---
+
+Conformance cases `diag-unknown-label` (a misspelt label on a core element and on a pack element, an
+alias, a default, a slot label, an `action:` closure and a binding — only the first two warn) with their
+`diag.json`, in both suites; the order and text of the warnings are identical. `test_examples.py`, the
+pattern tests (R-WEB-004.TC-7) and `gen_reference.py --check` fail on any `argument` warning in the
+example site, the design patterns or the reference samples (F-12.AC5).
--- a/prose.md
+++ b/prose.md
@@ -4 +4,12 @@
 understands (see the role catalogue).
+
+**Unknown labelled arguments (F-12.C6, SRC-12#s13).** A label that nothing reads — a typo such as
+`colour:` or an argument another framework has — used to vanish without a word. It is now a warning, in
+both variants, so an author learns why the argument had no effect, and the inspector lists it as "not
+understood by this pack" (R-TOOL-007.C7). Bindings (`isOn: $flag`) are exempt: pasted SwiftUI is full of
+them (R-EVAL-011), and they carry no value a mockup could show.
+
+```text
+Text("Hi", colour: .red)
+warning [argument] 'colour' is not understood by Text in pack 'base'   (line 1, col 12)
+```
```
