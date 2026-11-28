---
id: R-TOOL-001
title: "The editable view: mockitdown-editor"
status: active
version: 0.13.4
rev: 6
page: WEB.4
slot: reqs
order: 1
hash: b7f6dc3c99dd
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
C10: The selection and hover outlines MUST be drawn in a layer above the rendering that changes neither its layout nor its elements' attributes, coloured by the custom properties `--mkd-selection-color` (default `#ff8a00`) and `--mkd-hover-color` (default `#2f80ed`).
C11: The TypeScript project MUST include the test page `pages/editor.html`, holding one `mockitdown-editor` over a sample mockup that nests a `Button` in a `Card` in a `List` and has a `ForEach`.
C12: When neither an enclosing `mockitdown-designer` nor its host gives it a session (R-EDIT-006.C11), the editor MUST make a session of its own over a document holding one mockup, named by its `mockup` attribute else `Mockup`, whose code is that of its first `<script type="text/mockitdown">` child (R-WEB-002.C2) and whose defaults are its fence attributes (R-WEB-002.C3), and MUST make a later change of that script's text the mockup's code through `session.setCode`.
C13: The editor MUST dispatch the notifications of a session of its own as the DOM events of R-EDIT-006.C7 and MUST NOT dispatch those of a session it joined.
C14: A click in the view on no element that carries `data-mkd-node` or `data-mkd-derived` MUST clear the selection.
C15: A click on the selected element when its node has no parent MUST select the innermost element's node again, and Esc on such a node and Enter with no child to return to MUST leave the selection unchanged.
C16: A selection change other than the editor's own climbing and returning (C6) MUST forget the children that Enter returns to.
C17: Alt-click MUST start at the innermost element when the elements under the pointer differ from those of the previous Alt-click or the selection is not the one that Alt-click made, and MUST wrap from the outermost back to the innermost.
C18: A click, an Alt-click or `select(nodeId)` in an editor whose mockup is not the session's active one MUST make that mockup active first (R-EDIT-006.C12).
C19: The outline of a node that produced no element of its own (a `ForEach`, an `if` statement or a struct call) MUST be drawn around each outermost element derived from it, and the badge of C5 MUST be shown on every outlined selected element that carries `data-mkd-derived`.
C20: The editor MUST expose its overlay layer and its selection outlines, hover outlines, tag and badge as the shadow parts `overlay`, `selection`, `hover`, `tag` and `badge`, and its rendering as the part `view`.
C21: The editor MUST expose the properties `mockup` (the name of the mockup shown), `diagnostics` (the last render's) and `rendered` (a promise as R-WEB-002.C8 defines), and MUST be focusable, with `tabindex` 0 unless the page sets one, so that it receives Esc and Enter.
V1: On `pages/editor.html`, a click on the nested button selects the button's node, a second click selects the card, Esc selects the list, Enter returns to the card, and a click on a row of the `ForEach` selects the `ForEach` and shows the derived badge.
