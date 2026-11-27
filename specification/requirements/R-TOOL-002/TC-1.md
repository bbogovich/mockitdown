---
id: TC-1
title: Tree and selection sync
verifies: [C1, C2, C3, C4, C6, C9]
---

Browser test (`outline.spec.mjs`) on `pages/editor.html`: the tree's rows match the edit-mode
evaluation (names, labels, `#id` chips, levels, 14 px indent per level); a click in the editor on the
nested button selects its row, expanded and in view (F-19.AC3); the `ForEach` rows are italic with the
link icon and select the `ForEach`.
