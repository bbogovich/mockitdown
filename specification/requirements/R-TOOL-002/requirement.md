---
id: R-TOOL-002
title: "The outline: mockitdown-outline"
status: active
version: 0.13.5
rev: 5
page: WEB.4
slot: reqs
order: 2
hash: 6463c709b1bf
source: [SRC-12, SRC-13]
realizes: [F-19]
requires: [R-EDIT-006]
constrained_by: [A-WEB-5]
refs: [F-19, R-EDIT-004, R-EDIT-006]
---

C1: The package MUST define the custom element `mockitdown-outline`, which shows the element tree of the session's active mockup as an ARIA tree (`role="tree"`, rows `role="treeitem"` with `aria-level`, `aria-expanded` and `aria-selected`).
C2: The rows MUST follow the views of the mockup's edit-mode evaluation: one row per view produced from a view node or derived from one (R-EDIT-004.C4, C5), nested as the views are, its node found through its ordinal (R-EDIT-006.C9); a view that is neither MUST get no row, its children taking its place.
C3: A row MUST show the element name, then its main label (its first argument when that argument is positional and its value a string), then an `#id` chip when the view carries `.id(…)`, and MUST be indented by 14 CSS pixels per level.
C4: A row of a derived view (R-EDIT-004.C5) MUST be drawn in italics with a link icon, and selecting it MUST select the node that produced it.
C5: A row with children MUST expand and collapse by its disclosure triangle and by Right and Left; Up and Down MUST move the selection between visible rows, Home and End to the first and last visible row, and typed characters MUST select the next visible row whose name starts with them.
C6: `expandTo(nodeId)` MUST expand the ancestors of every row of the node and scroll the first into view, and the outline MUST call it for each selected node whenever the session's selection changes and after its rows are rebuilt.
C7: Hovering a row MUST set the session's hovered node, and the row of a node hovered elsewhere MUST be highlighted.
C8: The outline MUST have two tabs, Elements (the tree) and Mockups, the latter listing the document's mockups by name in document order with the active one marked by `aria-current="true"`.
C9: `pages/editor.html` MUST also hold a `mockitdown-outline` that shares the editor's session.
C10: Rows of the first level MUST start expanded and deeper rows collapsed, and a row MUST keep its expansion when the rows are rebuilt while its nodes keep their ids.
C11: Right on an expanded row MUST select its first child and Left on a collapsed row or a row without children MUST select its parent row; characters typed within 600 milliseconds of each other MUST form one search, a new search starting after the current row.
C12: Every row whose node is selected MUST carry `aria-selected="true"`, so that all the rows of a `ForEach` are selected with it, and the tree MUST keep the keyboard focus on itself and name the current row by `aria-activedescendant`.
C13: The outline MUST join a session as R-EDIT-006.C11 says, making a session of its own over an empty document when none is given, and MUST dispatch the notifications of a session of its own as the DOM events of R-EDIT-006.C7 and MUST NOT dispatch those of a session it joined.
C14: The outline MUST rebuild its rows after every `change` of the active mockup other than a move and after an `active` notification, and MUST keep its last rows when the mockup does not evaluate.
C15: The outline MUST expose the properties `rows` (every row in document order) and `rendered` (a promise that resolves once the rows are up to date), the shadow parts `tabs`, `tab`, `tree`, `row`, `twisty`, `link`, `name`, `label`, `chip`, `mockups` and `mockup`, and the custom properties `--mkd-outline-selected-background` and `--mkd-outline-hover-background` for the row colours.
V1: On `pages/editor.html`, selecting the nested button in the editor expands the list and the card in the outline and selects and shows the button's row (F-19.AC3).
