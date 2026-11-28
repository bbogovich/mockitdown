---
title: "Language: syntax"
spec_version: 0.13.24
status: draft
updated: 2026-11-28
page_id: LANG.1
---

# Language: syntax

The source text of a block: lexical structure, module structure, declarations, statements and expressions. The complete grammar and examples are in the [Language reference](reference.md); what the parsed code means is on [Semantics](semantics.md).

### R-LANG-001 — Lexical structure

The lexical layer is Swift's, reduced to what a declarative view description needs. Newlines are
tokens because, as in Swift, they separate statements; the parser decides where they are
insignificant (inside argument lists, before a leading-dot modifier). Keywords that only matter in
pasted Swift (`private`, `static`, `some`, `return`) are recognised so that such code parses.

**R-LANG-001.TC-1 — Comments, numbers and ranges**

**Given** the source `/* a /* nested */ comment */ Text("x") // tail` followed by a line `ForEach(0...5) { i in Text("\(i)") }`,
**when** it is tokenized, **then** the comment produces no tokens, `0...5` produces NUMBER, RANGE_CLOSED,
NUMBER, and no error is raised. **Given** `Text(%)`, **then** a syntax error "unexpected character '%'"
is raised at line 1, column 6.

Automated by `tests/test_syntax.py` (`test_comments_and_semicolons`, `test_errors_are_located`).

**Realizes.** F-2 · **Decisions.** ADR-2

| | Statement |
|---|---|
| C1 | The lexer MUST accept mockitdown source as Unicode text and report positions as 1-based line and column numbers. |
| C2 | The lexer MUST treat spaces, tabs, carriage returns and a byte-order mark as insignificant, and MUST emit each line feed as a NEWLINE token. |
| C3 | The lexer MUST skip line comments (`//` to the end of the line) and block comments (`/*` … `*/`), and block comments MUST nest. |
| C4 | If a block comment is not terminated, then the lexer MUST raise a syntax error "unterminated block comment" located at the comment's start. |
| C5 | The lexer MUST recognise identifiers as a letter or `_` followed by letters, digits or `_`, and MUST recognise a backtick-escaped identifier (`` `default` ``) as an identifier whose name is the text between the backticks. |
| C6 | The lexer MUST treat exactly these words as keywords: `import`, `struct`, `var`, `let`, `if`, `else`, `in`, `true`, `false`, `nil`, `some`, `private`, `public`, `fileprivate`, `internal`, `static`, `return`. |
| C7 | The lexer MUST recognise integer literals (digits, with `_` separators ignored) and floating-point literals (digits `.` digits); a `.` not followed by a digit MUST NOT be part of a number, so `0...5` lexes as a range. |
| C8 | The lexer MUST recognise the punctuation `..<` `...` `==` `!=` `&&` `->` `<=` `>=` `{` `}` `(` `)` `[` `]` `,` `:` `;` `.` `=` `!` `@` `#` `+` `-` `*` `/` `<` `>` `?` `\` `$` `&` and the or-operator (two vertical bars), matching the longest first. |
| C9 | If the lexer meets any other character outside a string or comment, then it MUST raise a syntax error "unexpected character" at that position. |
| V1 | A source mixing nested block comments, line comments, `_`-separated numbers, escaped identifiers and a range `0...5` tokenizes without error and with correct positions; a stray `%` is a located syntax error. |

---

### R-LANG-002 — String literals and interpolation

Strings are where most mockup content lives, so they follow Swift exactly, including interpolation
— `Text("\(count) items")` — and indented multi-line literals. Interpolated expressions are parsed
in place, so an error inside one is reported at its true line and column.

**R-LANG-002.TC-1 — Interpolation inside a closure**

**Given** `ForEach(["a", "b"]) { x in Text("Item \(x.uppercased())") }`, **when** it is parsed and
evaluated, **then** two Text views with content `Item A` and `Item B` result.

Automated by `tests/test_syntax.py::SyntaxTests::test_closure_params_and_interpolation`.

**Realizes.** F-2 · **Decisions.** ADR-2

| | Statement |
|---|---|
| C1 | The lexer MUST recognise single-line string literals delimited by `"` that do not span a line feed, and multi-line literals delimited by `"""`. |
| C2 | The lexer MUST decode the escapes `\n` `\t` `\r` `\0` `\"` `\'` `\\` and `\u{hex}`; if any other escape follows a backslash, then it MUST raise a syntax error "unknown escape". |
| C3 | The lexer MUST keep each `\( … )` interpolation as a separate part holding the enclosed source and its starting location, matching nested parentheses; an interpolation in a single-line string MUST NOT span a line feed. |
| C4 | The parser MUST parse each interpolation's source as one expression at its original location; if text remains after the expression, then it MUST raise a syntax error. |
| C5 | For a multi-line literal, the lexer MUST drop the line feed that follows the opening `"""` and the indentation of the closing delimiter's line from every line, as Swift does. |
| C6 | If a string literal or interpolation is not terminated, then the lexer MUST raise a syntax error located at its start. |
| V1 | `"Hello \(name)!"` produces a string node with parts `Hello `, an identifier expression and `!`; an unterminated `"abc` is a located syntax error. |

