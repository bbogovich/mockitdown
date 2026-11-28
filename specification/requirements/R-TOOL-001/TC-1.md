---
id: TC-1
title: Click to locate
verifies: [C1, C3, C4, C5, C6, C7, C11, C17]
---

Browser test (Chromium, `typescript/tests/browser/editor.spec.mjs`, "TC-1: click to locate") on
`pages/editor.html`: one editor, defined by the package entry, renders the sample (a `Button` in a `Card`
in a `List` in a `VStack`, and a `ForEach` of three rows) with `data-mkd-node` in its shadow root. A
click on the button selects the button's node (`editor.session.selection`); a second click selects the
card; Esc selects the list; Enter returns to the card, and Enter again to the button. Five Alt-clicks on
the button select button, card, list, `VStack` and the button again. A click on a `ForEach` row selects
the `ForEach` node, outlines its three rows and shows the "derived" badge. `select(nodeId)` selects a
node; setting `code` changes the session's code and the rendering and keeps the selection.
