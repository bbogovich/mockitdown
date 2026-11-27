---
id: TC-1
title: Variant change and undo
verifies: [C1, C4, C8]
---

Browser test (`inspector.spec.mjs`) on `pages/designer.html`: select a `Button` with declared variants;
the variant choice lists exactly those; choosing another changes the code's `.variant(…)` and the
rendered class within 500 ms; Undo restores both (F-19.AC4). Typing a label in the text field forms one
undo step.