---

### R-LANG-003 — Module structure

A block reads like a Swift file: imports first by convention, then declarations and the views
to show. `#Preview { … }` is accepted so that an Xcode preview can be pasted as is — its contents
simply become the mockup.

**R-LANG-003.TC-1 — All top-level forms**

Automated by `tests/test_syntax.py::SyntaxTests::test_imports_directive_struct_statements` and
`test_preview_block_becomes_statements`.

**R-LANG-003.TC-2 — File import aliases**

`import "acme/cards" as Acme` parses as a file import with alias `Acme` (C8); `import SwiftUI as S` raises the syntax error of C9; `import "x" as 3` is a syntax error. Automated in the parser tests of both variants.

**Realizes.** F-2 · **Decisions.** ADR-2

| | Statement |
|---|---|
| C1 | The parser MUST parse a block's source as a module: a sequence of imports, directives, struct declarations, `#Preview` blocks and statements, in any order, separated by line feeds or `;`. |
| C2 | The parser MUST collect imports, directives, struct declarations and top-level statements separately, each in source order. |
| C3 | If two top-level constructs are on one line without `;`, then the parser MUST raise the syntax error "expected a new line or ';' between statements". |
| C4 | The parser MUST parse `import` followed by a quoted string as a file import, and `import` followed by a dotted identifier path (`import SwiftUI`, `import Foo.Bar`) as a module import. |
| C5 | If a file import's string contains an interpolation, then the parser MUST raise a syntax error. |
| C6 | The parser MUST parse a top-level `@Name` or `@Name(arguments)` that is not followed by a declaration as a directive. |
| C7 | The parser MUST parse `#Preview`, an optional argument list and a block, and MUST append the block's statements to the module's top-level statements, discarding the arguments. |
| C8 | The parser MUST parse `import "path" as Name`, `Name` an identifier, as a file import with the alias `Name`. |
| C9 | If `as` follows a module import, then the parser MUST raise the syntax error "only a file import can be renamed with `as`". |
| V1 | A module with `import SwiftUI`, `import "lib/cards"`, `@Screen(id: "S1")`, a struct, a `#Preview { … }` and a statement yields one module import, one file import, one directive, one struct and the preview's statements followed by the statement. |

---

### R-LANG-004 — Struct declarations

Components are SwiftUI view structs: stored properties become parameters, `body` is the view.
Only declarations are supported — no initialisers, methods or generics — which keeps the notation
declarative while still accepting most real view structs. Computed `some View` properties are
supported because SwiftUI code uses them to split a body into parts.

**R-LANG-004.TC-1 — Component with slot and defaults**

Automated by `tests/test_render.py::EvaluateRenderTests::test_struct_component_with_slot_and_defaults`.

**R-LANG-004.TC-2 — Optional view properties**

`@ViewBuilder var toolbar: (some View)?`, `var footer: some View?` and `var x: Content?` are view-typed and optional; `var t: String?` is neither. Automated in the parser tests of both variants.

**Realizes.** F-2, F-4 · **Decisions.** ADR-2, ADR-10

