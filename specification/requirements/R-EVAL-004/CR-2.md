---
id: R-EVAL-004.CR-2
target: R-EVAL-004
kind: correction
version: 0.13.11
date: 2026-11-28
issue: 32
summary: "as built (#32): C7 element aliases and closure or view values; C8 the reads lists of shared/language/roles.json; C11 no rule, no warning; C12 the Python guard over the corpus; V2; TC-1 names the tests"
from: e19e846f658a
to: ca0c9e9355e8
---

## Clauses

@ C7 edit
~ A labelled argument of an element call is understood when its label is a name in the element definition's `params` or `defaults`, an argument alias of {+the element or +}its pack (R-PACK-011), a label its render role [-reads,-]{+reads+} [-a closure or slot label (C3, C4, C6),-]{+(C8)+} or a discarded action label [-(C5).-]{+(C5), or when its value is a closure or views (C3, C4, C6).+}
@ C8 replace
- Each variant MUST hold, for every render role, the labels that role reads, and the two variants' lists MUST be the same.
+ `shared/language/roles.json` MUST list the labels each render role reads as `reads`, at the top level those every role reads through the common element markup and in each role's rule those it reads besides, and both variants MUST take the labels of C7 from that file.
@ C11 insert after C10
+ When a role's rule lists no `reads`, or the TypeScript core has no role rules loaded, the evaluator MUST NOT report the warning of C9 for that role's elements.
@ C12 insert after C11
+ The Python test suite MUST fail when rendering the conformance corpus looks up a label on a view that neither the common `reads` nor its role's list.
@ V2 insert after C12
+ `Text("Hi", colour: .red)` warns "'colour' is not understood by Text in pack 'base'" at line 1, column 12 and still renders `Hi`; `Toggle("Wi-Fi", unheard: $on)`, `Button("Go", action: { … })`, `Button("Save", type: "primary")` in antd and `Card(cover: Image("photo.png"))` warn nothing.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,9 +3,16 @@
 title: Unknown labelled arguments
-verifies: [C7, C8, C9, C10]
+verifies: [C7, C8, C9, C10, C11, C12]
 ---
 
-Conformance cases `diag-unknown-label` (a misspelt label on a core element and on a pack element, an
-alias, a default, a slot label, an `action:` closure and a binding — only the first two warn) with their
-`diag.json`, in both suites; the order and text of the warnings are identical. `test_examples.py`, the
-pattern tests (R-WEB-004.TC-7) and `gen_reference.py --check` fail on any `argument` warning in the
-example site, the design patterns or the reference samples (F-12.AC5).
+Conformance case `diag-unknown-label` in pack antd (a misspelt label on a core element, `VStack(spacng:)`,
+and on a pack element, `Switch(chekced:)`; an element alias `type:`, a default `variant:`, a slot
+`extra: Link(…)`, an `action:` closure and a binding `onSearch: $query` — only the first two warn), its
+`diag.json` written by hand, run by `test_conformance.py` and `conformance.test.ts`; `lang-colors` now
+expects the three warnings of `Color(red:green:blue:)`. `python/tests/test_unknown_labels.py` and
+`typescript/tests/unit/unknown-labels.test.ts` (IT-60) hold the same hand-written examples (F-12.AC4,
+the understood labels of C7, the order of several warnings, struct arguments not reported), check that
+both variants read `reads` from the shared file (C8, C11: no rule, no warning) and that the reference
+samples render without the warning; the Python suite also renders the whole corpus recording every
+label each role looks up and fails on one the table omits (C12). `test_examples.py` (example site and
+its component files) and the pattern tests (R-WEB-004.TC-7) fail on any diagnostic, `gen_reference.py
+--check` on a declared sample with one (C10, F-12.AC5).
--- a/prose.md
+++ b/prose.md
@@ -15 +15,11 @@
 ```
+
+What a role reads is data in `shared/language/roles.json`, beside the role rules: a top-level `reads`
+for the labels every role reads through the common element markup (`variant`, `size`, `state`,
+`disabled`, …) and a `reads` per rule for the rest (`isOn` for a toggle, `subtitle` and `detail` for a
+list item). The lists were taken from what the Python renderer looks up, and a Python test renders the
+whole conformance corpus to keep them complete. Keeping the shipped content warning-free meant fixing
+what relied on dropped labels: SwiftUI's `destination:` became an alias of the carbon, mui, sapui5 and
+tailwind links and `item:` one of the SwiftUI `ShareLink`, mui's `Stepper` takes `value:` as its
+active step, the core patterns use `ListItem` where some packs' `Row` is a grid or table row, and the
+example site lost the labels that never had an effect.
```
