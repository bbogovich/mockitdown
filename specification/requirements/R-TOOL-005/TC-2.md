---
id: TC-2
title: Outline drops and refusals
verifies: [C2, C4, C5]
---

Browser test: dropping a card in the upper, middle and lower third of a row inserts before, inside and
after it; dragging a `NavigationSplitView` card over an `HStack` row shows `not-allowed` and the
reason; dragging a card row onto its own child is refused; dragging a row after its sibling moves it,
its node id kept.
