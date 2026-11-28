---
id: TC-2
title: Keyboard, clipboard and multi-select
verifies: [C3, C8, C9, C14]
---

Browser test (`typescript/tests/browser/commands.spec.mjs`, IT-64) on `pages/designer.html` with the
clipboard granted, over the sample's Inbox mockup: in the outline, Shift-click selects the title and the
list, Cmd/Ctrl-click toggles the title off and on, a Cmd/Ctrl-click on the VStack (no sibling) replaces
the selection; in the view, Shift-click from the card's text to its button selects both, Cmd/Ctrl-click
toggles the button, a Cmd/Ctrl-click on the title replaces the selection. With the card selected,
Cmd/Ctrl+C puts exactly `fixtures/copied-card.mockitdown` (written by hand) on the clipboard; a Python
test (`python/tests/test_clipboard.py`) renders that text in a `mockitdown` fence with no diagnostic
(F-19.AC10). Cmd/Ctrl+D duplicates the card (`open-2`), Cmd/Ctrl+X cuts it and Cmd/Ctrl+V pastes it
after the ForEach, Alt+Down and Alt+Up move the title below the list and back, each against hand-written
code; Cmd/Ctrl+D in the gallery's search field changes nothing. With `readText` refusing, Cmd/Ctrl+C then
Cmd/Ctrl+V on the title pastes the designer's own copy after it.
