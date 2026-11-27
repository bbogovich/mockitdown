---
id: R-EVAL-003
title: Name resolution for views
status: active
version: 0.2.0
rev: 0
page: LANG.2
slot: reqs
order: 3
source: [SRC-2]
realizes: [F-2, F-3, F-4]
constrained_by: [A-EVAL-1, A-PACK-1]
reverse_engineered: true
hash: 67f4fcecc197
---

C1: When a call `Name(…)` appears where views are expected, the evaluator MUST resolve `Name` in this order: `ForEach`; a struct declared in the block or imported; a variable in scope (calling a view-valued property such as `content()`); an element of the selected pack.
C2: If none matches, then the evaluator MUST report the error "'Name' is not an element of pack '<id>' and no struct of that name is declared or imported" with code `unknown`, and MUST produce an `unknown` view named `Name` whose children are the views of its unlabelled trailing closure.
C3: When a bare identifier appears where views are expected, the evaluator MUST use the variable of that name if one is in scope, else call the struct or element of that name with no arguments; if neither exists, then it MUST report "unknown view or variable" with code `unknown` and produce an `unknown` view.
C4: When a string or number literal, or an interpolated string, appears where views are expected, the evaluator MUST produce a `Text` element with that content.
C5: When a variable holding a string or number is used where views are expected, the evaluator MUST produce a `Text` element with its value; a variable holding `nil` MUST produce no view.
C6: When `Color.<name>` appears where views are expected, the evaluator MUST produce a `Color` element with that colour.
C7: When a member access without parentheses (`view.modifier`) appears where views are expected, the evaluator MUST treat it as a modifier call with no arguments.
C8: If an expression that cannot produce views appears where views are expected, then the evaluator MUST report "this expression does not produce a view" with code `view`.
V1: With a struct `Card` declared in the block, `Card("x")` instantiates the struct even when the pack also has a `Card` element; `Foo()` with no such struct or element is an `unknown` error and an `unknown` view.
<!-- file: TC-1.md -->
---
id: TC-1
title: Unknown element renders a placeholder
verifies: [C2]
---

**Given** `VStack { Foo { Text("in") } }` in the base pack, **when** it is rendered, **then** the
result has one error with code `unknown`, and the HTML contains `<div class="mkd-unknown" data-el="Foo">`
holding the name `Foo` and the `Text` child.

Automated by `tests/test_render.py::EvaluateRenderTests::test_unknown_element_is_an_error_but_renders`.
<!-- file: prose.md -->
Structs shadow pack elements, so a site can override a pack's element with its own component of
the same name. Literals render as text so that `"Hello"` on its own line is a valid view, as in
a SwiftUI `ViewBuilder`.