| | Statement |
|---|---|
| C1 | The parser MUST parse `struct Name [: Proto, …] { … }`, optionally preceded by attributes (`@Attr`, `@Attr(…)`) and access or `static` modifiers, as a struct declaration; the conformance list MUST be recorded and otherwise ignored. |
| C2 | The parser MUST parse each member as a property: optional attributes and modifiers, `var` or `let`, a name, an optional type annotation, an optional `= default` expression and an optional `{ block }`. |
| C3 | The parser MUST record a type annotation as the text of its tokens up to `=`, `{`, a line feed, `;` or `}` at bracket depth zero. |
| C4 | When a property named `body` has a block, the parser MUST record that block as the struct's body. |
| C5 | When any other property has a block, the parser MUST record it as a computed view property: its default is a parameterless closure over the block, it carries the attribute `computed`, and its type is `some View` when none was written. |
| C6 | A property MUST count as view-typed when it carries `@ViewBuilder` or its type, with spaces removed and one trailing `?` and enclosing parentheses ignored, is `someView`, `View`, `Content` or `AnyView`, or ends in `->someView` or `->Content`; a view-typed property whose type ends in `?` is optional. |
| C7 | If a struct member starts with `init` or `func`, then the parser MUST raise the syntax error "initializers and functions are not supported; declare properties and a `body`". |
| C8 | If a struct member is neither a property nor one of those, or the struct's closing brace is missing, then the parser MUST raise a located syntax error naming the struct. |
| C9 | Generic parameter clauses (`struct Name<T: View>`) are not part of the language; the parser MUST report them as a syntax error. |
| V1 | `struct Row: View { var title: String; var count = 0; @ViewBuilder var trailing: Content; var badge: some View { Text("x") }; var body: some View { … } }` yields four properties (one computed) and a body; adding `init() {}` is a syntax error with the message of C7. |

---

### R-LANG-005 — Statements

Control flow is limited to what a view builder allows: `if`/`else` and local `let`. Loops are
written with `ForEach`, as in SwiftUI.

**R-LANG-005.TC-1 — if/else and ranges**

Automated by `tests/test_syntax.py::SyntaxTests::test_if_else_and_ranges`.

**Realizes.** F-2 · **Decisions.** ADR-2

| | Statement |
|---|---|
| C1 | The parser MUST parse `if <expr> { … }` with an optional `else { … }` or `else if …`, where `else` may follow the closing brace on the next line. |
| C2 | The parser MUST parse an `if` condition without trailing closures, so the `{` after the condition opens the branch. |
| C3 | The parser MUST parse `let name [: Type] = expr` and `var name [: Type] = expr` as a binding statement; the type annotation MUST be ignored. |
| C4 | The parser MUST parse `return expr` as an expression statement, ignoring `return`. |
| C5 | The parser MUST parse any other statement as an expression statement. |
| C6 | Inside braces, the parser MUST separate statements by line feeds or `;`, and MUST raise "missing '}'" when the input ends first. |
| V1 | `if a { X() } else if b { Y() } else { Z() }` and `let n: Int = 3` parse; `if a { X() }` followed on the next line by `else { Y() }` attaches the else branch. |

---

### R-LANG-006 — Expressions and operators

Expressions cover what mockups need to compute labels and choose branches. The grammar is Swift's
precedence ladder without assignment, casts or custom operators.

A chained tuple index such as `t.1.1` lexes `1.1` as a number and is a syntax error; bind the inner
tuple first (`let u = t.1`, then `u.1`).

**R-LANG-006.TC-1 — Expressions, precedence and line feeds**

Python unit tests `python/tests/test_expressions.py` `ExpressionTests`, printing parsed expressions fully
parenthesised: the precedence ladder and left associativity of every binary level, nested ternaries,
prefix and postfix operators (C1, V1); line feeds after binary operators and before or after `?` and
`:` (`x` / `? "on"` / `: "off"` on three lines renders `on`), and a line feed before an operator ending
the statement (C2, V1); every primary form (C3); `$isOn` as the identifier `isOn` (C4, V1); a postfix
`!` dropped, `!a` and `!=` kept (C5); `.default`, `Font.default` and other keywords as member names
(C6); "expected an expression, found ')'" / "'*'" / "end of input" (C7); `t.0`, `t.1.count` and
`pairs[0].1` (C8). The conformance case `lang-expressions` holds the TypeScript parser to the same.

