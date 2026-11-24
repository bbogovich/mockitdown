---
id: R-EVAL-006
title: ForEach
status: active
version: 0.2.0
rev: 0
page: LANG.2
slot: reqs
order: 6
source: [SRC-2]
realizes: [F-2]
constrained_by: [A-EVAL-1]
reverse_engineered: true
hash: b1651b061c24
---

C1: The evaluator MUST take `ForEach`'s data from its first argument when unlabelled or labelled `data`, and its content from an unlabelled or `content:` trailing closure or a `content:` closure argument; other arguments (such as `id:`) MUST be ignored.
C2: The evaluator MUST iterate an integer `n` as `0 … n-1`, an array or tuple as its items, a dictionary as `(key, value)` pairs, and a string as one item.
C3: The evaluator MUST evaluate the content closure once per item, binding a single parameter to the item; with two or more parameters and a tuple or array item, it MUST bind the parameters to the item's elements in order; `_` MUST bind nothing and missing elements MUST be `nil`.
C4: If the content closure is missing, then the evaluator MUST report "ForEach needs a content closure"; if the data is of another kind, then it MUST report "ForEach needs an array, a range or a count"; both with code `foreach`.
C5: If the data has more than 500 items, then the evaluator MUST render only the first 500 and warn "ForEach truncated to 500 items" with code `foreach`.
C6: A modifier applied to a `ForEach` MUST apply to every view it produced.
V1: `ForEach(team) { name, dept, online in … }` over three 3-tuples renders three rows with the tuple values; `ForEach(0..<3) { i in Text("\(i)") }` renders `0`, `1`, `2`.
