---
id: R-LANG-004
title: Struct declarations
status: active
version: 0.2.0
rev: 0
page: LANG.1
slot: reqs
order: 4
source: [SRC-2, SRC-3]
realizes: [F-2, F-4]
constrained_by: [A-SYN-2]
decisions: [ADR-2, ADR-10]
reverse_engineered: true
hash: 1c78f0d2de3f
---

C1: The parser MUST parse `struct Name [: Proto, …] { … }`, optionally preceded by attributes (`@Attr`, `@Attr(…)`) and access or `static` modifiers, as a struct declaration; the conformance list MUST be recorded and otherwise ignored.
C2: The parser MUST parse each member as a property: optional attributes and modifiers, `var` or `let`, a name, an optional type annotation, an optional `= default` expression and an optional `{ block }`.
C3: The parser MUST record a type annotation as the text of its tokens up to `=`, `{`, a line feed, `;` or `}` at bracket depth zero.
C4: When a property named `body` has a block, the parser MUST record that block as the struct's body.
C5: When any other property has a block, the parser MUST record it as a computed view property: its default is a parameterless closure over the block, it carries the attribute `computed`, and its type is `some View` when none was written.
C6: A property MUST count as view-typed when it carries `@ViewBuilder` or its type, with spaces removed, is `someView`, `View`, `Content` or `AnyView`, or ends in `->someView` or `->Content`.
C7: If a struct member starts with `init` or `func`, then the parser MUST raise the syntax error "initializers and functions are not supported; declare properties and a `body`".
C8: If a struct member is neither a property nor one of those, or the struct's closing brace is missing, then the parser MUST raise a located syntax error naming the struct.
C9: Generic parameter clauses (`struct Name<T: View>`) are not part of the language; the parser MUST report them as a syntax error.
V1: `struct Row: View { var title: String; var count = 0; @ViewBuilder var trailing: Content; var badge: some View { Text("x") }; var body: some View { … } }` yields four properties (one computed) and a body; adding `init() {}` is a syntax error with the message of C7.
