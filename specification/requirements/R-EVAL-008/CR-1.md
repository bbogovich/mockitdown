---
id: R-EVAL-008.CR-1
target: R-EVAL-008
kind: revision
version: 0.12.9
date: 2026-11-27
issue: 58
summary: "as built: C2 floats with six significant digits (%g), C5 contains/hasPrefix/hasSuffix, C7 continuous ranges and the numeric-bounds error; TC-1 verifies C1-C10 (#58)"
from: 38eaa46202ff
to: d193dd784bcb
---

## Clauses

@ C2 edit
~ The evaluator MUST format interpolated values as: `nil`; `true`/`false`; integral floats without a fraction (`3.0` → `3`); other floats [-in-]{+with+} [-shortest-]{+at+} [-form;-]{+most six significant digits, as C's `%g` (`1.0 / 3` → `0.333333`);+} enum values by name; arrays as `[a, b]`; view values as empty text.
@ C5 edit
~ The evaluator MUST support the methods `uppercased()`, [-`lowercased()`-]{+`lowercased()`, `capitalized()`, `hasPrefix(_:)`+} and [-`capitalized()`-]{+`hasSuffix(_:)`+} on [-strings-]{+strings, `contains(_:)` on strings, arrays, tuples and mappings (a mapping's keys),+} and `joined(separator:)` on [-arrays.-]{+arrays and tuples (separator `""` when omitted).+}
@ C7 edit
~ The evaluator MUST evaluate `a...b` to the integers a through b and `a..<b` to a through [-b-1;-]{+b-1 when both bounds are integers, and to the list of its two bounds as floats when either is a float (a continuous range, as in `Slider(in: 0.2...0.8)`);+} if [-either-]{+a+} bound is not [-an-]{+a+} [-integer,-]{+number,+} then it MUST report "a range needs [-integer-]{+numeric+} bounds" with code [-`value`.-]{+`value` and yield an empty list.+}

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,20 @@
+---
+id: TC-1
+title: Values and operators
+verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]
+---
+
+Python unit tests `python/tests/test_evaluate.py` `ValueTests`, evaluating expressions directly and
+through interpolation: literals, arrays, dictionaries, `[:]`, tuples and labelled tuples keyed by label
+or position (C1); `3 2.5 nil [1, 2]`, `true`, enum names, six significant digits (`0.333333`,
+`1.23457e+06`) and empty text for a view (C2, V1); `.red`, `.custom("Inter", size: 12)`, `Color.red`,
+`Font.custom("x")`, `.constant(5)` and a variable shadowing a namespace (C3); mapping keys, `count`,
+`isEmpty`, `first`, `last` (`nil` when empty), `.1` and members of enum values (C4); `uppercased`,
+`lowercased`, `capitalized`, `joined` with and without a separator, `contains`, `hasPrefix`,
+`hasSuffix` (C5); concatenation, addition, integer and float division, comparison, truthiness with
+short-circuit (unknown names on the skipped side are never looked up), unary minus and its error (C6,
+V1); closed, half-open, empty and continuous ranges and the bound error (C7); subscripts on arrays,
+tuples, strings and mappings and "subscript out of range" yielding `nil` (C8, V1); `GridItem(.flexible())`
+and `URL(string:)` as call values and key paths as `nil` (C9); operator, division-by-zero, member and
+name errors with codes `value` and `unknown`, each yielding `nil` (C10). The conformance case
+`lang-expressions` holds both variants to the same values.
```