**Realizes.** F-2 · **Decisions.** ADR-2

| | Statement |
|---|---|
| C1 | The parser MUST give operators this precedence, loosest first, all binary levels left-associative: ternary `?:`; logical or (two vertical bars); `&&`; `==` `!=` `<` `>` `<=` `>=`; `...` `..<`; `+` `-`; `*` `/`; prefix `!` and `-`; postfix member access, calls, subscripts and trailing closures. |
| C2 | The parser MUST allow line feeds after a binary operator and around the `?` and `:` of a ternary. |
| C3 | The parser MUST accept as primary expressions: number, string, `true`, `false`, `nil`, an identifier, an implicit member `.name`, an array or dictionary literal, a parenthesised expression or tuple, a closure, a key path `\.a.b` or `\Type.a`, and `$name`. |
| C4 | The parser MUST parse `$name` as the identifier `name`, so a SwiftUI binding evaluates to the bound value. |
| C5 | The parser MUST ignore a postfix `!` (force unwrap) that is not followed by an identifier. |
| C6 | The parser MUST accept a keyword as a member name after `.` (as in `.default`). |
| C7 | If no primary expression can start at the current token, then the parser MUST raise "expected an expression, found …" naming the token or "end of input". |
| C8 | The parser MUST accept an unsigned integer literal as a member name after `.`, so a tuple element is written `t.0`. |
| V1 | `a or b && c == d` (with the or-operator) groups as `a or (b && (c == d))`; `x ? "on" : "off"` spans three lines; `$isOn` evaluates as `isOn`. |

---

### R-LANG-007 — Calls, modifier chains and closures

This is the core of SwiftUI's look: `VStack { … }`, `Section("Header") { … } footer: { … }`,
and modifiers stacked on their own lines. Requiring a call's `(` and a trailing closure's `{` on the
same line is what makes newline-separated statements unambiguous — the same rule Swift applies.

A dotted element name such as `Badge.Ribbon("New")` parses as one call with a dotted callee (C8); the
evaluator resolves it (R-EVAL-003.C9).

**R-LANG-007.TC-1 — Chains and labelled closures**

Automated by `tests/test_syntax.py::SyntaxTests::test_modifier_chain_across_lines` and
`test_trailing_and_labeled_closures`.

**R-LANG-007.TC-2 — Dotted callees**

Parser unit tests in both suites: `Badge.Ribbon("New")` and `Card.Meta { Text("x") }` parse as calls with a
member-access callee; `Text("a").font(.title)` still parses as a modifier chain.

Automated by `python/tests/test_syntax.py::DottedCalleeTests` and the parser tests of
`typescript/tests/unit/dotted-names.test.ts`.

**Realizes.** F-2 · **Decisions.** ADR-2

| | Statement |
|---|---|
| C1 | The parser MUST parse an argument list as `(` zero or more arguments separated by `,` `)`, each optionally labelled `label:` where the label may be an identifier or a keyword, with line feeds allowed between arguments. |
| C2 | The parser MUST treat `(` as a call only when it is on the same line as the expression it follows. |
| C3 | When a line ends and the next non-empty line starts with `.name`, the parser MUST continue the current postfix expression with that member, so modifier chains may continue on following lines. |
| C4 | The parser MUST parse a `{` on the same line after a call, an identifier, a member or an implicit member as an unlabelled trailing closure of a call. |
| C5 | After a trailing closure, the parser MUST parse each following `label: {` — on the same or a later line — as a labelled trailing closure of the same call. |
| C6 | The parser MUST parse closure parameters when the closure starts with `a, b in`, `(a, b) in`, typed parameters `a: T in`, or `_ in`; otherwise the closure has no parameters and its whole content is its body. |
| C7 | If an argument list lacks `,` or `)` between arguments, then the parser MUST raise "expected ',' or ')' in an argument list". |
| V1 | `Text("A")` newline `.font(.title)` newline `.bold()` parses as one chain; `.alert("T", isPresented: true) { Button("OK") } message: { Text("m") }` has one unlabelled and one labelled trailing closure; `ForEach(items) { name, dept in … }` has two parameters. |
| C8 | The parser MUST parse a member access whose name begins with an uppercase letter, followed on the same line by an argument list or a trailing closure (`Badge.Ribbon("New")`, `Card.Meta { … }`), as a call whose callee is that member access. |

