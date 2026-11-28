---
id: TC-1
title: Values and operators
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]
---

Python unit tests `python/tests/test_evaluate.py` `ValueTests`, evaluating expressions directly and
through interpolation: literals, arrays, dictionaries, `[:]`, tuples and labelled tuples keyed by label
or position (C1); `3 2.5 nil [1, 2]`, `true`, enum names, six significant digits (`0.333333`,
`1.23457e+06`) and empty text for a view (C2, V1); `.red`, `.custom("Inter", size: 12)`, `Color.red`,
`Font.custom("x")`, `.constant(5)` and a variable shadowing a namespace (C3); mapping keys, `count`,
`isEmpty`, `first`, `last` (`nil` when empty), `.1` and members of enum values (C4); `uppercased`,
`lowercased`, `capitalized`, `joined` with and without a separator, `contains`, `hasPrefix`,
`hasSuffix` (C5); concatenation, addition, integer and float division, comparison, truthiness with
short-circuit (unknown names on the skipped side are never looked up), unary minus and its error (C6,
V1); closed, half-open, empty and continuous ranges and the bound error (C7); subscripts on arrays,
tuples, strings and mappings and "subscript out of range" yielding `nil` (C8, V1); `GridItem(.flexible())`
and `URL(string:)` as call values and key paths as `nil` (C9); operator, division-by-zero, member and
name errors with codes `value` and `unknown`, each yielding `nil` (C10). The conformance case
`lang-expressions` holds both variants to the same values.
