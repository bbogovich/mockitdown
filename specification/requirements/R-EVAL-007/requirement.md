---
id: R-EVAL-007
title: Conditionals and local bindings
status: active
version: 0.2.0
rev: 0
page: LANG.2
slot: reqs
order: 7
source: [SRC-2]
realizes: [F-2]
constrained_by: [A-EVAL-1]
reverse_engineered: true
hash: 1ceba07d0426
---

C1: The evaluator MUST evaluate `if` by the truthiness of its condition and render only the chosen branch's views; `else if` chains MUST be evaluated in order.
C2: Truthiness MUST be: `nil`, `false`, `0` and `0.0` are false; strings, arrays, dictionaries and tuples are true when non-empty; every other value is true.
C3: The evaluator MUST evaluate a ternary in view position by rendering the chosen operand's views, and in value position by returning the chosen operand's value.
C4: A `let` or `var` statement MUST bind its name in the current block's scope for the statements after it and for closures and nested blocks evaluated from them.
V1: `if items.isEmpty { Text("None") } else { List { … } }` renders the list for a non-empty array; `let n = 3` followed by `Text("\(n)")` renders `3`.
