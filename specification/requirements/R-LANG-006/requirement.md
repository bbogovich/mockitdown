---
id: R-LANG-006
title: Expressions and operators
status: active
version: 0.2.1
rev: 1
page: LANG.1
slot: reqs
order: 6
source: [SRC-2]
realizes: [F-2]
constrained_by: [A-SYN-2]
decisions: [ADR-2]
reverse_engineered: true
hash: 35a1a1107812
---

C1: The parser MUST give operators this precedence, loosest first, all binary levels left-associative: ternary `?:`; logical or (two vertical bars); `&&`; `==` `!=` `<` `>` `<=` `>=`; `...` `..<`; `+` `-`; `*` `/`; prefix `!` and `-`; postfix member access, calls, subscripts and trailing closures.
C2: The parser MUST allow line feeds after a binary operator and around the `?` and `:` of a ternary.
C3: The parser MUST accept as primary expressions: number, string, `true`, `false`, `nil`, an identifier, an implicit member `.name`, an array or dictionary literal, a parenthesised expression or tuple, a closure, a key path `\.a.b` or `\Type.a`, and `$name`.
C4: The parser MUST parse `$name` as the identifier `name`, so a SwiftUI binding evaluates to the bound value.
C5: The parser MUST ignore a postfix `!` (force unwrap) that is not followed by an identifier.
C6: The parser MUST accept a keyword as a member name after `.` (as in `.default`).
C7: If no primary expression can start at the current token, then the parser MUST raise "expected an expression, found …" naming the token or "end of input".
C8: The parser MUST accept an unsigned integer literal as a member name after `.`, so a tuple element is written `t.0`.
V1: `a or b && c == d` (with the or-operator) groups as `a or (b && (c == d))`; `x ? "on" : "off"` spans three lines; `$isOn` evaluates as `isOn`.
