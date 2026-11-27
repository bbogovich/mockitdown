---
id: TC-2
title: Dotted element names
verifies: [C9, C10]
---

Conformance cases `eval-dotted-names` in both suites: in a pack with `BadgeRibbon`, `Badge.Ribbon("New")`
renders the same element as `BadgeRibbon("New")` with `data-el="Badge.Ribbon"`; `Color.red` still makes a
colour; `Nope.Thing()` is an `unknown` error naming `Nope.Thing`; a `let` named `Badge` makes
`Badge.Ribbon` a member access, not a dotted name.
