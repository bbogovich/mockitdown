---
id: R-TOOL-002
title: "The outline: mockitdown-outline"
status: active
version: 0.10.0
rev: 0
page: WEB.4
slot: reqs
order: 2
hash: 075ed9292820
source: [SRC-12, SRC-13]
realizes: [F-19]
requires: [R-EDIT-006]
constrained_by: [A-WEB-5]
---

C1: The package MUST define the custom element `mockitdown-outline`, which shows the element tree of the session's active mockup as an ARIA tree (`role="tree"`, rows `role="treeitem"` with `aria-level`, `aria-expanded` and `aria-selected`).
C2: The rows MUST follow the views of the mockup's edit-mode evaluation: one row per view produced from a view node, nested as the views are, its node found through its ordinal (R-EDIT-006.C9).
C3: A row MUST show the element name, then its main label (its first argument when that is a string), then an `#id` chip when the view carries `.id(…)`, and MUST be indented by 14 CSS pixels per level.
C4: A row of a derived view (R-EDIT-004.C5) MUST be drawn in italics with a link icon, and selecting it MUST select the node that produced it.
C5: A row with children MUST expand and collapse by its disclosure triangle and by Right and Left; Up and Down MUST move the selection between visible rows, Home and End to the first and last row, and typed characters MUST select the next row whose name starts with them.
C6: `expandTo(nodeId)` MUST expand the ancestors of the node's row and scroll the row into view, and the outline MUST call it whenever the session's selection changes.
C7: Hovering a row MUST set the session's hovered node, and the row of a node hovered elsewhere MUST be highlighted.
C8: The outline MUST have two tabs, Elements (the tree) and Mockups, the latter listing the document's mockups by name in document order with the active one marked.
C9: `pages/editor.html` MUST also hold a `mockitdown-outline` that shares the editor's session.
V1: On `pages/editor.html`, selecting the nested button in the editor expands the list and the card in the outline and selects and shows the button's row (F-19.AC3).
<!-- file: TC-1.md -->
---
id: TC-1
title: Tree and selection sync
verifies: [C1, C2, C3, C4, C6, C9]
---

Browser test (`outline.spec.mjs`) on `pages/editor.html`: the tree's rows match the edit-mode
evaluation (names, labels, `#id` chips, levels, 14 px indent per level); a click in the editor on the
nested button selects its row, expanded and in view (F-19.AC3); the `ForEach` rows are italic with the
link icon and select the `ForEach`.
<!-- file: TC-2.md -->
---
id: TC-2
title: Keyboard and hover
verifies: [C5, C7, C8]
---

Browser test: Left collapses, Right expands, Up and Down move, Home and End jump, typing `Bu` selects
the next row starting with "Bu"; hovering a row outlines its element in the editor and hovering the
element highlights the row; the Mockups tab lists the document's mockups.
<!-- file: prose.md -->
The primary means of selection (SRC-12#s5, SRC-13#p1.c2): the element tree of the active mockup, with
the row anatomy, the 14-pixel indent and the rounded selected row of the MockItOut designer's outline
(SRC-12#s15). A row reads like the code it stands for — `Button "Sign in" #submit`.

The tree follows the rendered structure, so a `ForEach` over three items shows three italic rows; each
selects the loop. Reordering rows by drag is R-TOOL-005; the Mockups tab becomes active in R-TOOL-013.
