---
id: TC-2
title: Keyboard, hover and the Mockups tab
verifies: [C5, C7, C8, C11, C14]
---

Browser test (Chromium, `typescript/tests/browser/outline.spec.mjs`, "TC-2: keyboard, hover and the
Mockups tab") on `pages/editor.html`: with the `VStack` row selected, Left collapses it (one visible
row) and Right expands it; Down, Down, Up select text, list, text; Right on the list and on the card
expands them; End selects the `ForEach`, Home the `VStack`; typing `Bu` selects the button. Hovering the
`Card` row sets the session's hovered node and the editor draws its `Card · W × H` tag; hovering the
button in the editor highlights exactly the button's row. The tabs read Elements and Mockups; the
Mockups tab hides the tree and lists `Mockup`, marked current. An outline given a host session over
mockups A and B with B active lists both, B marked, and shows B's rows `VStack` and `Text "second" #t2`.
