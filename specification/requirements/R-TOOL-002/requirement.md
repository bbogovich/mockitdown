---
id: R-TOOL-002
title: "The outline: mockitdown-outline"
status: active
version: 0.10.8
rev: 2
page: WEB.4
slot: reqs
order: 2
hash: 8895d7d56036
source: [SRC-12, SRC-13]
realizes: [F-19]
requires: [R-EDIT-006]
constrained_by: [A-WEB-5]
refs: [F-19, R-EDIT-004, R-EDIT-006]
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
