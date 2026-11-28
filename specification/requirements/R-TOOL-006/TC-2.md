---
id: TC-2
title: The insertion code and the session's text
verifies: [C1, C4, C6]
---

Unit test `typescript/tests/unit/sample.test.ts`: `sampleCall` keeps a sample call's arguments and
modifiers and drops its trailing closures (`List() { … }` gives `List()`, `NavigationSplitView { … }
detail: { … }` gives `NavigationSplitView()`, a modifier after the closure is kept, a closure passed as
an argument is kept), and gives `<Name>()` for a sample shown inside another element, two statements,
a `let`, a bare identifier, code that does not parse and no sample; over `shared/reference/base.json`
Button, Toggle, List and VStack give `Button("Label")`, `Toggle("Label")`, `List()` and `VStack()`.
`firstText` reads plain string literals only (not an interpolation, a label or a variable). On a
session, `setText` with the same text has no edits and no notification, a new text with quotes is
written escaped as one `change` keeping the node's id, and a node without a first text is refused
(`n3 has no text as its first argument`). All expected values were written by hand.
