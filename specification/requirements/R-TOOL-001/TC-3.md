---
id: TC-3
title: Sessions and edge cases
verifies: [C12, C13, C14, C15, C16, C18, C21]
---

Browser tests (`typescript/tests/browser/editor.spec.mjs`): the page's editor, with a session of its own
made from its script child, dispatches `mockitdown-select` when `select` is called; an editor given a
host session with `mockup="B"` renders mockup B, makes it active on `select`, and dispatches no event.
On the page's editor, Esc and Enter on the selected `VStack` change nothing; a click on the button with
the `VStack` selected selects the button again; a selection made through `select` forgets the trail,
so Enter changes nothing; a click on the frame outside every element clears the selection.
