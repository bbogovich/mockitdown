---
id: TC-1
title: Unbalanced brace
verifies: [C1, C2, C3]
---

Browser test (`sync.spec.mjs`) on `pages/designer.html`: select a `Text`; in Code mode delete a `}`;
after 300 ms the gutter and the status bar show a syntax diagnostic and the outline still shows the
previous tree with editing refused; retype the `}`; the view updates and the same `Text` node is still
selected (F-19.AC5); the change's edits are the one-character replacements.
