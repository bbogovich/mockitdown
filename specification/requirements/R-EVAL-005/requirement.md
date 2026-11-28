---
id: R-EVAL-005
title: Instantiating struct components
status: active
version: 0.13.0
rev: 2
page: LANG.2
slot: reqs
order: 5
source: [SRC-2, SRC-3]
realizes: [F-4]
constrained_by: [A-EVAL-1]
decisions: [ADR-10]
reverse_engineered: true
hash: d6426b00ade9
---

C1: When a struct is instantiated, the evaluator MUST bind labelled arguments to properties of the same name; if a label names no property, then it MUST warn "struct S has no property 'x'" with code `argument`.
C2: The evaluator MUST bind the unlabelled trailing closure to a view-typed, non-computed property that no labelled argument bound: the one named `content` if there is one, else the first in declaration order that has no default, else the first; it MUST bind each labelled trailing closure to the property of its label; if there is no such property, then it MUST warn with code `argument`.
C3: The evaluator MUST bind positional arguments, in order, to the stored properties not already bound, in declaration order.
C4: The evaluator MUST give each remaining property its default value, evaluated in the struct's own scope after the properties declared before it; a property with neither argument nor default MUST be `nil`, and if its type does not end in `?`, then the evaluator MUST report "missing argument 'x' for struct S" with code `argument`.
C5: If positional arguments remain after binding, then the evaluator MUST warn "too many arguments for struct S" with code `argument`.
C6: The evaluator MUST evaluate the struct body in a new scope holding only the struct's properties, so the caller's variables are not visible inside the body; closures passed in MUST keep the caller's scope.
C7: The evaluator MUST make each computed property a deferred view value evaluated in the struct's scope when used.
C8: If the struct has no body, then the evaluator MUST report "struct S has no `var body: some View { … }`" with code `struct` and produce no views.
C9: The evaluator MUST mark every top-level view of the body with the struct's name as its component, unless it already carries an inner component's name, and MUST record the struct in the screen's list of used components.
C10: Before instantiating a struct, the evaluator MUST decide from the declarations whether the struct can reach itself through the struct names its body, computed properties and property defaults call, directly or through other structs (block-local or imported), counting branches that do not run; if it can, then the evaluator MUST report "struct S uses itself (S → T → S)" with code `recursion`, naming the cycle, once per struct per screen, and MUST produce no views for that use, without expanding it.
C11: If struct instantiation of structs that do not reach themselves nests 48 levels deep, then the evaluator MUST report "struct S nests too deeply" with code `recursion` and produce no views.
V1: `struct Pill: View { var text: String; var color: Color = .green; var body: some View { … } }` called as `Pill(text: "On")` binds `color` to `.green`; `Pill()` reports the missing `text`; a `struct Row` whose body is `VStack { Row(); Row() }` reports one `recursion` error "struct Row uses itself (Row → Row)" at once, without expanding it.
V2: `struct Shell: View { @ViewBuilder var sidebar: some View = Text("Nav"); @ViewBuilder var content: some View; var body: some View { … } }` called as `Shell { Text("Hi") }` binds `content` to the closure and `sidebar` to its default, with no diagnostic.
