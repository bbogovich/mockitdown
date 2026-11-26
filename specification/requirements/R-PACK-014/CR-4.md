---
id: R-PACK-014.CR-4
target: R-PACK-014
kind: correction
version: 0.8.9
date: 2026-11-25
issue: 13
summary: "as built: Form .automatic is grouped on phone, tablet and fit and columns on desktop and wide, per R-DEV-010.C5 (#13)"
from: eb7aa90e53d3
to: 9eef0103a527
---

## Clauses

@ C3 edit
~ `Form` MUST render [-`.automatic`-]{+`.grouped` —+} and [-`.grouped`-]{+`.automatic`, its default, on `phone` and `tablet` forms and at `fit` —+} as inset rounded sections on the grouped background with each row's label leading and control trailing, and `.columns` [-(macOS)-]{+— and `.automatic` on `desktop` and `wide` forms (R-DEV-010.C5) —+} as two columns — trailing-aligned labels, leading-aligned controls — without section backgrounds.

## Files

(none)
