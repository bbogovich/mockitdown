---
id: TC-2
title: Following the caret and visual edits
verifies: [C4, C5, C6, C7, C8, C10, C11]
---

Browser test (`sync.spec.mjs`, IT-67) on `pages/designer.html`: in Code mode the caret moved into
`Button("Open")` by ArrowRight selects it and its outline row; moved to line 6 before `List` it selects the
VStack, the inspector shows it, and the gallery's Add on Divider inserts `  Divider()` as the VStack's last
child, the code view following by text edits; with the caret at 100, selecting `Text("Inbox")` and then
the button marks their spans (part `span`) while the focus stays in the outline, Delete there removes the
button's line from the code view with the caret still at 100, and Cmd/Ctrl+Z restores it; in Design mode
the Dock code toggle (part `dock`, `docked`) shows the code view below the view, a Delete in the view
reaches it and typing there reaches the view; the toggle and the code are hidden in Preview mode.

`node:test` (`code-sync.test.ts`): caret events select the Button (offset 40), the VStack (9) and nothing
(53), and nothing while typed text waits; a delete elsewhere reaches the view as edits, moves past typed
text before it and replaces typed text inside it; the selection's spans `{11, 31}` and `{11, 51}` are
marked and nothing while typing waits.
