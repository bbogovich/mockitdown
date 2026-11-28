---
id: R-EVAL-005.CR-3
target: R-EVAL-005
kind: correction
version: 0.13.1
date: 2026-11-28
issue: 84
summary: "as built (#84): C10 names where the error is reported (first use), the first cycle in source order, own-property names not counted, no used-component entry; TC-3 names its tests; prose explains cycle detection"
from: d6426b00ade9
to: 861a9a52c917
---

## Clauses

@ C10 edit
~ Before instantiating a struct, the evaluator MUST decide from the declarations whether the struct can reach itself through the struct names its body, computed properties and property defaults call, directly or through other structs (block-local or imported), counting branches that do not [-run;-]{+run and not counting a bare name that is one of the struct's own properties;+} if it can, then the evaluator MUST report "struct S uses itself (S → T → S)" with code `recursion`, naming the [-cycle,-]{+first cycle found in source order, at its first use only,+} once per struct per screen, and MUST produce no views for that use, without expanding [-it.-]{+it or recording it among the used components.+}

## Files

```diff
--- a/TC-3.md
+++ b/TC-3.md
@@ -13,2 +13,2 @@
 
-Automated in both variants (Python `tests/`, TypeScript `tests/unit/`); the implementer names the tests here.
+Automated in both variants: Python `tests/test_evaluate.py::SelfEmbeddingTests` (`test_cycles_report_once_and_render_nothing`, `test_reported_once_per_struct_per_screen`, `test_cycle_through_defaults_and_computed_properties`, `test_deep_chain_reports_nests_too_deeply`); TypeScript `tests/unit/evaluate.test.ts` ("self-embedding components report one recursion error naming the cycle and render nothing (R-EVAL-005 TC-3, C10)", "a chain of 49 distinct structs nests too deeply (R-EVAL-005 TC-3, C11)"). Both also check a cycle through a property default and through a computed property, and that a second use reports nothing more.
--- a/prose.md
+++ b/prose.md
@@ -2,3 +2,7 @@
 content. Struct bodies are isolated from the caller's scope, as Swift's are, so a component behaves
-the same wherever it is used. The recursion limit protects the build from a component that
-contains itself.
+the same wherever it is used. A component cannot contain itself: recursion is not valid for a UI component, and a struct that
+uses itself twice would otherwise expand exponentially. The evaluator decides this from the
+declarations before expanding anything (a depth-first search over the struct-use graph), so
+`struct Row` with `VStack { Row(); Row() }` is reported at once as "struct Row uses itself
+(Row → Row)" and the rest of the mockup still renders. The 48-level depth limit remains only as a
+backstop for a long chain of distinct structs.
```
