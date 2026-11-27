---
id: TC-2
title: Typed controls and validation
verifies: [C2, C3, C5, C6, C7, C9, C12]
---

Browser test: each type of R-PACK-017.C2 gets its control; Add argument offers only unused labels;
Add modifier omits modifiers in the chain; `.frame(width: -10)` is shown invalid with its message and the
code is unchanged; an unknown label `bogus:` shows "not understood by this pack" and can be removed; a
duplicate `.id` is refused; two selected nodes show "2 selected".
