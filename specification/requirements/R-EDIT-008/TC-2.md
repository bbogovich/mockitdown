---
id: TC-2
title: Keyboard, clipboard and multi-select
verifies: [C3, C8, C9]
---

Browser test on `pages/designer.html` with a granted clipboard: Shift-click selects a range of rows,
Cmd/Ctrl-click toggles one, a click on a non-sibling replaces the selection; Cmd/Ctrl+C puts the
selected text on the clipboard; a Python test renders that text in a `mockitdown` fence without a
diagnostic (F-19.AC10); Alt+Down moves the selection.
