---
id: TC-1
title: Commands and undo
verifies: [C1, C2, C4, C5, C6, C7, C10]
---

`node:test`: duplicate of `Button("A").id("ok")` yields `.id("ok-2")`, a second duplicate `ok-3`;
cut and paste into a stack and after a leaf; paste of invalid text is refused without a step;
moveUp at the first position records no step; every command undoes and redoes with the selection
restored (the AC9 check of F-19).
