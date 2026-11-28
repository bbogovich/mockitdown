---
id: F-3.CR-5
target: F-3
kind: clarification
version: 0.12.0
date: 2026-11-27
issue: 80
summary: "Definition audit (#80): C4 made measurable; C15 and AC9 moved to R-PACK-018\nAC9 added for C9"
from: 9148452068b3
to: a349ea89c388
---

## Clauses

@ C4 replace
- Each framework pack covers as many of the framework's components as practical, so most screens of a real application can be expressed.
+ Every pack offers the whole core vocabulary of the `base` pack (134 elements, R-PACK-009), each element drawn in the pack's own style or, where the pack defines none, inherited from `base`; a pack also declares its own elements, its framework's native components and variants, so that a framework pack offers between 142 and 275 elements in all, of which 8 (the sketch pack) to 154 are its own. Packs are grouped as the example site and the gallery list them: Core, Wireframe, Desktop, Web, Mobile and Retro.
@ AC11 insert after AC3
+ In every shipped pack's Reference page (`shared/reference/<pack>.json`) all 134 `base` elements are listed and render without a diagnostic, and the elements the pack declares itself are marked as its own; the pack's total and own element counts are shown on that page.
@ N2 insert after AC11
+ The rule that stylesheet rules shared by packs are written once is a specification matter (R-PACK-018.C9 and C10), not part of the definition.
@ C15 delete
- Rules that two or more packs' stylesheets share are written once and included by every pack that uses them, so that a pack's look can be maintained in one place.
@ AC9 delete
- No run of six stylesheet lines appears in two packs' stylesheets.

## Files

(none)
