---
id: TC-1
title: Diagnostics lead to their element
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9]
---

Browser test (`diagnostics.spec.mjs`, IT-68) on `pages/designer.html`, the active mockup given
`VStack { Text("A", bogus: 1) Bogus() }` on three lines: the count reads "2 diagnostics" with
`aria-expanded` false; activating it opens the list with two entries, the warning
"'bogus' is not understood by Text in pack 'base'" at `2:13` and the unknown element's error at `3:8`
(its call's parenthesis); a click on the first selects `Text("A", bogus: 1)` (F-19.AC7), Enter on the
second selects `Bogus()`; Esc closes the list and focuses the count. With a missing `)` the one error at
`3:1` reveals offset 20 in the code view in Code mode; fixing the code empties the open list
("No problems", "0 diagnostics"). A second test reveals the error in the docked code view without
leaving Design mode.

`node:test` (`diagnostics.test.ts`, IT-68): the same entries (index, severity, message, line, column,
`where`), none for another mockup or an empty document; `diagnosticOffset` with a code point past the
BMP, a column past the line's end and lines out of range; `diagnosticTarget` gives the Text and the
Bogus nodes, nothing for an imported file's diagnostic or one with no line; `activateDiagnostic` selects
them, and for broken code returns the range `{20, 20}` and keeps the selection; one list per
`diagnostics` notification (1, then 0 entries).
