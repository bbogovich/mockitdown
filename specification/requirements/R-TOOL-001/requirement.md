---
id: R-TOOL-001
title: "The editable view: mockitdown-editor"
status: active
version: 0.12.12
rev: 5
page: WEB.4
slot: reqs
order: 1
hash: 10c66780a060
source: [SRC-12, SRC-13]
realizes: [F-19]
requires: [R-EDIT-004, R-EDIT-006, R-WEB-002]
constrained_by: [A-WEB-5]
refs: [R-EDIT-004, R-EDIT-005, R-EDIT-006, R-WEB-002]
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
