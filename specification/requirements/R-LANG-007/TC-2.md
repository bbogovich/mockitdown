---
id: TC-2
title: Dotted callees
verifies: [C8]
---

Parser unit tests in both suites: `Badge.Ribbon("New")` and `Card.Meta { Text("x") }` parse as calls with a
member-access callee; `Text("a").font(.title)` still parses as a modifier chain.
