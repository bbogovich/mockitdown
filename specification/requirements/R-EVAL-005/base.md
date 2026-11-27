---
id: R-EVAL-005
title: Instantiating struct components
status: active
version: 0.2.0
rev: 0
page: LANG.2
slot: reqs
order: 5
source: [SRC-2, SRC-3]
realizes: [F-4]
constrained_by: [A-EVAL-1]
decisions: [ADR-10]
reverse_engineered: true
hash: 89e60f4b1c67
---

C1: When a struct is instantiated, the evaluator MUST bind labelled arguments to properties of the same name; if a label names no property, then it MUST warn "struct S has no property 'x'" with code `argument`.
C2: The evaluator MUST bind the unlabelled trailing closure to the first view-typed, non-computed property that no labelled argument bound, and each labelled trailing closure to the property of its label; if there is no such property, then it MUST warn with code `argument`.
C3: The evaluator MUST bind positional arguments, in order, to the stored properties not already bound, in declaration order.
C4: The evaluator MUST give each remaining property its default value, evaluated in the struct's own scope after the properties declared before it; a property with neither argument nor default MUST be `nil`, and if its type does not end in `?`, then the evaluator MUST report "missing argument 'x' for struct S" with code `argument`.
C5: If positional arguments remain after binding, then the evaluator MUST warn "too many arguments for struct S" with code `argument`.
C6: The evaluator MUST evaluate the struct body in a new scope holding only the struct's properties, so the caller's variables are not visible inside the body; closures passed in MUST keep the caller's scope.
C7: The evaluator MUST make each computed property a deferred view value evaluated in the struct's scope when used.
C8: If the struct has no body, then the evaluator MUST report "struct S has no `var body: some View { … }`" with code `struct` and produce no views.
C9: The evaluator MUST mark every top-level view of the body with the struct's name as its component, unless it already carries an inner component's name, and MUST record the struct in the screen's list of used components.
C10: If struct instantiation nests 48 levels deep, then the evaluator MUST report "struct S nests too deeply (recursive?)" with code `recursion` and produce no views.
V1: `struct Pill: View { var text: String; var color: Color = .green; var body: some View { … } }` called as `Pill(text: "On")` binds `color` to `.green`; `Pill()` reports the missing `text`; a struct that instantiates itself stops at depth 48 with a `recursion` error.
<!-- file: TC-1.md -->
---
id: TC-1
title: Component with slot and defaults
verifies: [C1, C2, C4, C9]
---

**Given** a struct with a `@ViewBuilder var content: Content` property and a defaulted property,
**when** it is called with a labelled argument and a trailing closure, **then** the closure's views
appear where the body names `content`, the default applies, and the root view carries
`data-component="<struct name>"`.

Automated by `tests/test_render.py::EvaluateRenderTests::test_struct_component_with_slot_and_defaults`.
<!-- file: prose.md -->
Components behave like SwiftUI views: memberwise arguments, defaults, a trailing closure for
content. Struct bodies are isolated from the caller's scope, as Swift's are, so a component behaves
the same wherever it is used. The recursion limit protects the build from a component that
contains itself.
