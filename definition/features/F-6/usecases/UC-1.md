---
id: UC-1
title: Trace a control to a use case
---

**Actor:** specification author.

1. The author writes `Button("Place order").id("place-order").ref("UC-CHK-3")` and sets
   `elements="true" id="SCR-CHK-2"` on the fence.

**Outcome:** the figure is captioned `SCR-CHK-2 · …` and followed by a table row
`place-order · Button · · UC-CHK-3`; requirement text can cite `SCR-CHK-2 place-order`.
