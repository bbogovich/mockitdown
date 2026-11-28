---
id: R-EVAL-008
title: Values and operators
status: active
version: 0.12.9
rev: 1
page: LANG.2
slot: reqs
order: 8
source: [SRC-2]
realizes: [F-2]
constrained_by: [A-EVAL-1, M-VIEW-4]
reverse_engineered: true
hash: d193dd784bcb
---

C1: The evaluator MUST evaluate literals to strings, integers, floating-point numbers, booleans and `nil`; arrays to lists; dictionaries to mappings; unlabelled tuples to tuples and labelled tuples to mappings keyed by label (or position for unlabelled members).
C2: The evaluator MUST format interpolated values as: `nil`; `true`/`false`; integral floats without a fraction (`3.0` → `3`); other floats with at most six significant digits, as C's `%g` (`1.0 / 3` → `0.333333`); enum values by name; arrays as `[a, b]`; view values as empty text.
C3: The evaluator MUST evaluate `.name` to an enum value, `.name(args)` to an enum value carrying its arguments, `Type.name` and `Type.name(args)` to an enum value in namespace `Type` when `Type` is not a variable, struct or element, and `.constant(x)` to `x`.
C4: The evaluator MUST support these members: a mapping's keys; `count` and `isEmpty` on strings, arrays, tuples and mappings; `first` and `last` on arrays and tuples (`nil` when empty); `.0`, `.1`, … on tuples; and a member of an enum value as an enum value in that namespace (`.red.opacity(0.3)`).
C5: The evaluator MUST support the methods `uppercased()`, `lowercased()`, `capitalized()`, `hasPrefix(_:)` and `hasSuffix(_:)` on strings, `contains(_:)` on strings, arrays, tuples and mappings (a mapping's keys), and `joined(separator:)` on arrays and tuples (separator `""` when omitted).
C6: The evaluator MUST evaluate `+` as string concatenation when either operand is a string and as addition otherwise; `-`, `*`, comparison and equality as usual; `/` as integer division when both operands are integers; `!` and `&&` and the or-operator (two vertical bars) by truthiness with short-circuit; unary `-` on numbers only.
C7: The evaluator MUST evaluate `a...b` to the integers a through b and `a..<b` to a through b-1 when both bounds are integers, and to the list of its two bounds as floats when either is a float (a continuous range, as in `Slider(in: 0.2...0.8)`); if a bound is not a number, then it MUST report "a range needs numeric bounds" with code `value` and yield an empty list.
C8: The evaluator MUST evaluate subscripts on arrays, tuples, strings and mappings; if the index is absent or invalid, then it MUST report "subscript out of range" with code `value` and yield `nil`.
C9: The evaluator MUST evaluate a call to a name that is not a view, struct, element or view-valued variable as a call value carrying its name and arguments (for example `GridItem(.flexible())`), and a key path to `nil`.
C10: If an operator cannot be applied to its operands, a member does not exist, or a name is unknown, then the evaluator MUST report the problem with code `value` (or `unknown` for names) and yield `nil`.
V1: `"\(3.0) \(2.5) \(nil) \([1, 2])"` evaluates to `3 2.5 nil [1, 2]`; `7 / 2` is `3`; `"a" + 1` is `a1`; `[1][3]` reports `subscript out of range`.
