---
id: TC-1
title: Session notifications
verifies: [C1, C2, C3, C4, C5, C6, C9, C10]
---

`node:test`: a session over a two-mockup document; `apply` of an insert and of a remove each notify
one `change` with `kind: "code"` and edits that, applied in turn to the original code, give the current
code; the selection keeps a surviving node and drops a removed one; a syntax error in the code keeps the
last valid tree and notifies `diagnostics`; `nodeFor` maps each ordinal of an edit-mode render of the
mockup to a node of its tree; selecting two non-siblings is refused.
