---
id: TC-1
title: Click to locate
verifies: [C1, C3, C4, C5, C6, C7, C11]
---

Browser test (Chromium, `editor.spec.mjs`) on `pages/editor.html`: a click on the button inside the
card inside the list selects the button's node (`editor.session.selection`); a second click selects the
card; Esc selects the list; Enter returns to the card; Alt-click cycles button, card, list, root; a click
on a `ForEach` row selects the `ForEach` node and shows the badge.
