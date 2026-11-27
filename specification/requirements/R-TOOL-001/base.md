---
id: R-TOOL-001
title: "The editable view: mockitdown-editor"
status: active
version: 0.10.0
rev: 0
page: WEB.4
slot: reqs
order: 1
hash: b41eac245921
source: [SRC-12, SRC-13]
realizes: [F-19]
requires: [R-EDIT-004, R-EDIT-006, R-WEB-002]
constrained_by: [A-WEB-5]
---

C1: The package MUST define the custom element `mockitdown-editor`, which renders one mockup of its session — the one its `mockup` attribute names, else the active mockup — with the `edit` option (R-EDIT-004) and the mockup's options (R-EDIT-005.C9) into its open shadow root.
C2: The editor MUST resolve imports and image paths as the mockup element does, with the `import-base` and `asset-base` attributes (R-WEB-002.C3).
C3: The editor MUST expose the properties `code` (the mockup's code, set through the session) and `session`, and the method `select(nodeId)`.
C4: A click in the view MUST select the view node of the innermost element under the pointer that carries `data-mkd-node`, mapped through `session.nodeFor` (R-EDIT-006.C9).
C5: A click on an element that carries `data-mkd-derived` MUST select the node its `data-mkd-derived` names, and the editor MUST show a "derived" badge on the element.
C6: A second click on the selected element, or Esc, MUST move the selection to the parent view node, and Enter MUST move it back to the child it came from.
C7: Alt-click MUST cycle the selection through the view nodes of every element under the pointer, innermost first.
C8: Hovering an element MUST set the session's hovered node and draw a hover outline around the element with a tag holding its element name and its size in CSS pixels (`Button · 88 × 32`); a node hovered in another component MUST be outlined the same way.
C9: The editor MUST outline every element of the selected nodes with the selection outline and scroll the first into view when the selection changes.
C10: The selection and hover outlines MUST be drawn in a layer above the rendering that changes neither its layout nor its elements' attributes, coloured by the custom properties `--mkd-selection-color` (default `#ff8a00`) and `--mkd-hover-color`.
C11: The TypeScript project MUST include the test page `pages/editor.html`, holding one `mockitdown-editor` over a sample mockup that nests a `Button` in a `Card` in a `List` and has a `ForEach`.
V1: On `pages/editor.html`, a click on the nested button selects the button's node, a second click selects the card, Enter returns to the button, and a click on a row of the `ForEach` selects the `ForEach` and shows the derived badge.
<!-- file: TC-1.md -->
---
id: TC-1
title: Click to locate
verifies: [C1, C3, C4, C5, C6, C7, C11]
---

Browser test (Chromium, `editor.spec.mjs`) on `pages/editor.html`: a click on the button inside the
card inside the list selects the button's node (`editor.session.selection`); a second click selects the
card; Esc selects the list; Enter returns to the card; Alt-click cycles button, card, list, root; a click
on a `ForEach` row selects the `ForEach` node and shows the badge.
<!-- file: TC-2.md -->
---
id: TC-2
title: Overlays
verifies: [C2, C8, C9, C10]
---

Browser test: hovering the button shows a tag `Button · W × H` matching its bounding box; the selection
outline's colour follows `--mkd-selection-color`; the rendered elements' attributes and bounding boxes
are the same with and without a selection; a mockup importing a component through `import-base` renders.
<!-- file: prose.md -->
The view of SRC-13#p1.c4 for one mockup. A click is a quick way to *locate* an element: it selects
the innermost element under the pointer, and a second click or Esc climbs to the parent, because a click
on a button's label could mean the label, the button, the stack or the card around it (SRC-12#s5). The
outline remains the primary means of selection.

Elements that a loop, a condition or a component produced select the construct they came from and show a
"derived" badge, because editing them means editing that construct.
