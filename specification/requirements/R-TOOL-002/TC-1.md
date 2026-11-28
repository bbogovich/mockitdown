---
id: TC-1
title: Tree and selection sync
verifies: [C1, C2, C3, C4, C6, C9, C10, C12]
---

Browser test (Chromium, `typescript/tests/browser/outline.spec.mjs`, "TC-1: tree and selection sync")
on `pages/editor.html`, whose sample nests `Button("Open").id("open")` in a `Card` in a `List` under a
`VStack` and has a `ForEach` of three `Text` rows: the page's one outline, defined by the package
entry, is an ARIA tree sharing the editor's session. Before any selection the visible rows are
`VStack` (expanded), `Text "Inbox"` and `List` (collapsed). A click in the editor on the nested button
expands the list and the card and selects the button's row, which lies inside the tree's scrolling
box; the nine visible rows then match, by level, name, label, `#id` chip, italics, link icon,
`aria-expanded` and `aria-selected`, the list written by hand from the source; the disclosure triangles
lie 14 px further right per level. A click on the `Beta` row selects the `ForEach` and all three of its
rows show as selected; a click on the `Card` row selects the card.
