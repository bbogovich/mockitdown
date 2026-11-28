---
id: TC-1
title: Evaluation always completes
verifies: [C1, C2, C3]
---

Python unit tests `python/tests/test_evaluate.py` `CompletionTests`: `evaluate` turns a module into a
`Screen` with its views, the pack chosen by `import SwiftUI`, the `@Screen` metadata and the structs
used, as data (C1). Sixteen sources with semantic problems (unknown elements, names, modifiers and
directives, bad `ForEach`, out-of-range subscripts, missing arguments, recursion, bad operators) each
yield a screen and diagnostics, never an exception (C1, C2). An unknown element renders as an `unknown`
view holding its trailing closure's views and an unknown name as `nil` text, and a block with one
unknown element and one unknown modifier keeps every other view with one error and one warning
(C2, V1). Statements run in order (a `let` rebinds for what follows), an `if` branch's `let` shadows
without leaking, a closure parameter shadows an outer name, and a struct's body does not see the
block's names (C3).
