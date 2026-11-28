---
id: TC-1
title: Unbalanced brace
verifies: [C1, C2, C3, C9, C10]
---

Browser test (`sync.spec.mjs`, IT-67) on `pages/designer.html`: select `Text("Quarterly report")`; in Code
mode delete the VStack's closing `}` (offset 274) with Backspace; the session's code is unchanged at once
and becomes the broken text after the pause, with the one edit `{274, 275, ""}`; the gutter marks an error
line, the status bar does not read "0 diagnostics" and names the error; the outline keeps its rows, shows
its read-only note and `data-readonly`, and Delete there (and `session.delete()`) changes nothing; the
selection is kept. Retyping `}` parses again with the edit `{274, 274, "}"}`, the note goes, the same Text
node is selected, and Design mode renders the view without the read-only note (F-19.AC5). A second test
leaves the code view with the code broken (applied at once) and finds the editor showing the last valid
version under the note, `aria-readonly` on its view.

`node:test` (`code-sync.test.ts`, IT-67) with a stand-in code view and fake timers: eight keystrokes 50 ms
apart over "back" give nothing 299 ms after the last and, at 300 ms, one change `{25, 29, "home"}` with the
button keeping its id and its selection, one undo step that the view follows by text edits; broken code
keeps the last valid tree (`parses` false, `validCode` the old code), refuses delete, insert and drops
(`checkDrop` says why), and the retyped brace parses with the Text still selected; leaving the view
applies at once, typing back to the code applies nothing; the constants (300, `code`,
`mockitdown-caret`); the active mockup's change applies typed text to the old mockup first.