---

### R-LANG-008 — Collection and tuple literals

Arrays of tuples are the usual way to feed `ForEach` with row data; dictionaries and labelled
tuples serve as small records.

**R-LANG-008.TC-1 — Collection and tuple literals**

Python unit tests `python/tests/test_expressions.py` `CollectionLiteralTests`: an array of two tuples, a
dictionary, entries across line feeds with a trailing comma, `[]`, `[:]` as an empty dictionary and nested
literals (C1, V1); `[1, "a": 2]` and `["a": 2, 1]` raise "a collection literal mixes array and dictionary
entries" (C2, V1); two or more expressions or any labelled ones form a tuple, across line feeds too,
while `(1 + 2)` and `((1))` are the expression itself (C3).

**Realizes.** F-2 · **Decisions.** ADR-2

| | Statement |
|---|---|
| C1 | The parser MUST parse `[a, b, …]` as an array literal and `[k: v, …]` as a dictionary literal, allowing line feeds between entries and a trailing comma; `[:]` MUST be an empty dictionary. |
| C2 | If a collection literal mixes array entries and `key: value` entries, then the parser MUST raise "a collection literal mixes array and dictionary entries". |
| C3 | The parser MUST parse a parenthesised list of two or more expressions, or of any labelled expressions (`(name: "A", age: 3)`), as a tuple literal, and a single unlabelled parenthesised expression as that expression. |
| V1 | `[("Ana", 1), ("Ben", 2)]` is an array of two tuples; `["a": 1, "b": 2]` is a dictionary; `[1, "a": 2]` is a syntax error. |

---

### R-LANG-009 — Syntax errors

Parsing is all-or-nothing for one source: a block with a syntax error cannot be rendered at all,
so the error is reported precisely instead (see R-DIAG-005 for what the page then shows).

**R-LANG-009.TC-1 — Located syntax errors**

Automated by `tests/test_syntax.py::SyntaxTests::test_errors_are_located` and
`tests/test_render.py::EvaluateRenderTests::test_syntax_error_renders_error_block`.

**Realizes.** F-2, F-12 · **Decisions.** ADR-2

| | Statement |
|---|---|
| C1 | The lexer and parser MUST stop at the first syntax error and raise it as a syntax error carrying one diagnostic with severity error, code `syntax`, the message and the location of the offending token. |
| C2 | When the source comes from a file, the diagnostic location MUST name that file. |
| C3 | Messages of the form "expected X, found Y" MUST name the found token's text, or "end of input" at the end. |
| V1 | `VStack {` reports "missing '}'" at end of input with code `syntax`; an error inside an imported file names that file. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.13.24 | 2026-11-28 | as built (#45): the parser already parsed dotted callees (C8); TC-2 names the tests |
| 0.12.9 | 2026-11-27 | test cases backfilled: TC-1 verifies C1-C3 (#58); test cases backfilled: TC-1 verifies C1-C8; prose notes chained tuple indexes (#58) |
| 0.12.0 | 2026-11-27 | SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide |
| 0.10.0 | 2026-11-26 | dotted callees parse as calls (F-2.C7): C8, TC-2 (ING-1) |
| 0.2.1 | 2026-11-24 | As built: the implementation now matches the clauses; known-deviation note removed |
| 0.2.0 | 2026-11-24 | Page created |
| 0.12.9 | 2026-11-27 | test cases backfilled: TC-1 verifies C1-C3 (#58); test cases backfilled: TC-1 verifies C1-C8; prose notes chained tuple indexes (#58) |
| 0.12.0 | 2026-11-27 | SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide |
| 0.10.0 | 2026-11-26 | dotted callees parse as calls (F-2.C7): C8, TC-2 (ING-1) |
| 0.2.1 | 2026-11-24 | As built: the implementation now matches the clauses; known-deviation note removed |
| 0.2.0 | 2026-11-24 | Page created |
