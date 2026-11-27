---
id: TC-1
title: Restructuring commands
verifies: [C1, C2, C3, C4, C5, C6, C7, C10]
---

`node:test`: wrap two sibling buttons in `HStack`; wrap a `NavigationSplitView` in a `VStack` (refused
with a reason); unwrap the stack; convert `Button("Save", role: .destructive, bogus: 1)` to a
same-role element keeping `role` and dropping `bogus`; convert to an element of another role (refused);
extract a card into `struct OrderCard: View` and replace it by `OrderCard()`; extract a row using a
`ForEach` parameter (refused). Each result renders without a new diagnostic and undoes to the original.
