---
id: TC-1
title: Interpolation inside a closure
verifies: [C3, C4]
---

**Given** `ForEach(["a", "b"]) { x in Text("Item \(x.uppercased())") }`, **when** it is parsed and
evaluated, **then** two Text views with content `Item A` and `Item B` result.

Automated by `tests/test_syntax.py::SyntaxTests::test_closure_params_and_interpolation`.
