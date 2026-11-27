---
id: F-16.CR-1
target: F-16
kind: additive
version: 0.9.0
date: 2026-11-26
summary: "role rules and typed parameters as shared data: C6-C8, AC5-AC7 (ING-1)"
from: 079014f59cbe
to: eae30e23ae52
---

## Clauses

@ meta.source
- [SRC-8]
+ [SRC-8, SRC-12]
@ C6 insert after AC4
+ The shared language data states, for every render role, its category (frame, bar, layout, collection, content and control, overlay, annotation), the child roles it accepts and how it attaches to its parent (as a child, a modifier or a presentation); a pack can narrow these rules for one of its elements.
@ C7 insert after C6
+ The shared language data states the type of every role parameter and every rendered modifier (text, number, Boolean, enumeration, colour, icon, array) and the group of each modifier, so that tools can choose a matching control; a pack can override a type for one of its elements.
@ C8 insert after C7
+ Both variants publish the role rules and the typed parameters with their other shared assets.
@ AC5 insert after C8
+ Every render role has a rule, and a test fails when a role has none.
@ AC6 insert after AC5
+ Asking whether an element may contain another gives the answer of its role unless its pack narrows it, and a refusal names its reason.
@ AC7 insert after AC6
+ Publishing the role rules and the typed parameters changes no rendered output in either variant.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -3 +3,7 @@
 **Change.** The repository becomes the home of both variants: `python/` (the existing library), `typescript/` (the web components) and `shared/` (what both publish). A shared set of reference mockups keeps the two renderers producing the same markup.
+
+**Role rules and typed parameters (SRC-12#s6.3, SRC-12#s7).** The design tools must know which
+elements may go where and which control edits each argument. Both are kept once, as shared language
+data by role, so that the 3132 element definitions need no annotation each: a pack element inherits
+the rules and types of its role, and a pack overrides them only where one of its elements differs
+(for example a Fiori object page that accepts only sections).
```
