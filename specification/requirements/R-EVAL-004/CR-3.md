---
id: R-EVAL-004.CR-3
target: R-EVAL-004
kind: correction
version: 0.13.12
date: 2026-11-28
issue: 33
summary: "as built (#33): the role table's reads lists became the keys of typed params maps (top-level params for the common labels); parameterTypes and modifierTypes; a label an element's types names is understood"
from: ca0c9e9355e8
to: 6c5e39247c82
---

## Clauses

@ C7 edit
~ A labelled argument of an element call is understood when its label is a name in the element definition's `params` or `defaults`, an argument alias of the element or its pack (R-PACK-011), a label its render role reads [-(C8)-]{+(C8), a name the element definition's `types` gives a type (R-PACK-017.C3)+} or a discarded action label (C5), or when its value is a closure or views (C3, C4, C6).
@ C8 edit
~ `shared/language/roles.json` MUST list the labels each render role reads as [-`reads`,-]{+the keys of `params` (R-PACK-017.C1),+} at the top level those every role reads through the common element markup and in each role's rule those it reads besides, and both variants MUST take the labels of C7 from that file.
@ C11 edit
~ When a role's rule [-lists-]{+has+} no [-`reads`,-]{+`params`,+} or the TypeScript core has no role rules loaded, the evaluator MUST NOT report the warning of C9 for that role's elements.
@ C12 edit
~ The Python test suite MUST fail when rendering the conformance corpus looks up a label on a view that neither the common [-`reads`-]{+`params`+} nor its role's [-list.-]{+name.+}

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -13,3 +13,3 @@
 the understood labels of C7, the order of several warnings, struct arguments not reported), check that
-both variants read `reads` from the shared file (C8, C11: no rule, no warning) and that the reference
+both variants read the labels of `params` from the shared file (C8, C11: no rule, no warning); `test_types.py` and `types.test.ts` (IT-61) check that a label a pack element's `types` names is understood (C7) and that the reference
 samples render without the warning; the Python suite also renders the whole corpus recording every
--- a/prose.md
+++ b/prose.md
@@ -16,6 +16,7 @@
 
-What a role reads is data in `shared/language/roles.json`, beside the role rules: a top-level `reads`
-for the labels every role reads through the common element markup (`variant`, `size`, `state`,
-`disabled`, …) and a `reads` per rule for the rest (`isOn` for a toggle, `subtitle` and `detail` for a
-list item). The lists were taken from what the Python renderer looks up, and a Python test renders the
+What a role reads is data in `shared/language/roles.json`, beside the role rules: the keys of a
+top-level `params` for the labels every role reads through the common element markup (`variant`,
+`size`, `state`, `disabled`, …) and of a `params` per rule for the rest (`isOn` for a toggle,
+`subtitle` and `detail` for a list item); the values are their types (R-PACK-017), and a pack element
+that types a label of its own (`types`) understands it too. The lists were taken from what the Python renderer looks up, and a Python test renders the
 whole conformance corpus to keep them complete. Keeping the shipped content warning-free meant fixing
```
