---
id: TC-1
title: Restructuring commands
verifies: [C1, C2, C3, C4, C5, C6, C7, C10, C11, C12]
---

`node:test` (`typescript/tests/unit/restructure.test.ts`, IT-65), every expected code written by hand:
wrap two sibling buttons in `HStack` (ids kept, the stack selected); wrap a `NavigationSplitView` in a
`VStack` (refused: "A frame cannot be placed inside a vertical stack"), a button in `Text` and in `List`,
a lowercase name and nothing selected (refused); unwrap `HStack(spacing: 4) { … }.padding().id("row")`
back to its two buttons, selected, and a wrap then unwrap to the original; unwrap a leaf, a `GridRow`
in a `Grid`, a `ForEach` and a stack with a `let` (refused); in vuetify, convert
`Button("Save", role: .destructive, bogus: 1)` to `VBtn` keeping `role` and dropping `bogus`, selected,
and `Button("Go", "extra") {}` to `VBtn("Go") {}`; convert to `Text`, to an unknown name and with two
nodes selected (refused); extract a card into `struct OrderCard: View` before the first view and
replace it by `OrderCard()`, and two texts after the last struct; extract under a struct's name, a pack
element's, a lowercase name and a name the mockup already calls, a row using a `ForEach` parameter, a
`ForEach` using a top-level `let` and nothing selected (refused). Each result renders without a new
diagnostic, is one step and undoes to the original with the selection restored.
