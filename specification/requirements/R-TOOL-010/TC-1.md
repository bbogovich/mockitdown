---
id: TC-1
title: Diagnostics lead to their element
verifies: [C1, C2, C3, C4]
---

Browser test on `pages/designer.html`: a mockup with `Text("A", bogus: 1)` and an unknown element shows
two entries; activating the status count opens the list; activating the first entry selects the `Text`
(F-19.AC7); with a syntax error, activating its entry reveals the location in the code view; fixing the
code empties the list ("No problems").
