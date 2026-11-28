---
id: TC-2
title: Outline drops and refusals
verifies: [C1, C2, C4, C5, C8, C9, C10, C12]
---

Browser test: dropping a card in the upper, middle and lower third of a row inserts before, inside and
after it; dragging a `NavigationSplitView` card over an `HStack` row shows `not-allowed` and the
reason; dragging a card row onto its own child is refused; dragging a row after its sibling moves it,
its node id kept.

As built (#30): `typescript/tests/browser/drag-drop.spec.mjs` on the same fixture: the `Text`,
`Divider` and `Text` cards dropped in the upper, middle and lower third of the `HStack` row (its
`data-drop` `before`, `inside`, `after`) give the hand-written code after each drop, the new node
selected, three changes in all. The `NavigationSplitView` card over the HStack row's middle third
marks it `inside refused`, shows `not-allowed` and "A frame cannot be placed inside a horizontal
stack" by the pointer, and drops nothing; the HStack row dragged onto its `Left` button's row shows
"Cannot move HStack into one of its own descendants"; the `Second` row dropped in the HStack row's
lower third moves after it, its node id kept and selected, in one change. The session API (C8 to C10:
positions, checks through a `ForEach`, refusals, one change per drop) is also tested in
`typescript/tests/unit/design-session.test.ts` with hand-written expectations.
